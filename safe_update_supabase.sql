-- ================================================================
-- PackWise AI — Safe Supabase Migration & Update Script
-- ================================================================
-- AMAN untuk dijalankan di Supabase SQL Editor.
-- Script ini TIDAK AKAN MENGHAPUS (DROP) tabel atau data yang sudah dibuat temanmu.
-- Script ini hanya menambahkan kolom yang kurang, membuat tabel risk_assessments, 
-- dan memasang Auth Trigger serta RLS Policy.
-- ================================================================

-- 1. TAMBAHKAN KOLOM YANG KURANG PADA TABEL app_user
ALTER TABLE public.app_user ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE public.app_user ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.app_user ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.app_user ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.app_user ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update must_change_password default untuk user baru jika belum ada
ALTER TABLE public.app_user ALTER COLUMN must_change_password SET DEFAULT false;


-- 2. BUAT TABEL risk_assessments (JIKA BELUM ADA)
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID REFERENCES public.product_analyses(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.packaging_plan(plan_id) ON DELETE CASCADE,
    overall_risk_level TEXT DEFAULT 'Low Risk',
    overall_score NUMERIC DEFAULT 85,
    drop_test_pass_pct NUMERIC DEFAULT 90,
    movement_risk_pct NUMERIC DEFAULT 15,
    accessory_loss_risk_pct NUMERIC DEFAULT 10,
    master_carton_10drop_status TEXT DEFAULT 'Pass',
    sioc_17drop_status TEXT DEFAULT 'Pass',
    failure_details TEXT,
    triggered_rules JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE public.app_user          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_families  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_analyses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_plan    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments  ENABLE ROW LEVEL SECURITY;

-- Policy (Allow all for app access)
DROP POLICY IF EXISTS "Allow all" ON public.app_user;
CREATE POLICY "Allow all" ON public.app_user FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all" ON public.product_families;
CREATE POLICY "Allow all" ON public.product_families FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all" ON public.accessories;
CREATE POLICY "Allow all" ON public.accessories FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all" ON public.product_analyses;
CREATE POLICY "Allow all" ON public.product_analyses FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all" ON public.packaging_plan;
CREATE POLICY "Allow all" ON public.packaging_plan FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all" ON public.approval;
CREATE POLICY "Allow all" ON public.approval FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all" ON public.risk_assessments;
CREATE POLICY "Allow all" ON public.risk_assessments FOR ALL USING (true);


-- 4. AUTH TRIGGER (Penting agar user baru dari Admin otomatis tersimpan di app_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.app_user (user_id, email, name, role, must_change_password)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'Packaging Engineer'),
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 5. VERIFIKASI KOLOM & TABEL
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('app_user', 'risk_assessments')
ORDER BY table_name, ordinal_position;
