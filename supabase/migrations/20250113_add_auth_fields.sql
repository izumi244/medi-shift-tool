-- Add authentication fields to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS employee_number VARCHAR(10) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS session_token TEXT,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_system_account BOOLEAN DEFAULT FALSE;

-- Create employee_sequences table for auto-incrementing employee numbers
CREATE TABLE IF NOT EXISTS employee_sequences (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial sequence record
INSERT INTO employee_sequences (id, last_number)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Create index on employee_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_employee_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_session_token ON employees(session_token);

-- Add comment
COMMENT ON COLUMN employees.employee_number IS 'Auto-generated employee number (emp001, emp002, ...)';
COMMENT ON COLUMN employees.password_hash IS 'bcrypt hashed password';
COMMENT ON COLUMN employees.password_changed IS 'Whether user has changed initial password';
COMMENT ON COLUMN employees.session_token IS 'Session token for authentication';
COMMENT ON COLUMN employees.is_system_account IS 'System account flag (admin/developer)';
