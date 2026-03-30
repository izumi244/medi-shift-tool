'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Employee,
  EmployeeAccountInfo,
  Workplace,
  ShiftPattern,
  Shift,
  LeaveRequest,
  AIConstraintGuideline,
} from '@/types'

// Server Actions をインポート
import {
  getEmployees as fetchEmployees,
  createEmployee as serverCreateEmployee,
  updateEmployee as serverUpdateEmployee,
  deleteEmployee as serverDeleteEmployee,
  reorderEmployee as serverReorderEmployee,
} from '@/app/actions/employees'
import {
  getWorkplaces as fetchWorkplaces,
  createWorkplace as serverCreateWorkplace,
  updateWorkplace as serverUpdateWorkplace,
  deleteWorkplace as serverDeleteWorkplace,
} from '@/app/actions/workplaces'
import {
  getShiftPatterns as fetchShiftPatterns,
  createShiftPattern as serverCreateShiftPattern,
  updateShiftPattern as serverUpdateShiftPattern,
  deleteShiftPattern as serverDeleteShiftPattern,
} from '@/app/actions/shift-patterns'
import {
  getShifts as fetchShifts,
  createShift as serverCreateShift,
  updateShift as serverUpdateShift,
  deleteShift as serverDeleteShift,
} from '@/app/actions/shifts'
import {
  getLeaveRequests as fetchLeaveRequests,
  createLeaveRequest as serverCreateLeaveRequest,
  updateLeaveRequest as serverUpdateLeaveRequest,
  deleteLeaveRequest as serverDeleteLeaveRequest,
} from '@/app/actions/leave-requests'
import {
  getConstraints as fetchConstraints,
  createConstraint as serverCreateConstraint,
  updateConstraint as serverUpdateConstraint,
  deleteConstraint as serverDeleteConstraint,
} from '@/app/actions/constraints'

import { authFetch } from '@/lib/api-client'

// ==================== 生成結果型定義 ====================

interface GenerateShiftDropReasons {
  missing_fields: number
  invalid_date: number
  out_of_range: number
  unknown_employee: number
  unavailable_day: number
  invalid_pattern: number
  invalid_workplace: number
  leave_conflict: number
  duplicate: number
}

interface GenerateShiftSummary {
  total_generated: number
  total_valid: number
  dropped: number
  drop_reasons: GenerateShiftDropReasons
  target_month: string
}

interface GenerateShiftResult {
  shifts: Record<string, unknown>[]
  summary: GenerateShiftSummary
}

// ==================== Context型定義 ====================

interface ShiftDataContextType {
  // データ
  employees: Employee[]
  workplaces: Workplace[]
  shiftPatterns: ShiftPattern[]
  shifts: Shift[]
  leaveRequests: LeaveRequest[]
  constraints: AIConstraintGuideline[]

  // ローディング状態
  loading: boolean
  setLoading: (loading: boolean) => void

  // エラー状態
  refreshError: string | null

  // 従業員管理
  addEmployee: (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Promise<Employee | EmployeeAccountInfo>
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>
  deleteEmployee: (id: string) => Promise<void>
  reorderEmployee: (employeeId: string, direction: 'up' | 'down') => Promise<void>

  // 配置場所管理
  addWorkplace: (workplace: Omit<Workplace, 'id' | 'created_at' | 'updated_at'>) => Promise<Workplace>
  updateWorkplace: (id: string, updates: Partial<Workplace>) => Promise<void>
  deleteWorkplace: (id: string) => Promise<void>

  // シフトパターン管理
  addShiftPattern: (pattern: Omit<ShiftPattern, 'id'>) => Promise<ShiftPattern>
  updateShiftPattern: (id: string, updates: Partial<ShiftPattern>) => Promise<void>
  deleteShiftPattern: (id: string) => Promise<void>

  // シフト管理
  addShift: (shift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => Promise<Shift>
  updateShift: (id: string, updates: Partial<Shift>) => Promise<void>
  deleteShift: (id: string) => Promise<void>
  generateShift: (targetMonth: string, specialRequests?: string) => Promise<GenerateShiftResult>

  // 希望休管理
  addLeaveRequest: (leave: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>) => Promise<LeaveRequest>
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => Promise<void>
  deleteLeaveRequest: (id: string) => Promise<void>

  // 制約管理
  addConstraint: (constraint: Omit<AIConstraintGuideline, 'id' | 'created_at' | 'updated_at'>) => Promise<AIConstraintGuideline>
  updateConstraint: (id: string, updates: Partial<AIConstraintGuideline>) => Promise<void>
  deleteConstraint: (id: string) => Promise<void>

  // データリフレッシュ
  refreshAllData: () => Promise<void>
}

const ShiftDataContext = createContext<ShiftDataContextType | undefined>(undefined)

// ==================== Provider ====================

export function ShiftDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  // 状態管理（初期値は空配列 - Server Actionsで取得）
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [workplaces, setWorkplaces] = useState<Workplace[]>([])
  const [constraints, setConstraints] = useState<AIConstraintGuideline[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  // ==================== データリフレッシュ ====================

  const refreshAllData = useCallback(async () => {
    // セッショントークンがない場合はスキップ（未ログイン時）
    const { getSessionToken } = await import('@/lib/session')
    if (!getSessionToken()) return

    setLoading(true)
    setRefreshError(null)
    try {
      const [
        employeesResult,
        workplacesResult,
        shiftPatternsResult,
        constraintsResult,
        shiftsResult,
        leaveRequestsResult
      ] = await Promise.all([
        fetchEmployees(),
        fetchWorkplaces(),
        fetchShiftPatterns(),
        fetchConstraints(),
        fetchShifts(),
        fetchLeaveRequests()
      ])

      if (employeesResult.success && employeesResult.data) setEmployees(employeesResult.data)
      if (workplacesResult.success && workplacesResult.data) setWorkplaces(workplacesResult.data)
      if (shiftPatternsResult.success && shiftPatternsResult.data) setShiftPatterns(shiftPatternsResult.data)
      if (constraintsResult.success && constraintsResult.data) setConstraints(constraintsResult.data)
      if (shiftsResult.success && shiftsResult.data) setShifts(shiftsResult.data)
      if (leaveRequestsResult.success && leaveRequestsResult.data) setLeaveRequests(leaveRequestsResult.data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'データの取得に失敗しました'
      setRefreshError(message)
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 認証状態が変わったらデータを取得/クリア
  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData()
    } else {
      // ログアウト時にデータをクリア
      setShiftPatterns([])
      setEmployees([])
      setWorkplaces([])
      setConstraints([])
      setShifts([])
      setLeaveRequests([])
      setRefreshError(null)
    }
  }, [isAuthenticated, refreshAllData])

  // ==================== 従業員管理 ====================

  const addEmployee = useCallback(async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await serverCreateEmployee(employeeData)
    if (result.success && result.data) {
      const employee = result.data.employee
      setEmployees((prev) => [...prev, employee])
      return result.data.accountInfo || employee
    }
    throw new Error(result.error?.message || '従業員の追加に失敗しました')
  }, [])

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    const result = await serverUpdateEmployee(id, updates)
    if (result.success && result.data) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? result.data! : emp))
      )
    } else {
      throw new Error(result.error?.message || '従業員の更新に失敗しました')
    }
  }, [])

  const deleteEmployee = useCallback(async (id: string) => {
    const result = await serverDeleteEmployee(id)
    if (result.success) {
      setEmployees((prev) => prev.filter((emp) => emp.id !== id))
    } else {
      throw new Error(result.error?.message || '従業員の削除に失敗しました')
    }
  }, [])

  const reorderEmployee = useCallback(async (employeeId: string, direction: 'up' | 'down') => {
    const result = await serverReorderEmployee(employeeId, direction)
    if (result.success) {
      await refreshAllData()
    } else {
      throw new Error(result.error?.message || '従業員の並び替えに失敗しました')
    }
  }, [refreshAllData])

  // ==================== 配置場所管理 ====================

  const addWorkplace = useCallback(async (workplaceData: Omit<Workplace, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await serverCreateWorkplace(workplaceData)
    if (result.success && result.data) {
      setWorkplaces((prev) => [...prev, result.data!])
      return result.data
    }
    throw new Error(result.error?.message || '配置場所の追加に失敗しました')
  }, [])

  const updateWorkplace = useCallback(async (id: string, updates: Partial<Workplace>) => {
    const result = await serverUpdateWorkplace(id, updates)
    if (result.success && result.data) {
      setWorkplaces((prev) =>
        prev.map((wp) => (wp.id === id ? result.data! : wp))
      )
    } else {
      throw new Error(result.error?.message || '配置場所の更新に失敗しました')
    }
  }, [])

  const deleteWorkplace = useCallback(async (id: string) => {
    const result = await serverDeleteWorkplace(id)
    if (result.success) {
      setWorkplaces((prev) => prev.filter((wp) => wp.id !== id))
    } else {
      throw new Error(result.error?.message || '配置場所の削除に失敗しました')
    }
  }, [])

  // ==================== シフトパターン管理 ====================

  const addShiftPattern = useCallback(async (patternData: Omit<ShiftPattern, 'id'>) => {
    const result = await serverCreateShiftPattern(patternData)
    if (result.success && result.data) {
      setShiftPatterns((prev) => [...prev, result.data!])
      return result.data
    }
    throw new Error(result.error?.message || 'シフトパターンの追加に失敗しました')
  }, [])

  const updateShiftPattern = useCallback(async (id: string, updates: Partial<ShiftPattern>) => {
    const result = await serverUpdateShiftPattern(id, updates)
    if (result.success && result.data) {
      setShiftPatterns((prev) =>
        prev.map((pattern) => (pattern.id === id ? result.data! : pattern))
      )
    } else {
      throw new Error(result.error?.message || 'シフトパターンの更新に失敗しました')
    }
  }, [])

  const deleteShiftPattern = useCallback(async (id: string) => {
    const result = await serverDeleteShiftPattern(id)
    if (result.success) {
      setShiftPatterns((prev) => prev.filter((pattern) => pattern.id !== id))
    } else {
      throw new Error(result.error?.message || 'シフトパターンの削除に失敗しました')
    }
  }, [])

  // ==================== シフト管理 ====================

  const addShift = useCallback(async (shiftData: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await serverCreateShift(shiftData)
    if (result.success && result.data) {
      setShifts((prev) => [...prev, result.data!])
      return result.data
    }
    throw new Error(result.error?.message || 'シフトの追加に失敗しました')
  }, [])

  const updateShift = useCallback(async (id: string, updates: Partial<Shift>) => {
    const result = await serverUpdateShift(id, updates)
    if (result.success && result.data) {
      setShifts((prev) =>
        prev.map((shift) => (shift.id === id ? result.data! : shift))
      )
    } else {
      throw new Error(result.error?.message || 'シフトの更新に失敗しました')
    }
  }, [])

  const deleteShift = useCallback(async (id: string) => {
    const result = await serverDeleteShift(id)
    if (result.success) {
      setShifts((prev) => prev.filter((shift) => shift.id !== id))
    } else {
      throw new Error(result.error?.message || 'シフトの削除に失敗しました')
    }
  }, [])

  const generateShift = useCallback(async (targetMonth: string, specialRequests?: string) => {
    const res = await authFetch('/api/generate-shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_month: targetMonth,
        special_requests: specialRequests
      }),
    })
    const result: { success: boolean; data?: GenerateShiftResult; error?: { message: string } } = await res.json()
    if (result.success && result.data) {
      await refreshAllData()
      return result.data
    }
    throw new Error(result.error?.message || 'シフト生成に失敗しました')
  }, [refreshAllData])

  // ==================== 希望休管理 ====================

  const addLeaveRequest = useCallback(async (leaveData: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await serverCreateLeaveRequest(leaveData)
    if (result.success && result.data) {
      setLeaveRequests((prev) => [...prev, result.data!])
      return result.data
    }
    throw new Error(result.error?.message || '希望休の追加に失敗しました')
  }, [])

  const updateLeaveRequest = useCallback(async (id: string, updates: Partial<LeaveRequest>) => {
    const result = await serverUpdateLeaveRequest(id, updates)
    if (result.success && result.data) {
      setLeaveRequests((prev) =>
        prev.map((leave) => (leave.id === id ? result.data! : leave))
      )
    } else {
      throw new Error(result.error?.message || '希望休の更新に失敗しました')
    }
  }, [])

  const deleteLeaveRequest = useCallback(async (id: string) => {
    const result = await serverDeleteLeaveRequest(id)
    if (result.success) {
      setLeaveRequests((prev) => prev.filter((leave) => leave.id !== id))
    } else {
      throw new Error(result.error?.message || '希望休の削除に失敗しました')
    }
  }, [])

  // ==================== 制約管理 ====================

  const addConstraint = useCallback(async (constraintData: Omit<AIConstraintGuideline, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await serverCreateConstraint(constraintData)
    if (result.success && result.data) {
      setConstraints((prev) => [...prev, result.data!])
      return result.data
    }
    throw new Error(result.error?.message || '制約条件の追加に失敗しました')
  }, [])

  const updateConstraint = useCallback(async (id: string, updates: Partial<AIConstraintGuideline>) => {
    const result = await serverUpdateConstraint(id, updates)
    if (result.success && result.data) {
      setConstraints((prev) =>
        prev.map((constraint) => (constraint.id === id ? result.data! : constraint))
      )
    } else {
      throw new Error(result.error?.message || '制約条件の更新に失敗しました')
    }
  }, [])

  const deleteConstraint = useCallback(async (id: string) => {
    const result = await serverDeleteConstraint(id)
    if (result.success) {
      setConstraints((prev) => prev.filter((constraint) => constraint.id !== id))
    } else {
      throw new Error(result.error?.message || '制約条件の削除に失敗しました')
    }
  }, [])

  // ==================== Context値 ====================

  const value: ShiftDataContextType = {
    employees,
    workplaces,
    shiftPatterns,
    shifts,
    leaveRequests,
    constraints,
    loading,
    setLoading,
    refreshError,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    reorderEmployee,
    addWorkplace,
    updateWorkplace,
    deleteWorkplace,
    addShiftPattern,
    updateShiftPattern,
    deleteShiftPattern,
    addShift,
    updateShift,
    deleteShift,
    generateShift,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    addConstraint,
    updateConstraint,
    deleteConstraint,
    refreshAllData,
  }

  return (
    <ShiftDataContext.Provider value={value}>
      {children}
    </ShiftDataContext.Provider>
  )
}

// ==================== カスタムフック ====================

export function useShiftData() {
  const context = useContext(ShiftDataContext)
  if (context === undefined) {
    throw new Error('useShiftData must be used within a ShiftDataProvider')
  }
  return context
}
