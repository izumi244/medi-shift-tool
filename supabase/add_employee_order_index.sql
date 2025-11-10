-- Migration: 従業員テーブルにorder_indexカラムを追加
-- 作成日: 2025-11-10
-- 説明: 従業員の表示順序をユーザーが変更できるようにする

-- ==================== カラム追加 ====================
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- ==================== インデックス作成 ====================
CREATE INDEX IF NOT EXISTS idx_employees_order ON employees(order_index);

-- ==================== 既存データの初期化 ====================
-- 既存の従業員にorder_indexを設定（created_atの昇順で番号付け）
WITH ranked_employees AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
  FROM employees
  WHERE order_index = 0 OR order_index IS NULL
)
UPDATE employees
SET order_index = ranked_employees.rn
FROM ranked_employees
WHERE employees.id = ranked_employees.id;

-- 確認クエリ（実行後に確認する場合）
-- SELECT id, name, order_index, created_at FROM employees ORDER BY order_index;
