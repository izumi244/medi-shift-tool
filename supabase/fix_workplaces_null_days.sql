-- workplacesテーブルのNULL day_of_weekを修正するスクリプト

-- ステップ1: NULL値を持つレコードを確認
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count FROM workplaces WHERE day_of_week IS NULL;
    RAISE NOTICE '⚠️  NULL値を持つレコード数: %', null_count;
END $$;

-- ステップ2: NULL値のレコードを削除（データとして無効なため）
-- ※ もし重要なデータの場合は、手動で修正してください
DELETE FROM workplaces WHERE day_of_week IS NULL;

-- ステップ3: 結果を確認
DO $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM workplaces;
    RAISE NOTICE '✅ 現在のworkplacesレコード数: %', total_count;
    RAISE NOTICE '✅ NULL値の削除が完了しました';
END $$;

-- ステップ4: 残っているday_of_weekの値を確認
SELECT day_of_week, COUNT(*) as count
FROM workplaces
GROUP BY day_of_week
ORDER BY day_of_week;
