// types/index.ts

import { ReactNode } from 'react'

// ==================== 基本型定義 ====================

export type PageType = 'dataInput' | 'employee' | 'workplace' | 'leave' | 'constraints' | 'shift'

export type EmploymentType = '常勤' | 'パート'
export type JobType = '看護師' | '臨床検査技師' | '看護助手'
export type FacilityType = 'クリニック棟' | '健診棟'
export type TimeSlot = 'AM' | 'PM'
export type ShiftType = '早番' | '遅番' | 'カスタム'
export type LeaveType = '希望休' | '有休' | '忌引' | '病欠' | 'その他' | '出勤可能'
export type RequestStatus = '申請中' | '承認' | '却下'

// ==================== データ型定義 ====================

// シフトパターン
export interface ShiftPattern {
  id: string
  name: string
  start_time: string
  end_time: string
  break_minutes: number
  color: string // 表示用の色 (例: '#e0e7ff')
  created_at?: string
  updated_at?: string
}

// 曜日の型定義
export type DayOfWeek = '月' | '火' | '水' | '木' | '金' | '土' | '日'

// 従業員
export interface Employee {
  id: string
  name: string
  employment_type: EmploymentType
  job_type: JobType
  assignable_workplaces_by_day: Record<string, string[]>
  assignable_shift_pattern_ids: string[]
  day_constraints: Array<{ if: string; then: string }>
  available_days: string[]
  phone?: string
  email?: string
  notes?: string
  order_index?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 配置場所
export interface Workplace {
  id: string
  name: string
  facility: FacilityType
  time_slot: TimeSlot
  day_of_week: DayOfWeek
  required_count: number
  remarks?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// シフト
export interface Shift {
  id: string
  employee_id: string
  date: string

  // シフトパターンID
  shift_pattern_id?: string

  // 配置場所（名前で保存）
  am_workplace?: string
  pm_workplace?: string

  // カスタム時間
  custom_start_time?: string
  custom_end_time?: string

  // 休み情報
  is_rest?: boolean
  rest_reason?: string

  status: 'draft' | 'confirmed' | 'modified'
  created_at: string
  updated_at: string
}

// 希望休
export interface LeaveRequest {
  id: string
  employee_id: string
  date: string
  leave_type: LeaveType
  reason?: string
  status: RequestStatus
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

// AI制約ガイドライン（シンプル化 - constraint_contentのみ）
export interface AIConstraintGuideline {
  id: string
  constraint_content: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ==================== UI型定義 ====================

// アプリケーション状態
export interface AppState {
  current_page: PageType
  current_user: {
    id: string
    name: string
    role: 'admin' | 'staff'
    permissions: string[]
  }
  loading: boolean
  error?: string
}

// 通知
export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  auto_hide: boolean
}

// ==================== フォーム型定義 ====================

// 従業員フォーム
export interface EmployeeFormData {
  name: string
  employment_type: EmploymentType
  job_type: JobType
  assignable_facilities: FacilityType[]
  available_days: string[]
  phone?: string
  email?: string
  notes?: string
}

// 希望休フォーム
export interface LeaveFormData {
  employee_id: string
  date: string
  leave_type: LeaveType
  reason?: string
}

// AI制約フォーム（シンプル化 - constraint_contentのみ）
export interface ConstraintFormData {
  constraint_content: string
}

// ==================== API型定義 ====================

// APIエラー
export interface APIError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

// APIレスポンス
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: APIError
}

// バリデーションエラー
export interface ValidationError {
  field: string
  message: string
  code: string
}

// ==================== プロップス型定義 ====================

// レイアウトコンポーネント
export interface LayoutProps {
  children: ReactNode
}

// ページコンポーネント
export interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

// ==================== モック用型定義 ====================

// 統計データ
export interface Statistics {
  employee_count: number
  leave_requests_count: number
  workplace_count: number
  constraint_rules_count: number
  monthly_hours: Record<string, number>
  violations: string[]
}

// 最近の活動
export interface RecentActivity {
  id: string
  type: 'leave_request' | 'shift_confirmed' | 'rule_added'
  message: string
  timestamp: string
  user?: string
}

// ==================== ユーティリティ型 ====================

// 日付範囲
export interface DateRange {
  start: string
  end: string
}

// 検索フィルター
export interface SearchFilters {
  text?: string
  employment_type?: EmploymentType[]
  job_type?: JobType[]
  facility?: FacilityType[]
  date_range?: DateRange
  active_only?: boolean
}

// ソート設定
export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

// ページネーション
export interface PaginationConfig {
  page: number
  limit: number
  total?: number
}

// User型は types/auth.ts に統一（重複削除）
export type { User, UserRole } from './auth'
