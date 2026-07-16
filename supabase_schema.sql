-- 1. Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS risk_assessments CASCADE;
DROP TABLE IF EXISTS packaging_plans CASCADE;
DROP TABLE IF EXISTS product_analyses CASCADE;
DROP TABLE IF EXISTS risk_triggered_rule CASCADE;
DROP TABLE IF EXISTS risk_movement_by_region CASCADE;
DROP TABLE IF EXISTS risk_accessory_item CASCADE;
DROP TABLE IF EXISTS risk_assessment CASCADE;
DROP TABLE IF EXISTS packaging_plan CASCADE;
DROP TABLE IF EXISTS approval CASCADE;

-- 2. Create product_analyses table (Step 1: Input & Generate)
CREATE TABLE product_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    product_name TEXT,
    product_family TEXT,
    articulation TEXT,
    pose TEXT,
    weight_g NUMERIC,
    height_cm NUMERIC,
    center_of_gravity TEXT,
    hair_length TEXT,
    dress_length TEXT,
    accessory_count INTEGER,
    accessory_weight_g NUMERIC,
    selected_accessories JSONB,
    image_url TEXT,
    annotated_image_url TEXT,
    ml_outputs JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create packaging_plans table (Step 2: Attachment Planner)
CREATE TABLE packaging_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID REFERENCES product_analyses(id) ON DELETE CASCADE,
    total_cost NUMERIC,
    total_labor_mins NUMERIC,
    avg_sustainability NUMERIC,
    zones JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create risk_assessments table (Step 3: Risk Engine Evaluation)
CREATE TABLE risk_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID REFERENCES packaging_plans(id) ON DELETE CASCADE,
    overall_risk_level TEXT,
    drop_test_risk_pct NUMERIC,
    movement_risk_pct NUMERIC,
    accessory_loss_risk_pct NUMERIC,
    triggered_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create approval_requests table (Step 4: Manager Approval Submission)
CREATE TABLE approval_requests (
    req_id TEXT PRIMARY KEY,
    assessment_id UUID REFERENCES risk_assessments(id) ON DELETE CASCADE,
    sku TEXT,
    engineer_name TEXT,
    pe_id UUID,
    risk_level TEXT,
    est_cost TEXT,
    labor_time TEXT,
    sustainability NUMERIC,
    status TEXT,
    report_snapshot JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) but allow all operations for development
ALTER TABLE product_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON product_analyses FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON packaging_plans FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON risk_assessments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON approval_requests FOR ALL USING (true);

-- 7. Ensure Storage Bucket exists for product images
-- (This statement assumes the auth bypass / superuser or runs safely if it exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Give public access to product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Allow uploads to product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Allow updates to product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Allow deletes to product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
