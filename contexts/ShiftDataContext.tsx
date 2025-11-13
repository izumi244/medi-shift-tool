'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import {
  Employee,
  Workplace,
  ShiftPattern,
  Shift,
  LeaveRequest,
  AIConstraintGuideline,
} from '@/types'

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

  // 従業員管理
  addEmployee: (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => Promise<Employee>
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
  // 状態管理（初期値は空配列 - SupabaseからGETして取得）
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [workplaces, setWorkplaces] = useState<Workplace[]>([])
  const [constraints, setConstraints] = useState<AIConstraintGuideline[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)

  // ==================== データリフレッシュ ====================

  const refreshAllData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        employeesRes,
        workplacesRes,
        shiftPatternsRes,
        constraintsRes,
        shiftsRes,
        leaveRequestsRes
      ] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/workplaces'),
        fetch('/api/shift-patterns'),
        fetch('/api/constraints'),
        fetch('/api/shifts'),
        fetch('/api/leave-requests')
      ])

      const [
        employeesData,
        workplacesData,
        shiftPatternsData,
        constraintsData,
        shiftsData,
        leaveRequestsData
      ] = await Promise.all([
        employeesRes.json(),
        workplacesRes.json(),
        shiftPatternsRes.json(),
        constraintsRes.json(),
        shiftsRes.json(),
        leaveRequestsRes.json()
      ])

      if (employeesData.success) setEmployees(employeesData.data)
      if (workplacesData.success) setWorkplaces(workplacesData.data)
      if (shiftPatternsData.success) setShiftPatterns(shiftPatternsData.data)
      if (constraintsData.success) setConstraints(constraintsData.data)
      if (shiftsData.success) setShifts(shiftsData.data)
      if (leaveRequestsData.success) setLeaveRequests(leaveRequestsData.data)
    } catch (error) {
      // エラーは無視（本番環境ではロギングサービスに送信することを推奨）
    } finally {
      setLoading(false)
    }
  }, [])

  // 初回ロード時にデータを取得
  useEffect(() => {
    refreshAllData()
  }, [refreshAllData])

  // ==================== 従業員管理 ====================

  const addEmployee = useCallback(async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData),
    })
    const result = await res.json()
    if (result.success) {
      setEmployees((prev) => [...prev, result.data])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add employee')
  }, [])

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    const res = await fetch('/api/employees', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    const result = await res.json()
    if (result.success) {
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? result.data : emp))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update employee')
    }
  }, [])

  const deleteEmployee = useCallback(async (id: string) => {
    const res = await fetch(`/api/employees?id=${id}`, {
      method: 'DELETE',
    })
    const result = await res.json()
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
    const res = await fetch('/api/employees/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, direction }),
    })
    const result = await res.json()
    if (result.success) {
      // データを再取得して最新の順序を反映
      await refreshAllData()
    } else {
      throw new Error(result.error?.message || 'Failed to reorder employee')
    }
  }, [refreshAllData])

  // ==================== 配置場所管理 ====================

  const addWorkplace = useCallback(async (workplaceData: Omit<Workplace, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/workplaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workplaceData),
    })
    const result = await res.json()
    if (result.success) {
      setWorkplaces((prev) => [...prev, result.data])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add workplace')
  }, [])

  const updateWorkplace = useCallback(async (id: string, updates: Partial<Workplace>) => {
    const res = await fetch('/api/workplaces', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    const result = await res.json()
    if (result.success) {
      setWorkplaces((prev) =>
        prev.map((wp) => (wp.id === id ? result.data : wp))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update workplace')
    }
  }, [])

  const deleteWorkplace = useCallback(async (id: string) => {
    const res = await fetch(`/api/workplaces?id=${id}`, {
      method: 'DELETE',
    })
    const result = await res.json()
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
    const res = await fetch('/api/shift-patterns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patternData),
    })
    const result = await res.json()
    if (result.success) {
      setShiftPatterns((prev) => [...prev, result.data])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add shift pattern')
  }, [])

  const updateShiftPattern = useCallback(async (id: string, updates: Partial<ShiftPattern>) => {
    const res = await fetch('/api/shift-patterns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    const result = await res.json()
    if (result.success) {
      setShiftPatterns((prev) =>
        prev.map((pattern) => (pattern.id === id ? result.data : pattern))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update shift pattern')
    }
  }, [])

  const deleteShiftPattern = useCallback(async (id: string) => {
    const res = await fetch(`/api/shift-patterns?id=${id}`, {
      method: 'DELETE',
    })
    const result = await res.json()
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
    const res = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shiftData),
    })
    const result = await res.json()
    if (result.success) {
      setShifts((prev) => [...prev, result.data])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add shift')
  }, [])

  const updateShift = useCallback(async (id: string, updates: Partial<Shift>) => {
    const res = await fetch('/api/shifts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    const result = await res.json()
    if (result.success) {
      setShifts((prev) =>
        prev.map((shift) => (shift.id === id ? result.data : shift))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update shift')
    }
  }, [])

  const deleteShift = useCallback(async (id: string) => {
    const res = await fetch(`/api/shifts?id=${id}`, {
      method: 'DELETE',
    })
    const result = await res.json()
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
  }, [])

  const generateShift = useCallback(async (targetMonth: string, specialRequests?: string) => {
    const res = await fetch('/api/generate-shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_month: targetMonth,
        special_requests: specialRequests
      }),
    })
    const result = await res.json()
    if (result.success) {
      // 生成されたシフトを保存
      if (result.data.shifts && result.data.shifts.length > 0) {
        await bulkUpsertShifts(result.data.shifts.map((shift: any) => ({
          employee_id: shift.employee_id,
          date: shift.date,
          shift_pattern_id: shift.shift_pattern_id || undefined,
          am_workplace: shift.am_workplace || undefined,
          pm_workplace: shift.pm_workplace || undefined,
          status: 'draft' as const
        })))
        // データを再取得
        await refreshAllData()
      }
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to generate shift')
  }, [bulkUpsertShifts, refreshAllData])

  // ==================== 希望休管理 ====================

  const addLeaveRequest = useCallback(async (leaveData: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>) => {
    const res = await fetch('/api/leave-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData),
    })
    const result = await res.json()
    if (result.success) {
      setLeaveRequests((prev) => [...prev, result.data])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add leave request')
  }, [])

  const updateLeaveRequest = useCallback(async (id: string, updates: Partial<LeaveRequest>) => {
    console.log('[updateLeaveRequest] Request:', { id, updates })
    const res = await fetch('/api/leave-requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    const result = await res.json()
    console.log('[updateLeaveRequest] Response:', result)
    if (result.success) {
      setLeaveRequests((prev) =>
        prev.map((leave) => (leave.id === id ? result.data : leave))
      )
    } else {
      console.error('[updateLeaveRequest] Error:', result.error)
      throw new Error(result.error?.message || 'Failed to update leave request')
    }
  }, [])

  const deleteLeaveRequest = useCallback(async (id: string) => {
    const res = await fetch(`/api/leave-requests?id=${id}`, {
      method: 'DELETE',
    })
    const result = await res.json()
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
    const res = await fetch('/api/constraints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(constraintData),
    })
    const result = await res.json()
    if (result.success) {
      setConstraints((prev) => [...prev, result.data])
      return result.data
    }
    throw new Error(result.error?.message || 'Failed to add constraint')
  }, [])

  const updateConstraint = useCallback(async (id: string, updates: Partial<AIConstraintGuideline>) => {
    const res = await fetch('/api/constraints', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    const result = await res.json()
    if (result.success) {
      setConstraints((prev) =>
        prev.map((constraint) => (constraint.id === id ? result.data : constraint))
      )
    } else {
      throw new Error(result.error?.message || 'Failed to update constraint')
    }
  }, [])

  const deleteConstraint = useCallback(async (id: string) => {
    const res = await fetch(`/api/constraints?id=${id}`, {
      method: 'DELETE',
    })
    const result = await res.json()
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
