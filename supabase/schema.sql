-- Shift_M Database Schema
-- 菴懈・譌･: 2025-10-25

-- ==================== 繝・・繝悶Ν蜑企勁・域里蟄倥・蝣ｴ蜷茨ｼ・====================
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS ai_constraint_guidelines CASCADE;
DROP TABLE IF EXISTS workplaces CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS shift_patterns CASCADE;

-- ==================== ENUM蝙句ｮ夂ｾｩ ====================
DO $$ BEGIN
    CREATE TYPE employment_type AS ENUM ('蟶ｸ蜍､', '繝代・繝・);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_type AS ENUM ('逵玖ｭｷ蟶ｫ', '閾ｨ蠎頑､懈渊謚蟶ｫ');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE facility_type AS ENUM ('繧ｯ繝ｪ繝九ャ繧ｯ譽・, '蛛･險ｺ譽・);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE time_slot AS ENUM ('AM', 'PM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_type AS ENUM ('蟶梧悍莨・, '譛我ｼ・, '蠢悟ｼ・, '逞・ｬ', '縺昴・莉・, '蜃ｺ蜍､蜿ｯ閭ｽ');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('逕ｳ隲倶ｸｭ', '謇ｿ隱・, '蜊ｴ荳・);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shift_status AS ENUM ('draft', 'confirmed', 'modified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==================== 繧ｷ繝輔ヨ繝代ち繝ｼ繝ｳ繝・・繝悶Ν ====================
CREATE TABLE shift_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(7) NOT NULL DEFAULT '#e0e7ff', -- HEX color code
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 繧ｷ繝輔ヨ繝代ち繝ｼ繝ｳ縺ｮ繧､繝ｳ繝・ャ繧ｯ繧ｹ
CREATE INDEX idx_shift_patterns_active ON shift_patterns(is_active);

-- ==================== 蠕捺･ｭ蜩｡繝・・繝悶Ν ====================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    employment_type employment_type NOT NULL,
    job_type job_type NOT NULL,
    assignable_workplaces_by_day JSONB NOT NULL DEFAULT '{}', -- Record<string, string[]>
    assignable_shift_pattern_ids UUID[] NOT NULL DEFAULT '{}',
    day_constraints JSONB NOT NULL DEFAULT '[]', -- Array<{if: string, then: string}>
    available_days TEXT[] NOT NULL DEFAULT '{}', -- ['monday', 'tuesday', ...]
    phone VARCHAR(20),
    email VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 蠕捺･ｭ蜩｡縺ｮ繧､繝ｳ繝・ャ繧ｯ繧ｹ
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_employees_employment_type ON employees(employment_type);
CREATE INDEX idx_employees_job_type ON employees(job_type);
CREATE INDEX idx_employees_name ON employees(name);

-- ==================== 驟咲ｽｮ蝣ｴ謇繝・・繝悶Ν ====================
CREATE TABLE workplaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    facility facility_type NOT NULL,
    time_slot time_slot NOT NULL,
    day_of_week day_of_week NOT NULL,
    required_count INTEGER NOT NULL DEFAULT 1,
    remarks TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 驟咲ｽｮ蝣ｴ謇縺ｮ繧､繝ｳ繝・ャ繧ｯ繧ｹ
CREATE INDEX idx_workplaces_active ON workplaces(is_active);
CREATE INDEX idx_workplaces_day ON workplaces(day_of_week);
CREATE INDEX idx_workplaces_facility ON workplaces(facility);
CREATE INDEX idx_workplaces_order ON workplaces(order_index);

-- 驟咲ｽｮ蝣ｴ謇縺ｮ繝ｦ繝九・繧ｯ蛻ｶ邏・ｼ亥酔縺俶屆譌･繝ｻ譎る俣蟶ｯ繝ｻ譁ｽ險ｭ繝ｻ蜷榊燕縺ｮ邨・∩蜷医ｏ縺帙・荳榊庄・・
CREATE UNIQUE INDEX idx_workplaces_unique ON workplaces(name, facility, time_slot, day_of_week) WHERE is_active = TRUE;

-- ==================== 繧ｷ繝輔ヨ繝・・繝悶Ν ====================
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- 繧ｷ繝輔ヨ繝代ち繝ｼ繝ｳID
    shift_pattern_id UUID REFERENCES shift_patterns(id) ON DELETE SET NULL,

    -- 驟咲ｽｮ蝣ｴ謇・亥錐蜑阪〒菫晏ｭ假ｼ・
    am_workplace VARCHAR(100),
    pm_workplace VARCHAR(100),

    -- 繧ｫ繧ｹ繧ｿ繝譎る俣
    custom_start_time TIME,
    custom_end_time TIME,

    -- 莨代∩諠・ｱ
    is_rest BOOLEAN DEFAULT FALSE,
    rest_reason TEXT,

    status shift_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 繧ｷ繝輔ヨ縺ｮ繧､繝ｳ繝・ャ繧ｯ繧ｹ
CREATE INDEX idx_shifts_employee ON shifts(employee_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_employee_date ON shifts(employee_id, date);

-- 繧ｷ繝輔ヨ縺ｮ繝ｦ繝九・繧ｯ蛻ｶ邏・ｼ亥酔縺伜ｾ捺･ｭ蜩｡繝ｻ譌･莉倥・邨・∩蜷医ｏ縺帙・荳榊庄・・
CREATE UNIQUE INDEX idx_shifts_unique ON shifts(employee_id, date);

-- ==================== 蟶梧悍莨代ユ繝ｼ繝悶Ν ====================
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    leave_type leave_type NOT NULL,
    reason TEXT,
    status request_status DEFAULT '逕ｳ隲倶ｸｭ',
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 蟶梧悍莨代・繧､繝ｳ繝・ャ繧ｯ繧ｹ
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_date ON leave_requests(date);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_employee_date ON leave_requests(employee_id, date);

-- ==================== AI蛻ｶ邏・ぎ繧､繝峨Λ繧､繝ｳ繝・・繝悶Ν ====================
CREATE TABLE ai_constraint_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constraint_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI蛻ｶ邏・・繧､繝ｳ繝・ャ繧ｯ繧ｹ
CREATE INDEX idx_constraints_active ON ai_constraint_guidelines(is_active);


-- ==================== 譖ｴ譁ｰ譌･譎り・蜍墓峩譁ｰ繝医Μ繧ｬ繝ｼ ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 蜷・ユ繝ｼ繝悶Ν縺ｫ繝医Μ繧ｬ繝ｼ繧定ｨｭ螳・
CREATE TRIGGER update_shift_patterns_updated_at BEFORE UPDATE ON shift_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workplaces_updated_at BEFORE UPDATE ON workplaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_constraints_updated_at BEFORE UPDATE ON ai_constraint_guidelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== Row Level Security (RLS) 縺ｮ譛牙柑蛹・====================
ALTER TABLE shift_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE workplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_constraint_guidelines ENABLE ROW LEVEL SECURITY;

-- ==================== RLS繝昴Μ繧ｷ繝ｼ・亥・繝ｦ繝ｼ繧ｶ繝ｼ縺後い繧ｯ繧ｻ繧ｹ蜿ｯ閭ｽ・・====================
-- 譛ｬ逡ｪ迺ｰ蠅・〒縺ｯ驕ｩ蛻・↑隱崎ｨｼ繝ｻ隱榊庄繝昴Μ繧ｷ繝ｼ縺ｫ螟画峩縺励※縺上□縺輔＞

CREATE POLICY "Enable read access for all users" ON shift_patterns FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON shift_patterns FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON shift_patterns FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON shift_patterns FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON employees FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON employees FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON employees FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON workplaces FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON workplaces FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON workplaces FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON workplaces FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON shifts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON shifts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON shifts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON shifts FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON leave_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON leave_requests FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON leave_requests FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON ai_constraint_guidelines FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON ai_constraint_guidelines FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON ai_constraint_guidelines FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON ai_constraint_guidelines FOR DELETE USING (true);

-- ==================== 繧ｳ繝｡繝ｳ繝・====================
COMMENT ON TABLE shift_patterns IS '繧ｷ繝輔ヨ繝代ち繝ｼ繝ｳ・域掠逡ｪ縲・≦逡ｪ縲√ヱ繝ｼ繝医↑縺ｩ・・;
COMMENT ON TABLE employees IS '蠕捺･ｭ蜩｡諠・ｱ';
COMMENT ON TABLE workplaces IS '驟咲ｽｮ蝣ｴ謇・域屆譌･繝ｻ譎る俣蟶ｯ蛻･縺ｮ驟咲ｽｮ蜈茨ｼ・;
COMMENT ON TABLE shifts IS '繧ｷ繝輔ヨ蜑ｲ蠖難ｼ亥ｾ捺･ｭ蜩｡ﾃ玲律莉假ｼ・;
COMMENT ON TABLE leave_requests IS '蟶梧悍莨代・莨第嚊逕ｳ隲・;
COMMENT ON TABLE ai_constraint_guidelines IS 'AI繧ｷ繝輔ヨ逕滓・逕ｨ縺ｮ蛻ｶ邏・ぎ繧､繝峨Λ繧､繝ｳ';

COMMENT ON COLUMN employees.assignable_workplaces_by_day IS '譖懈律縺斐→縺ｮ繧｢繧ｵ繧､繝ｳ蜿ｯ閭ｽ縺ｪ驟咲ｽｮ蝣ｴ謇繝ｪ繧ｹ繝茨ｼ・SONB: Record<string, string[]>・・;
COMMENT ON COLUMN employees.assignable_shift_pattern_ids IS '繧｢繧ｵ繧､繝ｳ蜿ｯ閭ｽ縺ｪ繧ｷ繝輔ヨ繝代ち繝ｼ繝ｳID縺ｮ驟榊・';
COMMENT ON COLUMN employees.day_constraints IS '譖懈律髢薙・蛻ｶ邏・擅莉ｶ・・SONB: Array<{if: string, then: string}>・・;
COMMENT ON COLUMN workplaces.order_index IS '陦ｨ遉ｺ鬆・ｺ擾ｼ域・鬆・ｼ・;
COMMENT ON COLUMN shifts.shift_pattern_id IS '菴ｿ逕ｨ縺吶ｋ繧ｷ繝輔ヨ繝代ち繝ｼ繝ｳ・・ULL縺ｮ蝣ｴ蜷医・繧ｫ繧ｹ繧ｿ繝譎る俣繧剃ｽｿ逕ｨ・・;
COMMENT ON COLUMN shifts.am_workplace IS 'AM驟咲ｽｮ蝣ｴ謇蜷・;
COMMENT ON COLUMN shifts.pm_workplace IS 'PM驟咲ｽｮ蝣ｴ謇蜷・;


