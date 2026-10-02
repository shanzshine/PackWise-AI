-- PackWise ML feedback memory
-- Safe migration: creates new objects and adds columns without deleting data.

CREATE TABLE IF NOT EXISTS public.ml_feedback_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_req_id TEXT NOT NULL UNIQUE,
    reviewer_id UUID,
    decision_status TEXT NOT NULL CHECK (decision_status IN ('Approved', 'Rejected')),
    reason_category TEXT NOT NULL CHECK (reason_category IN (
        'safety', 'pose', 'accessory', 'material', 'cost', 'assembly', 'other'
    )),
    reason_text TEXT NOT NULL CHECK (char_length(trim(reason_text)) >= 5),
    product_features JSONB NOT NULL,
    original_prediction JSONB NOT NULL,
    corrected_prediction JSONB NOT NULL,
    model_version TEXT,
    eligible_for_runtime BOOLEAN NOT NULL DEFAULT FALSE,
    runtime_weight NUMERIC NOT NULL DEFAULT 1.0 CHECK (runtime_weight > 0 AND runtime_weight <= 1),
    test_outcome JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ml_feedback_runtime_lookup
    ON public.ml_feedback_memory (eligible_for_runtime, decision_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ml_feedback_product_family
    ON public.ml_feedback_memory ((product_features->>'product_family'));

CREATE INDEX IF NOT EXISTS idx_ml_feedback_pose
    ON public.ml_feedback_memory ((product_features->>'pose'));

ALTER TABLE IF EXISTS public.approval ADD COLUMN IF NOT EXISTS reviewer_feedback TEXT;
ALTER TABLE IF EXISTS public.approval ADD COLUMN IF NOT EXISTS feedback_reason_category TEXT;
ALTER TABLE IF EXISTS public.approval ADD COLUMN IF NOT EXISTS original_ml_prediction JSONB;
ALTER TABLE IF EXISTS public.approval ADD COLUMN IF NOT EXISTS corrected_recommendation JSONB;
ALTER TABLE IF EXISTS public.approval ADD COLUMN IF NOT EXISTS feedback_saved_at TIMESTAMPTZ;

ALTER TABLE public.ml_feedback_memory ENABLE ROW LEVEL SECURITY;

-- Development policies matching the repository's existing Supabase setup.
-- Replace these with authenticated role policies before production.
DROP POLICY IF EXISTS "Allow feedback reads" ON public.ml_feedback_memory;
CREATE POLICY "Allow feedback reads"
    ON public.ml_feedback_memory FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow feedback inserts" ON public.ml_feedback_memory;
CREATE POLICY "Allow feedback inserts"
    ON public.ml_feedback_memory FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow feedback updates" ON public.ml_feedback_memory;
CREATE POLICY "Allow feedback updates"
    ON public.ml_feedback_memory FOR UPDATE USING (true) WITH CHECK (true);

-- Runtime retrieval only sees manager-approved memories.
CREATE OR REPLACE VIEW public.runtime_ml_feedback AS
SELECT
    id,
    approval_req_id,
    reason_category,
    reason_text,
    product_features,
    corrected_prediction,
    model_version,
    runtime_weight,
    test_outcome,
    created_at
FROM public.ml_feedback_memory
WHERE decision_status = 'Approved'
  AND eligible_for_runtime = TRUE;

GRANT SELECT ON public.runtime_ml_feedback TO anon, authenticated;

-- Clean export surface for the next controlled model retraining cycle.
CREATE OR REPLACE VIEW public.ml_training_examples AS
SELECT
    approval_req_id,
    product_features,
    original_prediction,
    corrected_prediction,
    reason_category,
    reason_text,
    test_outcome,
    model_version,
    created_at
FROM public.ml_feedback_memory
WHERE decision_status = 'Approved';

GRANT SELECT ON public.ml_training_examples TO authenticated;

-- Verification query after running this migration:
-- SELECT approval_req_id, reason_category, corrected_prediction, eligible_for_runtime
-- FROM public.ml_feedback_memory
-- ORDER BY created_at DESC;
