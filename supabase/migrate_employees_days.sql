-- employeesテーブルのavailable_daysとassignable_workplaces_by_dayを英語から日本語に移行

-- ステップ1: available_days配列を英語から日本語に変換
UPDATE employees
SET available_days = ARRAY(
    SELECT CASE unnested_day
        WHEN 'monday' THEN '月'
        WHEN 'tuesday' THEN '火'
        WHEN 'wednesday' THEN '水'
        WHEN 'thursday' THEN '木'
        WHEN 'friday' THEN '金'
        WHEN 'saturday' THEN '土'
        WHEN 'sunday' THEN '日'
        ELSE unnested_day -- 既に日本語の場合はそのまま
    END
    FROM unnest(available_days) AS unnested_day
)
WHERE EXISTS (
    SELECT 1 FROM unnest(available_days) AS day
    WHERE day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
);

-- ステップ2: assignable_workplaces_by_dayのキーを英語から日本語に変換
UPDATE employees
SET assignable_workplaces_by_day = (
    SELECT jsonb_object_agg(
        CASE key
            WHEN 'monday' THEN '月'
            WHEN 'tuesday' THEN '火'
            WHEN 'wednesday' THEN '水'
            WHEN 'thursday' THEN '木'
            WHEN 'friday' THEN '金'
            WHEN 'saturday' THEN '土'
            WHEN 'sunday' THEN '日'
            ELSE key -- 既に日本語の場合はそのまま
        END,
        value
    )
    FROM jsonb_each(assignable_workplaces_by_day)
)
WHERE assignable_workplaces_by_day::text LIKE '%monday%'
   OR assignable_workplaces_by_day::text LIKE '%tuesday%'
   OR assignable_workplaces_by_day::text LIKE '%wednesday%'
   OR assignable_workplaces_by_day::text LIKE '%thursday%'
   OR assignable_workplaces_by_day::text LIKE '%friday%'
   OR assignable_workplaces_by_day::text LIKE '%saturday%'
   OR assignable_workplaces_by_day::text LIKE '%sunday%';

-- 確認用クエリ（実行後に確認してください）
-- SELECT name, available_days, assignable_workplaces_by_day FROM employees;
