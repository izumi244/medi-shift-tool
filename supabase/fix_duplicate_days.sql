-- 重複した曜日を持つ従業員を確認・修正

-- ステップ1: available_daysに重複がある従業員を見つける
SELECT
    id,
    name,
    available_days,
    array_length(available_days, 1) as total_days
FROM employees
WHERE array_length(available_days, 1) > (
    SELECT COUNT(*)
    FROM (SELECT DISTINCT unnest(available_days)) AS unique_days
);

-- ステップ2: 重複を削除して修正（曜日順にソート）
UPDATE employees
SET available_days = (
    SELECT array_agg(day ORDER BY
        CASE day
            WHEN '月' THEN 1
            WHEN '火' THEN 2
            WHEN '水' THEN 3
            WHEN '木' THEN 4
            WHEN '金' THEN 5
            WHEN '土' THEN 6
            WHEN '日' THEN 7
            ELSE 99
        END
    )
    FROM (
        SELECT DISTINCT unnest(available_days) AS day
    ) AS unique_days
);

-- ステップ3: 修正後の確認
SELECT name, available_days FROM employees ORDER BY name;
