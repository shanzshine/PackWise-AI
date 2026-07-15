-- ================================================================
-- PackWise AI — FIXED Schema Migration
-- Sesuaikan dengan tabel yang SUDAH ADA di Supabase
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- ──────────────────────────────────────────────────────────────
-- 1. ALTER product_analyses — tambah kolom yang kurang
-- ──────────────────────────────────────────────────────────────
ALTER TABLE product_analyses
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS product_family TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS articulation TEXT,
  ADD COLUMN IF NOT EXISTS pose TEXT,
  ADD COLUMN IF NOT EXISTS product_weight_g NUMERIC,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS center_of_gravity TEXT,
  ADD COLUMN IF NOT EXISTS hair_length TEXT,
  ADD COLUMN IF NOT EXISTS dress_length TEXT,
  ADD COLUMN IF NOT EXISTS accessory_count INTEGER,
  ADD COLUMN IF NOT EXISTS accessory_weight_g NUMERIC,
  ADD COLUMN IF NOT EXISTS selected_accessories TEXT[],
  ADD COLUMN IF NOT EXISTS pose_complexity_score NUMERIC,
  ADD COLUMN IF NOT EXISTS pose_stability_score NUMERIC,
  ADD COLUMN IF NOT EXISTS movement_risk_score NUMERIC,
  ADD COLUMN IF NOT EXISTS accessory_loss_risk NUMERIC,
  ADD COLUMN IF NOT EXISTS body_regions TEXT[],
  ADD COLUMN IF NOT EXISTS computed_height TEXT,
  ADD COLUMN IF NOT EXISTS computed_complexity TEXT,
  ADD COLUMN IF NOT EXISTS computed_cog TEXT,
  ADD COLUMN IF NOT EXISTS attachment_zones JSONB,
  ADD COLUMN IF NOT EXISTS cv_detections JSONB,
  ADD COLUMN IF NOT EXISTS pose_status JSONB,
  ADD COLUMN IF NOT EXISTS image_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS annotated_image_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS analysed_at TIMESTAMPTZ DEFAULT NOW();

-- ──────────────────────────────────────────────────────────────
-- 2. ALTER packaging_plan — tambah kolom detail yang kurang
--    (tabel ini sudah ada dengan plan_id integer, pe_id uuid)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE packaging_plan
  ADD COLUMN IF NOT EXISTS analysis_id UUID REFERENCES product_analyses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS zones JSONB,
  ADD COLUMN IF NOT EXISTS total_cost NUMERIC,
  ADD COLUMN IF NOT EXISTS avg_stability NUMERIC,
  ADD COLUMN IF NOT EXISTS avg_sustainability NUMERIC,
  ADD COLUMN IF NOT EXISTS recommended_material TEXT,
  ADD COLUMN IF NOT EXISTS assembly_time_seconds NUMERIC,
  ADD COLUMN IF NOT EXISTS assembly_breakdown TEXT,
  ADD COLUMN IF NOT EXISTS is_complex_pose BOOLEAN;

-- ──────────────────────────────────────────────────────────────
-- 3. ALTER approval — tambah kolom yang dibutuhkan frontend
--    (tabel ini sudah ada dengan approval_id, plan_id, pm_id)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE approval
  ADD COLUMN IF NOT EXISTS req_id TEXT,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS engineer_name TEXT,
  ADD COLUMN IF NOT EXISTS pe_id UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS risk_level TEXT,
  ADD COLUMN IF NOT EXISTS est_cost TEXT,
  ADD COLUMN IF NOT EXISTS labor_time TEXT,
  ADD COLUMN IF NOT EXISTS sustainability NUMERIC,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS report_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();

-- ──────────────────────────────────────────────────────────────
-- 4. RLS — enable dan buat policy (pakai user_id yg baru ditambah)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE product_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_plan   ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval         ENABLE ROW LEVEL SECURITY;

-- product_analyses policies
DROP POLICY IF EXISTS "Users can view own analyses" ON product_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON product_analyses;
DROP POLICY IF EXISTS "Allow all for service role" ON product_analyses;
CREATE POLICY "Allow all for service role" ON product_analyses FOR ALL USING (true);

-- packaging_plan policies
DROP POLICY IF EXISTS "Users can view own plans" ON packaging_plan;
DROP POLICY IF EXISTS "Users can insert own plans" ON packaging_plan;
DROP POLICY IF EXISTS "Allow all for service role" ON packaging_plan;
CREATE POLICY "Allow all for service role" ON packaging_plan FOR ALL USING (true);

-- approval policies
DROP POLICY IF EXISTS "Allow all for service role" ON approval;
CREATE POLICY "Allow all for service role" ON approval FOR ALL USING (true);

-- ──────────────────────────────────────────────────────────────
-- 5. Verifikasi hasil — jalankan ini untuk konfirmasi
-- ──────────────────────────────────────────────────────────────
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('product_analyses', 'packaging_plan', 'approval')
ORDER BY table_name, ordinal_position;
