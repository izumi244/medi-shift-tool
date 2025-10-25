# 🏥 メディ様専用シフト作成ツール - プロトタイプ

AIを活用した医療機関向けシフト管理システムのプロトタイプです。

## 🚀 特徴

- **AIシフト生成**: 自然言語制約に基づく自動シフト作成
- **AM/PM分割管理**: 午前・午後で分けた配置場所管理
- **職種制限対応**: 看護師・臨床検査技師の業務制限を考慮
- **希望休管理**: カレンダー形式での申請・承認機能
- **レスポンシブ対応**: PC・モバイル両対応のUI

## 📋 主要機能

### 1. データ入力/シフト生成開始
- 管理機能へのアクセスポイント
- AIシフト生成の実行
- システム統計の表示

### 2. 従業員管理
- 基本情報登録・編集
- 配置可能場所設定
- 職種制限設定

### 3. 配置場所管理
- AM/PM分割での14箇所管理
- クリニック棟・健診棟の設定
- 各場所の備考管理

### 4. 希望休管理
- カレンダー表示
- 申請・承認機能
- 履歴管理

### 5. AI制約ガイドライン
- 自然言語での制約設定
- 優先度管理
- 制約カテゴリ分類

### 6. シフト表示
- 【AM】/【PM】形式表示
- 編集機能
- PDF出力（予定）

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 + TypeScript
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **日付処理**: date-fns
- **データベース**: Supabase（予定）
- **AI連携**: Dify Workflow（予定）

## 📦 セットアップ手順

### 1. プロジェクト作成

```bash
# Next.jsプロジェクトを作成
npx create-next-app@latest medi-shift-tool --typescript --tailwind --app

# プロジェクトディレクトリに移動
cd medi-shift-tool
```

### 2. 依存関係インストール

```bash
# 基本パッケージ
npm install lucide-react date-fns @supabase/supabase-js

# 開発時パッケージ
npm install -D @tailwindcss/forms @tailwindcss/typography
```

### 3. ファイル配置

以下のファイルを対応する場所に配置してください：

```
medi-shift-tool/
├── app/
│   └── page.tsx                 # メインページ
├── components/
│   ├── MainLayout.tsx           # レイアウトコンポーネント
│   └── DataInputPage.tsx        # データ入力ページ
├── types/
│   └── index.ts                 # 型定義
├── tailwind.config.js           # Tailwind設定
├── tsconfig.json               # TypeScript設定
├── package.json                # パッケージ設定
└── README.md                   # このファイル
```

### 4. 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてアプリケーションを確認できます。

## 📁 プロジェクト構造

```
medi-shift-tool/
├── app/                        # Next.js App Router
│   ├── globals.css             # グローバルスタイル
│   ├── layout.tsx              # ルートレイアウト
│   └── page.tsx                # ホームページ
├── components/                 # Reactコンポーネント
│   ├── MainLayout.tsx          # メインレイアウト
│   ├── DataInputPage.tsx       # データ入力ページ
│   ├── EmployeePage.tsx        # 従業員管理（予定）
│   ├── WorkplacePage.tsx       # 配置場所管理（予定）
│   ├── LeavePage.tsx           # 希望休管理（予定）
│   ├── ConstraintsPage.tsx     # AI制約管理（予定）
│   └── ShiftPage.tsx           # シフト表示（予定）
├── types/                      # TypeScript型定義
│   └── index.ts                # 基本型定義
├── lib/                        # ユーティリティ
│   ├── supabase.ts             # Supabase設定（予定）
│   └── utils.ts                # 共通関数（予定）
├── hooks/                      # カスタムフック（予定）
└── contexts/                   # React Context（予定）
```

## 🎯 開発ロードマップ

### Phase 1: プロトタイプ基盤 ✅
- [x] プロジェクト構造作成
- [x] メインレイアウト実装
- [x] データ入力ページ実装
- [x] 基本型定義

### Phase 2: 主要ページ実装 🚧
- [ ] 従業員管理ページ
- [ ] 配置場所管理ページ
- [ ] 希望休管理ページ
- [ ] AI制約管理ページ
- [ ] シフト表示ページ

### Phase 3: 機能拡張 📋
- [ ] モックデータ連携
- [ ] バリデーション機能
- [ ] 画面遷移機能
- [ ] レスポンシブ調整

### Phase 4: データベース連携 🔗
- [ ] Supabase環境構築
- [ ] CRUD操作実装
- [ ] リアルタイム更新

### Phase 5: AI連携 🤖
- [ ] Dify Workflow連携
- [ ] シフト生成機能
- [ ] 制約チェック機能

## 🐛 トラブルシューティング

### よくある問題

1. **TypeScriptエラー**
   ```bash
   npm run type-check
   ```

2. **スタイルが適用されない**
   ```bash
   # Tailwind CSSのビルドを確認
   npm run build
   ```

3. **依存関係の問題**
   ```bash
   # node_modulesを削除して再インストール
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📝 ライセンス

このプロジェクトは非公開のプロプライエタリソフトウェアです。

## 👥 開発チーム

- プロジェクトマネージャー: [担当者名]
- フロントエンド開発: [担当者名]
- バックエンド開発: [担当者名]
- UI/UXデザイン: [担当者名]

## 📞 サポート

技術的な問題や質問がある場合は、開発チームまでお問い合わせください。

---

**最終更新**: 2025年8月11日