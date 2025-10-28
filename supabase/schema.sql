-- Shift_M Database Schema
-- 作�E日: 2025-10-25

-- ==================== チE�Eブル削除�E�既存�E場合！E====================
DROP TABLE IF EXISTS shifts CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS ai_constraint_guidelines CASCADE;
DROP TABLE IF EXISTS workplaces CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS shift_patterns CASCADE;

-- ==================== ENUM型定義 ====================
DO $$ BEGIN
    CREATE TYPE employment_type AS ENUM ('常勤', 'パ�EチE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_type AS ENUM ('看護師', '臨床検査技師');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE facility_type AS ENUM ('クリニック棁E, '健診棁E);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE time_slot AS ENUM ('AM', 'PM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE day_of_week AS ENUM ('月', '火', '水', '木', '金', '土', '日');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_type AS ENUM ('希望企E, '有企E, '忌弁E, '痁E��', 'そ�E仁E, '出勤可能');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('申請中', '承誁E, '却丁E);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shift_status AS ENUM ('draft', 'confirmed', 'modified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==================== シフトパターンチE�Eブル ====================
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

-- シフトパターンのインチE��クス
CREATE INDEX idx_shift_patterns_active ON shift_patterns(is_active);

-- ==================== 従業員チE�Eブル ====================
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

-- 従業員のインチE��クス
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_employees_employment_type ON employees(employment_type);
CREATE INDEX idx_employees_job_type ON employees(job_type);
CREATE INDEX idx_employees_name ON employees(name);

-- ==================== 配置場所チE�Eブル ====================
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

-- 配置場所のインチE��クス
CREATE INDEX idx_workplaces_active ON workplaces(is_active);
CREATE INDEX idx_workplaces_day ON workplaces(day_of_week);
CREATE INDEX idx_workplaces_facility ON workplaces(facility);
CREATE INDEX idx_workplaces_order ON workplaces(order_index);

-- 配置場所のユニ�Eク制紁E��同じ曜日・時間帯・施設・名前の絁E��合わせ�E不可�E�E
CREATE UNIQUE INDEX idx_workplaces_unique ON workplaces(name, facility, time_slot, day_of_week) WHERE is_active = TRUE;

-- ==================== シフトチE�Eブル ====================
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- シフトパターンID
    shift_pattern_id UUID REFERENCES shift_patterns(id) ON DELETE SET NULL,

    -- 配置場所�E�名前で保存！E
    am_workplace VARCHAR(100),
    pm_workplace VARCHAR(100),

    -- カスタム時間
    custom_start_time TIME,
    custom_end_time TIME,

    -- 休み惁E��
    is_rest BOOLEAN DEFAULT FALSE,
    rest_reason TEXT,

    status shift_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- シフトのインチE��クス
CREATE INDEX idx_shifts_employee ON shifts(employee_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_employee_date ON shifts(employee_id, date);

-- シフトのユニ�Eク制紁E��同じ従業員・日付�E絁E��合わせ�E不可�E�E
CREATE UNIQUE INDEX idx_shifts_unique ON shifts(employee_id, date);

-- ==================== 希望休テーブル ====================
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    leave_type leave_type NOT NULL,
    reason TEXT,
    status request_status DEFAULT '申請中',
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 希望休�EインチE��クス
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_date ON leave_requests(date);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_employee_date ON leave_requests(employee_id, date);

-- ==================== AI制紁E��イドラインチE�Eブル ====================
CREATE TABLE ai_constraint_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constraint_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI制紁E�EインチE��クス
CREATE INDEX idx_constraints_active ON ai_constraint_guidelines(is_active);


-- ==================== 更新日時�E動更新トリガー ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 吁E��ーブルにトリガーを設宁E
CREATE TRIGGER update_shift_patterns_updated_at BEFORE UPDATE ON shift_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workplaces_updated_at BEFORE UPDATE ON workplaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_constraints_updated_at BEFORE UPDATE ON ai_constraint_guidelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== Row Level Security (RLS) の有効匁E====================
ALTER TABLE shift_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE workplaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_constraint_guidelines ENABLE ROW LEVEL SECURITY;

-- ==================== RLSポリシー�E��Eユーザーがアクセス可能�E�E====================
-- 本番環墁E��は適刁E��認証・認可ポリシーに変更してください

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

-- ==================== コメンチE====================
COMMENT ON TABLE shift_patterns IS 'シフトパターン�E�早番、E��番、パートなど�E�E;
COMMENT ON TABLE employees IS '従業員惁E��';
COMMENT ON TABLE workplaces IS '配置場所�E�曜日・時間帯別の配置先！E;
COMMENT ON TABLE shifts IS 'シフト割当（従業員×日付！E;
COMMENT ON TABLE leave_requests IS '希望休�E休暇申諁E;
COMMENT ON TABLE ai_constraint_guidelines IS 'AIシフト生�E用の制紁E��イドライン';

COMMENT ON COLUMN employees.assignable_workplaces_by_day IS '曜日ごとのアサイン可能な配置場所リスト！ESONB: Record<string, string[]>�E�E;
COMMENT ON COLUMN employees.assignable_shift_pattern_ids IS 'アサイン可能なシフトパターンIDの配�E';
COMMENT ON COLUMN employees.day_constraints IS '曜日間�E制紁E��件�E�ESONB: Array<{if: string, then: string}>�E�E;
COMMENT ON COLUMN workplaces.order_index IS '表示頁E��（�E頁E��E;
COMMENT ON COLUMN shifts.shift_pattern_id IS '使用するシフトパターン�E�EULLの場合�Eカスタム時間を使用�E�E;
COMMENT ON COLUMN shifts.am_workplace IS 'AM配置場所吁E;
COMMENT ON COLUMN shifts.pm_workplace IS 'PM配置場所吁E;


