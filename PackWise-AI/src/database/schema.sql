create table attachment_methods (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    cost_per_gram decimal(10,4),
    weight_per_cm decimal(10,4),
    description text,
    created_at timestamp default now()
);

create table attachment_rules (
    id uuid primary key default gen_random_uuid(),
    min_score integer,
    max_score integer,
    attachment_type text,
    attachment_quantity integer,
    created_at timestamp default now()
);

create table recommendations (
    id uuid primary key default gen_random_uuid(),
    product_type text,
    complexity_score integer,
    recommended_pose text,
    attachment_type text,
    attachment_quantity integer,
    attachment_locations jsonb,
    created_at timestamp default now()
);

create table cost_analysis (
    id uuid primary key default gen_random_uuid(),
    recommendation_id uuid references recommendations(id),
    material_usage_gram decimal(10,4),
    estimated_cost decimal(10,4),
    current_packaging_cost decimal(10,4),
    optimized_packaging_cost decimal(10,4),
    saving_percentage decimal(10,2),
    created_at timestamp default now()
);

-- Tabel baru untuk menyimpan hasil YOLO Pose (17 titik COCO & status pose)
create table product_analyses (
    id uuid primary key default gen_random_uuid(),
    product_name text,
    detected_poses text[],
    raw_keypoints jsonb,
    created_at timestamp default now()
);