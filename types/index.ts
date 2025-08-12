// types/index.ts

import { ReactNode } from 'react'

// ==================== 基本型定義 ====================

export type PageType = 'dataInput' | 'employee' | 'workplace' | 'leave' | 'constraints' | 'shift'

export type EmploymentType = '常勤' | 'パート'
export type JobType = '看護師' | '臨床検査技師'
export type FacilityType = 'クリニック棟' | '健診棟'
export type TimeSlot = 'AM' | 'PM'
export type ShiftType = '早番' | '遅番' | 'カスタム'
export type LeaveType = '希望休' | '有休' | '忌引' | '病欠' | 'その他'
export type RequestStatus = '申請中' | '承認' | '却下'

// ==================== データ型定義 ====================

// 従業員
export interface Employee {
  id: string
  name: string
  employment_type: EmploymentType
  job_type: JobType
  assignable_facilities: FacilityType[]
  available_days: string[]
  phone?: string
  email?: string
  notes?: string
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
  am_workplace_id?: string
  pm_workplace_id?: string
  shift_type: ShiftType
  start_time: string
  end_time: string
  break_minutes: number
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

// AI制約ガイドライン
export interface AIConstraintGuideline {
  id: string
  category: string
  constraint_content: string
  priority_level: number
  examples?: string
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

// AI制約フォーム
export interface ConstraintFormData {
  category: string
  constraint_content: string
  priority_level: number
  examples?: string
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