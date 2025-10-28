-- 既存のworkplacesテーブルの曜日データを英語から日本語に移行するスクリプト
-- 実行前にバックアップを取ることを推奨

-- ステップ1: 一時的に新しいENUM型を作成
DO $$ BEGIN
    CREATE TYPE day_of_week_new AS ENUM ('月', '火', '水', '木', '金', '土', '日');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ステップ2: 既存のworkplacesテーブルのデータを変換して一時カラムに保存
ALTER TABLE workplaces ADD COLUMN IF NOT EXISTS day_of_week_new day_of_week_new;

UPDATE workplaces SET day_of_week_new =
    CASE day_of_week::text
        WHEN 'monday' THEN '月'::day_of_week_new
        WHEN 'tuesday' THEN '火'::day_of_week_new
        WHEN 'wednesday' THEN '水'::day_of_week_new
        WHEN 'thursday' THEN '木'::day_of_week_new
        WHEN 'friday' THEN '金'::day_of_week_new
        WHEN 'saturday' THEN '土'::day_of_week_new
        WHEN 'sunday' THEN '日'::day_of_week_new
    END;

-- ステップ3: 古いカラムとENUM型を削除
ALTER TABLE workplaces DROP COLUMN day_of_week;
DROP TYPE day_of_week;

-- ステップ4: 新しいENUM型の名前を変更
ALTER TYPE day_of_week_new RENAME TO day_of_week;

-- ステップ5: 新しいカラムの名前を変更
ALTER TABLE workplaces RENAME COLUMN day_of_week_new TO day_of_week;

-- ステップ6: NOT NULL制約を追加
ALTER TABLE workplaces ALTER COLUMN day_of_week SET NOT NULL;

-- ステップ7: インデックスを再作成
DROP INDEX IF EXISTS idx_workplaces_day;
CREATE INDEX idx_workplaces_day ON workplaces(day_of_week);

-- ステップ8: ユニーク制約を再作成
DROP INDEX IF EXISTS idx_workplaces_unique;
CREATE UNIQUE INDEX idx_workplaces_unique ON workplaces(name, facility, time_slot, day_of_week) WHERE is_active = TRUE;

-- 完了メッセージ
DO $$
BEGIN
    RAISE NOTICE '✅ 曜日データの移行が完了しました';
    RAISE NOTICE '   monday → 月';
    RAISE NOTICE '   tuesday → 火';
    RAISE NOTICE '   wednesday → 水';
    RAISE NOTICE '   thursday → 木';
    RAISE NOTICE '   friday → 金';
    RAISE NOTICE '   saturday → 土';
    RAISE NOTICE '   sunday → 日';
END $$;
