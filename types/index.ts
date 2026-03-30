// types/index.ts

// ==================== 基本型定義 ====================

export type EmploymentType = '常勤' | 'パート'
export type JobType = '看護師' | '臨床検査技師' | '看護助手'
export type FacilityType = 'クリニック棟' | '健診棟'
export type TimeSlot = 'AM' | 'PM'
export type LeaveType = '希望休' | '有休' | '忌引' | '病欠' | 'その他' | '出勤可能' | '休み'
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
  is_active?: boolean
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
  employee_number?: string // 従業員番号（emp001形式）
  password_hash?: string
  password_changed?: boolean
  session_token?: string
  last_login?: string
  is_system_account?: boolean
  role?: 'admin' | 'employee' | 'developer' // DBカラム（存在しない場合はis_system_accountから計算）
  created_at: string
  updated_at: string
}

// 従業員アカウント作成時の戻り値
export interface EmployeeAccountInfo {
  employee_id: string
  employee_number: string
  initial_password: string
  created_at: string
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

  // 配置場所（名前で保存 - レガシー互換）
  am_workplace?: string
  pm_workplace?: string

  // 配置場所ID（workplacesテーブル参照 - 新方式）
  am_workplace_id?: string
  pm_workplace_id?: string

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

// User型は types/auth.ts に統一（重複削除）
export type { User, UserRole } from './auth'
