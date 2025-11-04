// lib/constants.ts
// 共通の定数定義

import type { DayOfWeek } from '@/types'

/** 曜日リスト（月-土） */
export const WORKDAYS: DayOfWeek[] = ['月', '火', '水', '木', '金', '土']

/** 曜日リスト（日-土） */
export const ALL_DAYS: DayOfWeek[] = ['日', '月', '火', '水', '木', '金', '土']

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

/** 職種アイコン */
export const JOB_TYPE_ICONS = {
  '看護師': '🩺',
  '臨床検査技師': '🔬'
} as const
