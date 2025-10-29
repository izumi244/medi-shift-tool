-- workplacesテーブルのNULL day_of_weekを確認・修正

-- ステップ1: NULL値を持つレコードを確認
SELECT id, name, facility, time_slot, day_of_week, is_active
FROM workplaces
WHERE day_of_week IS NULL;

-- ステップ2: NULL値を持つレコードを削除または修正
-- オプションA: NULL値のレコードを削除する場合（データが不要な場合）
-- DELETE FROM workplaces WHERE day_of_week IS NULL;

-- オプションB: NULL値をデフォルト値で埋める場合（例：'月'）
-- UPDATE workplaces SET day_of_week = '月' WHERE day_of_week IS NULL;

-- ステップ3: もし日曜日のデータがある場合、ENUMに'日'を追加する必要があるか確認
-- 現在のENUM定義を確認
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'day_of_week'::regtype ORDER BY enumsortorder;
