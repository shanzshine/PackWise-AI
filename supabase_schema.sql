-- 1. Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS risk_triggered_rule;
DROP TABLE IF EXISTS risk_movement_by_region;
DROP TABLE IF EXISTS risk_accessory_item;
DROP TABLE IF EXISTS risk_assessment;
DROP TABLE IF EXISTS packaging_plan;

-- 2. Create the main risk_assessment table (without strict foreign key to avoid prototype crashes)
CREATE TABLE risk_assessment (
    assessment_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    rule_engine_version TEXT,
    overall_risk_level TEXT,
    drop_test_risk_pct NUMERIC,
    drop_test_pass_probability NUMERIC,
    movement_risk_pct NUMERIC,
    accessory_loss_risk_pct NUMERIC,
    input_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create table for triggered rules
CREATE TABLE risk_triggered_rule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID REFERENCES risk_assessment(assessment_id) ON DELETE CASCADE,
    category TEXT,
    rule_id TEXT,
    evidence_id TEXT,
    severity INTEGER,
    confidence TEXT,
    source_reference TEXT,
    explanation TEXT
);

-- 4. Create table for movement risks by region
CREATE TABLE risk_movement_by_region (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID REFERENCES risk_assessment(assessment_id) ON DELETE CASCADE,
    body_region TEXT,
    risk_percentage NUMERIC,
    risk_level TEXT,
    coverage NUMERIC
);

-- 5. Create table for accessory loss risks
CREATE TABLE risk_accessory_item (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assessment_id UUID REFERENCES risk_assessment(assessment_id) ON DELETE CASCADE,
    accessory_name TEXT,
    weight_g NUMERIC,
    loss_probability NUMERIC,
    risk_level TEXT,
    explanation TEXT
);

-- Enable Row Level Security (RLS) but allow all operations for the service key
ALTER TABLE risk_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_triggered_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_movement_by_region ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_accessory_item ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for service key" ON risk_assessment FOR ALL USING (true);
CREATE POLICY "Allow all operations for service key" ON risk_triggered_rule FOR ALL USING (true);
CREATE POLICY "Allow all operations for service key" ON risk_movement_by_region FOR ALL USING (true);
CREATE POLICY "Allow all operations for service key" ON risk_accessory_item FOR ALL USING (true);
