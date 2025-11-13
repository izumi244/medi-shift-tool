-- Migration: 重複しているorder_indexを修正
-- 作成日: 2025-11-13
-- 説明: order_indexが重複している従業員を修正し、順番に連番を振り直す

-- ==================== 重複修正 ====================
-- 全ての従業員にorder_indexを順番に振り直す（created_at昇順）
WITH ranked_employees AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY
      CASE WHEN order_index = 0 OR order_index IS NULL THEN 1 ELSE 0 END,
      order_index ASC,
      created_at ASC
    ) as new_order_index
  FROM employees
  WHERE is_active = true
)
UPDATE employees
SET order_index = ranked_employees.new_order_index
FROM ranked_employees
WHERE employees.id = ranked_employees.id;

-- 確認クエリ
SELECT id, name, order_index, created_at
FROM employees
WHERE is_active = true
ORDER BY order_index;
