# Dify AI連携セットアップガイド

このドキュメントでは、Shift_MプロジェクトにDify AIを連携させる手順を説明します。

## 1. Difyワークフローの作成

### 1.1 Difyにログイン
https://dify.ai にアクセスしてログインします。

### 1.2 新しいワークフローを作成
1. ダッシュボードから「Create Workflow」をクリック
2. ワークフロー名: `Shift_M シフト自動生成`

### 1.3 入力変数を設定

ワークフローの入力変数として以下を定義します：

- `target_month` (Text): 対象月（例: "2025-11"）
- `calendar` (Text): 営業日一覧（日付リスト）
- `employees` (Text): 従業員情報（JSON形式）
- `workplaces` (Text): 配置場所情報（JSON形式）
- `shift_patterns` (Text): シフトパターン情報（JSON形式）
- `leave_requests` (Text): 希望休情報（JSON形式）
- `constraints` (Text): AI制約ガイドライン（テキスト）

### 1.4 LLMノードを追加

1. LLMノードを追加
2. モデル: `gemini-2.0-flash-exp` または `gemini-2.5-flash` を選択（無料）
   - 注意: Geminiモデルは出力トークン制限8192があるため、プロンプトの最適化が必要
   - より大規模なシフト生成には `claude-3-5-sonnet` または `gpt-4o` を推奨（有料）
3. Max Tokensにチェックを入れ、65501に設定
4. プロンプトを設定（後述）

### 1.5 出力変数を設定

- `result` (Text): 生成されたシフトデータ（JSON形式）

## 2. プロンプト設計

### 2.1 Gemini向け最適化プロンプト（無料版）

**重要**: Geminiモデルは出力トークン制限8192があるため、コンパクトなJSON形式での出力が必須です。

```
あなたは医療機関のシフト作成AIアシスタントです。
{target_month}の最適なシフトを作成してください。

【営業日】
{calendar}

【従業員】
{employees}

【配置場所】
{workplaces}

【シフトパターン】
{shift_patterns}

【希望休】
{leave_requests}

【制約】
{constraints}

**重要指示**:
- 必ず全日程のシフトを生成（途中で終了しない）
- 休みの日も必ず出力（is_rest:true）
- コンパクトなJSON形式で出力
- 説明文は一切不要

出力形式（必ず```jsonブロック内に出力）:
```json
{"shifts":[{"date":"2025-11-01","employee_id":"uuid","shift_pattern_id":"uuid","am_workplace":"外来","pm_workplace":"処置室"},{"date":"2025-11-02","employee_id":"uuid","is_rest":true,"rest_reason":"希望休"}]}
```

制約事項:
1. available_daysを厳守
2. assignable_workplaces_by_dayを厳守
3. assignable_shift_pattern_idsを厳守
4. day_constraints厳守（例:水曜出勤→木曜休）
5. leave_requests尊重
6. required_count満たす
7. 公平性保つ
```

### 2.2 Claude/GPT-4o向けプロンプト（有料版 - より詳細な出力可能）

```
あなたは医療機関のシフト作成AIアシスタントです。
以下の情報を元に、{target_month}の最適なシフトを作成してください。

【営業日カレンダー】
{calendar}

【従業員情報】
{employees}

【配置場所情報】
{workplaces}

【シフトパターン情報】
{shift_patterns}

【希望休情報】
{leave_requests}

【制約条件】
{constraints}

以下のJSON形式で出力してください：

```json
{
  "shifts": [
    {
      "date": "2025-11-01",
      "employee_id": "uuid",
      "shift_pattern_id": "uuid",
      "am_workplace": "外来",
      "pm_workplace": "処置室"
    }
  ]
}
```

【制約事項】
1. 各従業員の勤務可能曜日（available_days）を守る
2. 各従業員の配置可能場所（assignable_workplaces_by_day）を守る
3. 各従業員の対応可能シフトパターン（assignable_shift_pattern_ids）を守る
4. 曜日制約（day_constraints）を守る（例: 水曜出勤なら木曜休み）
5. 希望休（leave_requests）を尊重する
6. 各配置場所の必要人数（required_count）を満たす
7. 従業員間の公平性を保つ
```

## 3. 環境変数の設定

### 3.1 Dify APIキーの取得

1. Difyダッシュボードで作成したワークフローを開く
2. 右上の「API」アイコンをクリック
3. 「API Key」をコピー
4. 「API Endpoint」のURLをコピー

### 3.2 .env.localファイルを編集

プロジェクトルートに`.env.local`ファイルを作成（既にある場合は編集）：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Dify AI設定
DIFY_API_KEY=your_dify_api_key_here
DIFY_API_URL=https://api.dify.ai/v1
```

**注意**:
- `DIFY_API_KEY`: Difyから取得したAPIキー
- `DIFY_API_URL`: Difyから取得したAPI Endpoint URL（通常は `https://api.dify.ai/v1`）

### 3.3 環境変数の確認

`.env.local`ファイルが正しく設定されているか確認：

```bash
# 開発サーバーを再起動
npm run dev
```

## 4. 動作確認

### 4.1 シフト作成機能のテスト

1. アプリにログイン
2. 「データ入力・シフト作成」ページに移動
3. 対象月を選択
4. （オプション）特別要望を入力
5. 「シフト作成」ボタンをクリック

### 4.2 エラーハンドリング

エラーが発生した場合、ブラウザのコンソールとターミナルのログを確認：

```bash
# ブラウザコンソール（F12）で確認
- "Dify API Key: ..." が表示されるか
- "Dify API URL: ..." が表示されるか

# ターミナルで確認
- "Dify API error" が表示されていないか
- "JSON parse error" が表示されていないか
```

## 5. トラブルシューティング

### 問題1: "Dify API設定が見つかりません"

**原因**: 環境変数が正しく設定されていない

**解決策**:
1. `.env.local`ファイルが存在するか確認
2. ファイル内の変数名が正しいか確認（`DIFY_API_KEY`, `DIFY_API_URL`）
3. 開発サーバーを再起動

### 問題2: "Dify APIエラー"

**原因**: APIキーが無効、またはワークフローの設定が間違っている

**解決策**:
1. DifyダッシュボードでAPIキーを再確認
2. ワークフローが公開されているか確認
3. ワークフローの入力変数名が正しいか確認

### 問題3: "JSONパースエラー"

**原因**: DifyからのレスポンスがJSON形式でない、または出力が途中で切れている

**解決策**:
1. Difyのプロンプトで「```json」ブロックで出力するよう指示
2. LLMに「必ずJSON形式で出力」と強調
3. Difyのワークフローで出力フォーマットを確認
4. **Gemini使用時**: コンパクトなJSON形式を使用（改行・スペース最小化）
5. **トークン制限エラーの場合**: Claude 3.5 SonnetまたはGPT-4oに変更

### 問題4: "出力が途中で切れる（Gemini使用時）"

**原因**: Geminiモデルの出力トークン制限（8192トークン）

**解決策**:
- **選択肢1（推奨）**: コンパクトなJSON形式のプロンプトを使用（上記2.1参照）
  - 改行やインデントを削除
  - フィールド名を短縮しない（システムが認識する必要があるため）
  - 説明文を一切含めない
- **選択肢2**: Claude 3.5 Sonnet（出力トークン8192→200K）またはGPT-4o（出力トークン128K）に変更
  - 費用: 1回あたり約100-200円（従業員16人×31日の場合）
  - より安定した大規模シフト生成が可能

## 6. データ構造の詳細

### 6.1 入力データ例

#### employees
```json
[
  {
    "id": "uuid",
    "name": "看護師A",
    "employment_type": "常勤",
    "job_type": "看護師",
    "available_days": ["月", "火", "水", "木", "金"],
    "assignable_workplaces_by_day": {
      "月": ["外来", "処置室"],
      "火": ["検査室"]
    },
    "assignable_shift_pattern_ids": ["pattern_uuid1"],
    "day_constraints": [
      { "if": "水", "then": "木" }
    ]
  }
]
```

#### workplaces
```json
[
  {
    "id": "uuid",
    "name": "外来",
    "facility": "クリニック棟",
    "time_slot": "AM",
    "day_of_week": "月",
    "required_count": 2
  }
]
```

### 6.2 出力データ形式

```json
{
  "shifts": [
    {
      "date": "2025-11-01",
      "employee_id": "employee_uuid",
      "shift_pattern_id": "pattern_uuid",
      "am_workplace": "外来",
      "pm_workplace": "処置室"
    }
  ]
}
```

## 7. セキュリティ注意事項

1. **APIキーの管理**
   - `.env.local`ファイルは`.gitignore`に追加されていることを確認
   - APIキーを絶対にGitHubにコミットしない
   - 本番環境ではVercelの環境変数で設定

2. **本番環境での設定**
   - Vercelダッシュボードで環境変数を設定
   - Settings → Environment Variables
   - `DIFY_API_KEY`と`DIFY_API_URL`を追加

## 8. 参考リンク

- [Dify公式ドキュメント](https://docs.dify.ai/)
- [Dify Workflow API](https://docs.dify.ai/guides/workflow)
- [Next.js環境変数](https://nextjs.org/docs/basic-features/environment-variables)

---

**最終更新**: 2025-11-10
