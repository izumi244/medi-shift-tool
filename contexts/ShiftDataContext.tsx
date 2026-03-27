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

// generateShift は引き続きAPI route を使用（別のエージェントが修正中）
import { authFetch } from '@/lib/api-client'

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
  getEmployeeById: (id: string) => Employee | undefined
  reorderEmployee: (employeeId: string, direction: 'up' | 'down') => Promise<void>

  // 配置場所管理
  addWorkplace: (workplace: Omit<Workplace, 'id' | 'created_at' | 'updated_at'>) => Promise<Workplace>
  updateWorkplace: (id: string, updates: Partial<Workplace>) => Promise<void>
  deleteWorkplace: (id: string) => Promise<void>
  getWorkplaceById: (id: string) => Workplace | undefined

  // シフトパターン管理
  addShiftPattern: (pattern: Omit<ShiftPattern, 'id'>) => Promise<ShiftPattern>
  updateShiftPattern: (id: string, updates: Partial<ShiftPattern>) => Promise<void>
  deleteShiftPattern: (id: string) => Promise<void>
  getShiftPatternById: (id: string) => ShiftPattern | undefined

  // シフト管理
  addShift: (shift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => Promise<Shift>
  updateShift: (id: string, updates: Partial<Shift>) => Promise<void>
  deleteShift: (id: string) => Promise<void>
  getShiftById: (id: string) => Shift | undefined
  getShiftsByMonth: (year: number, month: number) => Shift[]
  bulkUpsertShifts: (shifts: Omit<Shift, 'created_at' | 'updated_at'>[]) => Promise<void>
  generateShift: (targetMonth: string, specialRequests?: string) => Promise<{ shifts: any[]; summary: any }>

  // 希望休管理
  addLeaveRequest: (leave: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>) => Promise<LeaveRequest>
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => Promise<void>
  deleteLeaveRequest: (id: string) => Promise<void>
  getLeaveRequestById: (id: string) => LeaveRequest | undefined
  getLeaveRequestsByMonth: (year: number, month: number) => LeaveRequest[]

  // 制約管理
  addConstraint: (constraint: Omit<AIConstraintGuideline, 'id' | 'created_at' | 'updated_at'>) => Promise<AIConstraintGuideline>
  updateConstraint: (id: string, updates: Partial<AIConstraintGuideline>) => Promise<void>
  deleteConstraint: (id: string) => Promise<void>
  getConstraintById: (id: string) => AIConstraintGuideline | undefined

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
      console.error('refreshAllData error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 認証状態が変わったらデータを取得
  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData()
    }
  }, [isAuthenticated, refreshAllData])

  // ==================== 従業員管理 ====================

  const addEmployee = useCallback(async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await serverCreateEmployee(employeeData)
    if (result.success && result.data) {
      const employee = result.data.employee
      setEmployees((prev) => [...prev, employee])
      // アカウント情報も返す（新規作成時のみ）
      return result.data.accountInfo || employee
    }
    throw new Error(result.error?.message || 'Failed to add employee')
  }, [])

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    const result = await serverUpdateEmployee(id, updates)
    if (result.success && result.data) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? result.data! : emp))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update employee')
    }
  }, [])

  const deleteEmployee = useCallback(async (id: string) => {
    const result = await serverDeleteEmployee(id)
    if (result.success) {
      setEmployees((prev) => prev.filter((emp) => emp.id !== id))
    } else {
      throw new Error(result.error?.message || 'Failed to delete employee')
    }
  }, [])

  const getEmployeeById = useCallback(
    (id: string) => {
      return employees.find((emp) => emp.id === id)
    },
    [employees]
  )

  const reorderEmployee = useCallback(async (employeeId: string, direction: 'up' | 'down') => {
    const result = await serverReorderEmployee(employeeId, direction)
    if (result.success) {
      // データを再取得して最新の順序を反映
      await refreshAllData()
    } else {
      throw new Error(result.error?.message || 'Failed to reorder employee')
    }
  }, [refreshAllData])

  // ==================== 配置場所管理 ====================

  const addWorkplace = useCallback(async (workplaceData: Omit<Workplace, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await serverCreateWorkplace(workplaceData)
    if (result.success && result.data) {
      setWorkplaces((prev) => [...prev, result.data!])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add workplace')
  }, [])

  const updateWorkplace = useCallback(async (id: string, updates: Partial<Workplace>) => {
    const result = await serverUpdateWorkplace(id, updates)
    if (result.success && result.data) {
      setWorkplaces((prev) =>
        prev.map((wp) => (wp.id === id ? result.data! : wp))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update workplace')
    }
  }, [])

  const deleteWorkplace = useCallback(async (id: string) => {
    const result = await serverDeleteWorkplace(id)
    if (result.success) {
      setWorkplaces((prev) => prev.filter((wp) => wp.id !== id))
    } else {
      throw new Error(result.error?.message || 'Failed to delete workplace')
    }
  }, [])

  const getWorkplaceById = useCallback(
    (id: string) => {
      return workplaces.find((wp) => wp.id === id)
    },
    [workplaces]
  )

  // ==================== シフトパターン管理 ====================

  const addShiftPattern = useCallback(async (patternData: Omit<ShiftPattern, 'id'>) => {
    const result = await serverCreateShiftPattern(patternData)
    if (result.success && result.data) {
      setShiftPatterns((prev) => [...prev, result.data!])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add shift pattern')
  }, [])

  const updateShiftPattern = useCallback(async (id: string, updates: Partial<ShiftPattern>) => {
    const result = await serverUpdateShiftPattern(id, updates)
    if (result.success && result.data) {
      setShiftPatterns((prev) =>
        prev.map((pattern) => (pattern.id === id ? result.data! : pattern))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update shift pattern')
    }
  }, [])

  const deleteShiftPattern = useCallback(async (id: string) => {
    const result = await serverDeleteShiftPattern(id)
    if (result.success) {
      setShiftPatterns((prev) => prev.filter((pattern) => pattern.id !== id))
    } else {
      throw new Error(result.error?.message || 'Failed to delete shift pattern')
    }
  }, [])

  const getShiftPatternById = useCallback(
    (id: string) => {
      return shiftPatterns.find((pattern) => pattern.id === id)
    },
    [shiftPatterns]
  )

  // ==================== シフト管理 ====================

  const addShift = useCallback(async (shiftData: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await serverCreateShift(shiftData)
    if (result.success && result.data) {
      setShifts((prev) => [...prev, result.data!])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add shift')
  }, [])

  const updateShift = useCallback(async (id: string, updates: Partial<Shift>) => {
    const result = await serverUpdateShift(id, updates)
    if (result.success && result.data) {
      setShifts((prev) =>
        prev.map((shift) => (shift.id === id ? result.data! : shift))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update shift')
    }
  }, [])

  const deleteShift = useCallback(async (id: string) => {
    const result = await serverDeleteShift(id)
    if (result.success) {
      setShifts((prev) => prev.filter((shift) => shift.id !== id))
    } else {
      throw new Error(result.error?.message || 'Failed to delete shift')
    }
  }, [])

  const getShiftById = useCallback(
    (id: string) => {
      return shifts.find((shift) => shift.id === id)
    },
    [shifts]
  )

  const getShiftsByMonth = useCallback(
    (year: number, month: number) => {
      return shifts.filter((shift) => {
        const shiftDate = new Date(shift.date)
        return (
          shiftDate.getFullYear() === year &&
          shiftDate.getMonth() + 1 === month
        )
      })
    },
    [shifts]
  )

  const bulkUpsertShifts = useCallback(async (shiftsData: Omit<Shift, 'created_at' | 'updated_at'>[]) => {
    // 一括でシフトを作成/更新
    const promises = shiftsData.map(async (shiftData) => {
      if (shiftData.id) {
        // 更新
        return updateShift(shiftData.id, shiftData)
      } else {
        // 新規作成
        return addShift(shiftData)
      }
    })

    await Promise.all(promises)
  }, [updateShift, addShift])

  // generateShift はAPI routeを引き続き使用（別のエージェントが修正中のため）
  const generateShift = useCallback(async (targetMonth: string, specialRequests?: string) => {
    const res = await authFetch('/api/generate-shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_month: targetMonth,
        special_requests: specialRequests
      }),
    })
    const result = await res.json()
    if (result.success) {
      // /api/generate-shift内で既にDBに保存済みなので、ここでは再保存しない
      // ローカル状態を更新するため、データを再取得
      await refreshAllData()
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to generate shift')
  }, [refreshAllData])

  // ==================== 希望休管理 ====================

  const addLeaveRequest = useCallback(async (leaveData: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await serverCreateLeaveRequest(leaveData)
    if (result.success && result.data) {
      setLeaveRequests((prev) => [...prev, result.data!])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add leave request')
  }, [])

  const updateLeaveRequest = useCallback(async (id: string, updates: Partial<LeaveRequest>) => {
    const result = await serverUpdateLeaveRequest(id, updates)
    if (result.success && result.data) {
      setLeaveRequests((prev) =>
        prev.map((leave) => (leave.id === id ? result.data! : leave))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update leave request')
    }
  }, [])

  const deleteLeaveRequest = useCallback(async (id: string) => {
    const result = await serverDeleteLeaveRequest(id)
    if (result.success) {
      setLeaveRequests((prev) => prev.filter((leave) => leave.id !== id))
    } else {
      throw new Error(result.error?.message || 'Failed to delete leave request')
    }
  }, [])

  const getLeaveRequestById = useCallback(
    (id: string) => {
      return leaveRequests.find((leave) => leave.id === id)
    },
    [leaveRequests]
  )

  const getLeaveRequestsByMonth = useCallback(
    (year: number, month: number) => {
      return leaveRequests.filter((leave) => {
        const leaveDate = new Date(leave.date)
        return (
          leaveDate.getFullYear() === year &&
          leaveDate.getMonth() + 1 === month
        )
      })
    },
    [leaveRequests]
  )

  // ==================== 制約管理 ====================

  const addConstraint = useCallback(async (constraintData: Omit<AIConstraintGuideline, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await serverCreateConstraint(constraintData)
    if (result.success && result.data) {
      setConstraints((prev) => [...prev, result.data!])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add constraint')
  }, [])

  const updateConstraint = useCallback(async (id: string, updates: Partial<AIConstraintGuideline>) => {
    const result = await serverUpdateConstraint(id, updates)
    if (result.success && result.data) {
      setConstraints((prev) =>
        prev.map((constraint) => (constraint.id === id ? result.data! : constraint))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update constraint')
    }
  }, [])

  const deleteConstraint = useCallback(async (id: string) => {
    const result = await serverDeleteConstraint(id)
    if (result.success) {
      setConstraints((prev) => prev.filter((constraint) => constraint.id !== id))
    } else {
      throw new Error(result.error?.message || 'Failed to delete constraint')
    }
  }, [])

  const getConstraintById = useCallback(
    (id: string) => {
      return constraints.find((constraint) => constraint.id === id)
    },
    [constraints]
  )

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
    getEmployeeById,
    reorderEmployee,
    addWorkplace,
    updateWorkplace,
    deleteWorkplace,
    getWorkplaceById,
    addShiftPattern,
    updateShiftPattern,
    deleteShiftPattern,
    getShiftPatternById,
    addShift,
    updateShift,
    deleteShift,
    getShiftById,
    getShiftsByMonth,
    bulkUpsertShifts,
    generateShift,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    getLeaveRequestById,
    getLeaveRequestsByMonth,
    addConstraint,
    updateConstraint,
    deleteConstraint,
    getConstraintById,
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
