// lib/constants.ts
// 共通の定数定義

import type { DayOfWeek } from '@/types'

/** 曜日リスト（月-土） */
export const WORKDAYS: DayOfWeek[] = ['月', '火', '水', '木', '金', '土']

/** 曜日の日本語表示ラベル */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  '月': '月曜日',
  '火': '火曜日',
  '水': '水曜日',
  '木': '木曜日',
  '金': '金曜日',
  '土': '土曜日',
  '日': '日曜日'
}

// === ステータス定数 ===
export const REQUEST_STATUS = {
  PENDING: '申請中' as const,
  APPROVED: '承認' as const,
  REJECTED: '却下' as const,
}

// === 休暇種別定数 ===
export const LEAVE_TYPES = {
  HOPE_REST: '希望休' as const,
  PAID_LEAVE: '有休' as const,
  FUNERAL: '忌引' as const,
  SICK_LEAVE: '病欠' as const,
  OTHER: 'その他' as const,
  AVAILABLE: '出勤可能' as const,
}

/** 休暇種別マスク表示（他従業員に見せる場合） */
export const LEAVE_TYPES_MASKED = '休み' as const

/** 休暇種別のうちシフトを割り当てない種別 */
export const NON_WORKING_LEAVE_TYPES = [
  LEAVE_TYPES.HOPE_REST,
  LEAVE_TYPES.PAID_LEAVE,
  LEAVE_TYPES.FUNERAL,
  LEAVE_TYPES.SICK_LEAVE,
  LEAVE_TYPES.OTHER,
] as const

// === 雇用形態定数 ===
export const EMPLOYMENT_TYPES = {
  FULL_TIME: '常勤' as const,
  PART_TIME: 'パート' as const,
}

// === 職種定数 ===
export const JOB_TYPES = {
  NURSE: '看護師' as const,
  CLINICAL_TECH: '臨床検査技師' as const,
  NURSE_ASSISTANT: '看護助手' as const,
}

// === 施設定数 ===
export const FACILITY_TYPES = {
  CLINIC: 'クリニック棟' as const,
  HEALTH_CHECK: '健診棟' as const,
}

/** 職種アイコン */
export const JOB_TYPE_ICONS = {
  [JOB_TYPES.NURSE]: '🩺',
  [JOB_TYPES.CLINICAL_TECH]: '🔬',
  [JOB_TYPES.NURSE_ASSISTANT]: '🤝',
} as const
