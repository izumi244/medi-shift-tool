-- 重複した曜日を持つ従業員を確認

-- ステップ1: available_daysに重複がある従業員を見つける
SELECT
    id,
    name,
    available_days,
    array_length(available_days, 1) as total_days,
    (SELECT COUNT(DISTINCT d) FROM unnest(available_days) AS d) as unique_days
FROM employees
WHERE array_length(available_days, 1) != (SELECT COUNT(DISTINCT d) FROM unnest(available_days) AS d);

-- ステップ2: 重複を削除して修正
UPDATE employees
SET available_days = ARRAY(
    SELECT DISTINCT unnest(available_days)
    ORDER BY CASE unnest(available_days)
        WHEN '月' THEN 1
        WHEN '火' THEN 2
        WHEN '水' THEN 3
        WHEN '木' THEN 4
        WHEN '金' THEN 5
        WHEN '土' THEN 6
        WHEN '日' THEN 7
    END
)
WHERE array_length(available_days, 1) != (SELECT COUNT(DISTINCT d) FROM unnest(available_days) AS d);

-- ステップ3: 修正後の確認
SELECT name, available_days FROM employees ORDER BY name;
