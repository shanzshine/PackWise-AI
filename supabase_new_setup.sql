-- ================================================================
-- PackWise AI — Full Schema Setup (Supabase Baru + Cloudinary)
-- ================================================================
-- Jalankan SATU KALI di: Supabase Dashboard → SQL Editor → New Query
--
-- Yang ada di sini:
--   - Semua tabel lengkap (app_user, product_families, accessories,
--     product_analyses, packaging_plan, approval)
--   - Kolom foto menyimpan URL Cloudinary (bukan Supabase Storage)
--   - Data master yang harus tetap ada (accessories, product families, users)
--   - RLS policies + Auth trigger
-- ================================================================


-- ──────────────────────────────────────────────────────────────
-- STEP 1: Bersihkan tabel lama (jika ada)
-- ──────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS approval        CASCADE;
DROP TABLE IF EXISTS packaging_plan  CASCADE;
DROP TABLE IF EXISTS product_analyses CASCADE;
DROP TABLE IF EXISTS accessories     CASCADE;
DROP TABLE IF EXISTS product_families CASCADE;
DROP TABLE IF EXISTS app_user        CASCADE;


-- ──────────────────────────────────────────────────────────────
-- STEP 2: Tabel MASTER — app_user
-- Primary key sengaja UUID biasa (bukan FK ke auth.users)
-- supaya kita bisa restore data backup tanpa error constraint.
-- Backend/trigger tetap akan menghubungkan keduanya saat login.
-- ──────────────────────────────────────────────────────────────
CREATE TABLE app_user (
  user_id            UUID         PRIMARY KEY,
  email              TEXT         UNIQUE NOT NULL,
  name               TEXT,
  role               TEXT         DEFAULT 'engineer',
  must_change_password BOOLEAN    DEFAULT false,
  company            TEXT,
  created_by         TEXT,
  created_at         TIMESTAMPTZ  DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- STEP 3: Tabel MASTER — product_families
-- ──────────────────────────────────────────────────────────────
CREATE TABLE product_families (
  id                 UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  product_family     TEXT,
  articulation       TEXT,
  default_height_cm  NUMERIC,
  default_weight_max NUMERIC,
  created_at         TIMESTAMPTZ  DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- STEP 4: Tabel MASTER — accessories
-- ──────────────────────────────────────────────────────────────
CREATE TABLE accessories (
  id             UUID     DEFAULT gen_random_uuid() PRIMARY KEY,
  accessory_name TEXT,
  weight_g       NUMERIC,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- STEP 5: Tabel TRANSAKSI — product_analyses
-- Kolom foto = image_url & annotated_image_url (Cloudinary URL)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE product_analyses (
  id                        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                   UUID        REFERENCES app_user(user_id) ON DELETE SET NULL,
  product_name              TEXT,
  product_family            TEXT,
  category                  TEXT,
  articulation              TEXT,
  pose                      TEXT,
  product_weight_g          NUMERIC,
  height_cm                 NUMERIC,
  center_of_gravity         TEXT,
  hair_length               TEXT,
  dress_length              TEXT,
  accessory_count           INTEGER,
  accessory_weight_g        NUMERIC,
  selected_accessories      TEXT[],
  -- Skor dari ML / rule engine
  pose_complexity_score     NUMERIC,
  pose_stability_score      NUMERIC,
  movement_risk_score       NUMERIC,
  accessory_loss_risk       NUMERIC,
  -- Computed fields
  body_regions              TEXT[],
  computed_height           TEXT,
  computed_complexity       TEXT,
  computed_cog              TEXT,
  -- JSONB outputs
  attachment_zones          JSONB,
  cv_detections             JSONB,
  pose_status               JSONB,
  ml_outputs                JSONB,
  -- Foto disimpan sebagai Cloudinary URL (bukan Supabase Storage path)
  image_url                 TEXT,
  annotated_image_url       TEXT,
  -- Timestamps
  analysed_at               TIMESTAMPTZ DEFAULT NOW(),
  created_at                TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- STEP 6: Tabel TRANSAKSI — packaging_plan
-- ──────────────────────────────────────────────────────────────
CREATE TABLE packaging_plan (
  plan_id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  pe_id                 UUID    REFERENCES app_user(user_id) ON DELETE SET NULL,
  analysis_id           UUID    REFERENCES product_analyses(id) ON DELETE CASCADE,
  zones                 JSONB,
  total_cost            NUMERIC,
  avg_stability         NUMERIC,
  avg_sustainability    NUMERIC,
  recommended_material  TEXT,
  assembly_time_seconds NUMERIC,
  assembly_breakdown    TEXT,
  is_complex_pose       BOOLEAN,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- STEP 7: Tabel TRANSAKSI — approval
-- ──────────────────────────────────────────────────────────────
CREATE TABLE approval (
  approval_id      UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id          UUID    REFERENCES packaging_plan(plan_id) ON DELETE CASCADE,
  pm_id            UUID    REFERENCES app_user(user_id) ON DELETE SET NULL,
  req_id           TEXT    UNIQUE,
  sku              TEXT,
  engineer_name    TEXT,
  pe_id            UUID    REFERENCES app_user(user_id) ON DELETE SET NULL,
  risk_level       TEXT,
  est_cost         TEXT,
  labor_time       TEXT,
  sustainability   NUMERIC,
  status           TEXT    DEFAULT 'Pending',
  decided_at       TIMESTAMPTZ,
  report_snapshot  JSONB,
  submitted_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- STEP 8: Row Level Security (RLS)
-- Pakai policy USING (true) supaya semua role bisa akses.
-- Keamanan sesungguhnya dijaga lewat anon key vs service key
-- di backend FastAPI kamu.
-- ──────────────────────────────────────────────────────────────
ALTER TABLE app_user          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_families  ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analyses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_plan    ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON app_user         FOR ALL USING (true);
CREATE POLICY "Allow all" ON product_families FOR ALL USING (true);
CREATE POLICY "Allow all" ON accessories      FOR ALL USING (true);
CREATE POLICY "Allow all" ON product_analyses FOR ALL USING (true);
CREATE POLICY "Allow all" ON packaging_plan   FOR ALL USING (true);
CREATE POLICY "Allow all" ON approval         FOR ALL USING (true);


-- ──────────────────────────────────────────────────────────────
-- STEP 9: Auth Trigger
-- Saat Admin buat akun baru lewat Supabase Auth (backend),
-- data user otomatis masuk ke tabel app_user.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.app_user (user_id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'engineer')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ================================================================
-- STEP 10: INSERT MASTER DATA (Data yang harus tetap ada)
-- ================================================================

-- A. Product Families (dari backup)
INSERT INTO product_families (id, product_family, articulation, default_height_cm, default_weight_max) VALUES
  ('9b84fb2a-f860-4dd4-acea-f43a11da484d', 'Dreamtopia',  'Standard',    29.0, 120.0),
  ('c0de9bbe-db37-4e14-859f-b5a07862bb22', 'Fashionistas', 'Standard',   29.0, 120.0),
  ('4457cc92-c246-41a7-b1f3-301bbb89d9b2', 'Careers',      'Standard',   29.0, 120.0),
  ('d0ac277b-c59c-4fc2-84e4-8c335355223c', 'Signature',    'Standard',   29.0, 130.0),
  ('1765ef67-d558-4249-bf0f-fd27e69f73c8', 'Extra',        'Standard',   29.0, 125.0),
  ('c4635e23-c671-4937-a538-0a6326f46e41', 'Made to Move', 'Made to Move', 29.0, 135.0)
ON CONFLICT (id) DO NOTHING;


-- B. Accessories (dari backup)
INSERT INTO accessories (id, accessory_name, weight_g) VALUES
  ('a47cf816-45ac-43b0-9337-41971079b242', 'Handbag',       15.0),
  ('20550d22-5fc7-4b43-bc0b-53cff8308c55', 'Shoes (Pair)',  10.0),
  ('0b4d5379-6788-4f5b-8997-baa7dff0bdff', 'Sunglasses',    5.0),
  ('ac42a0ec-943c-4e1b-abd0-87d34ea9dd4f', 'Hat',           20.0),
  ('3ae3114c-0646-4cbc-ab8d-5b511b3c9a64', 'Necklace',      2.0),
  ('2be03490-0720-4737-a23b-32e26247f92e', 'Brush',         8.0),
  ('00536bbf-0178-428e-9d9c-eede761efb3e', 'Backpack',      25.0),
  ('6a8fd358-7fa1-48e9-99fe-67269adb4503', 'Pet Dog',       50.0),
  ('ccfa6130-83c2-4fd6-8ca2-992922e3b35e', 'Pet Cage',      30.0)
ON CONFLICT (id) DO NOTHING;


-- C. Users (dari backup — restore dengan UUID yang sama persis)
-- CATATAN: Akun ini harus juga kamu buat ulang di Supabase Auth
--          lewat Dashboard atau lewat endpoint /auth/create-user
--          agar bisa login. INSERT ini hanya untuk data profil.
INSERT INTO app_user (user_id, email, name, role, must_change_password) VALUES
  ('683405bf-c29b-4d02-bb00-5b109c1cd4d1', 'nasywa.admin@packwise.demo', 'Nasywa',       'Admin',              false),
  ('31796fdc-5118-4188-b60e-07126d129cfe', 'test.pm@packwise.demo',      'Test',         'Product Manager',    true),
  ('2a834efa-fbcd-463b-b9d5-e36171117012', 'shanty.pm@packwise.demo',    'Shanty',       'Product Manager',    false),
  ('e38192b3-2cdf-498f-b630-7ee172900c9b', 'nina.pe@packwise.demo',      'Nina',         'Packaging Engineer', false),
  ('b872ca06-6e31-41f0-91aa-f77cbc7f5d95', 'cristine.pe@packwise.demo',  'Cristine (PE)','Packaging Engineer', false)
ON CONFLICT (user_id) DO NOTHING;


-- ================================================================
-- VERIFIKASI — jalankan ini setelah semua berhasil
-- ================================================================
SELECT table_name, COUNT(*) as row_count
FROM (
  SELECT 'app_user'         as table_name FROM app_user
  UNION ALL
  SELECT 'product_families' FROM product_families
  UNION ALL
  SELECT 'accessories'      FROM accessories
) t
GROUP BY table_name
ORDER BY table_name;
