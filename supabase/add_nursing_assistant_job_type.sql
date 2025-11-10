-- Migration: 職種enum型に「看護助手」を追加
-- 作成日: 2025-11-10
-- 説明: job_type enum に '看護助手' を追加する

-- ==================== ENUM型に値を追加 ====================
-- PostgreSQLでは既存のENUM型に値を追加できる
ALTER TYPE job_type ADD VALUE IF NOT EXISTS '看護助手';

-- 確認クエリ（実行後に確認する場合）
-- SELECT unnest(enum_range(NULL::job_type));
