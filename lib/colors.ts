// lib/colors.ts
// 共通のカラー定義

import type { EmploymentType, FacilityType, LeaveType, RequestStatus } from '@/types'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'

/** 雇用形態別のカラースキーム */
export const employmentTypeColors: Record<EmploymentType, string> = {
  '常勤': 'bg-blue-100 text-blue-800 border-blue-200',
  'パート': 'bg-purple-100 text-purple-800 border-purple-200'
}

/** 施設別のカラースキーム */
export const facilityColors: Record<FacilityType, {
  bg: string
  border: string
  text: string
  accent: string
}> = {
  'クリニック棟': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    accent: 'bg-blue-500'
  },
  '健診棟': {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    accent: 'bg-green-500'
  }
}

/** 希望休申請ステータス別のカラースキーム */
export const statusColors = {
  '申請中': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: Clock
  },
  '承認': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: CheckCircle2
  },
  '却下': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: XCircle
  }
} as const

/** 休暇種別のカラースキーム */
export const leaveTypeColors: Record<LeaveType, string> = {
  '希望休': 'bg-blue-100 text-blue-800',
  '有休': 'bg-green-100 text-green-800',
  '忌引': 'bg-gray-100 text-gray-800',
  '病欠': 'bg-red-100 text-red-800',
  'その他': 'bg-purple-100 text-purple-800',
  '出勤可能': 'bg-cyan-100 text-cyan-800'
}

/** シフトパターン用カラーオプション */
export const shiftPatternColorOptions = [
  { name: 'Blue', value: '#e0f2fe' },
  { name: 'Green', value: '#dcfce7' },
  { name: 'Yellow', value: '#fef9c3' },
  { name: 'Pink', value: '#fce7f3' },
  { name: 'Purple', value: '#f3e8ff' },
  { name: 'Indigo', value: '#e0e7ff' },
  { name: 'Gray', value: '#f3f4f6' }
] as const
