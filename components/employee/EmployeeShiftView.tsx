'use client'

import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useShiftData } from '@/contexts/ShiftDataContext'
import type { Employee } from '@/types'

interface ShiftAssignment {
  am?: string
  pm?: string
  patternId?: string
  customStartTime?: string
  customEndTime?: string
  isRest?: boolean
  restReason?: string
}

interface ShiftData {
  [employeeId: string]: {
    [day: number]: ShiftAssignment
  }
}

const EmployeeShiftView: React.FC = () => {
  const { user } = useAuth()
  const { employees, shiftPatterns, shifts, leaveRequests, loading } = useShiftData()

  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  // Find the current employee's ID based on employee_number
  const currentEmployeeId = useMemo(() => {
    return employees.find(emp => emp.employee_number === user?.employee_number)?.id || ''
  }, [employees, user?.employee_number])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(month + (direction === 'prev' ? -1 : 1))
    setCurrentDate(newDate)
  }

  const days = useMemo(() => {
    const daysArray = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' })
      daysArray.push({
        day,
        dayOfWeek,
        isSunday: dayOfWeek === '日',
        isSaturday: dayOfWeek === '土',
        isWednesday: dayOfWeek === '水',
      })
    }
    return daysArray
  }, [year, month, daysInMonth])

  // Build shift data the same way as ShiftPage
  const shiftData: ShiftData = useMemo(() => {
    const data: ShiftData = {}

    shifts.forEach(shift => {
      const shiftDate = new Date(shift.date)
      if (shiftDate.getFullYear() === year && shiftDate.getMonth() === month) {
        const day = shiftDate.getDate()
        if (!data[shift.employee_id]) data[shift.employee_id] = {}
        data[shift.employee_id][day] = {
          am: shift.am_workplace || undefined,
          pm: shift.pm_workplace || undefined,
          patternId: shift.shift_pattern_id || undefined,
          customStartTime: shift.custom_start_time || undefined,
          customEndTime: shift.custom_end_time || undefined,
          isRest: shift.is_rest,
          restReason: shift.rest_reason || undefined,
        }
      }
    })

    leaveRequests.forEach(leave => {
      if (leave.status === '承認') {
        const leaveDate = new Date(leave.date)
        if (leaveDate.getFullYear() === year && leaveDate.getMonth() === month) {
          const day = leaveDate.getDate()
          if (!data[leave.employee_id]) data[leave.employee_id] = {}
          if (!data[leave.employee_id][day]) {
            if (leave.leave_type === '出勤可能') {
              data[leave.employee_id][day] = { isRest: false, restReason: leave.leave_type }
            } else {
              data[leave.employee_id][day] = { isRest: true, restReason: leave.leave_type }
            }
          }
        }
      }
    })

    return data
  }, [shifts, leaveRequests, year, month])

  const formatTime = (time: string): string => time.substring(0, 5)

  const getShiftTimeLabel = (shift: ShiftAssignment): string => {
    if (shift.isRest) return shift.restReason || '休み'
    if (shift.patternId) {
      const pattern = shiftPatterns.find(p => p.id === shift.patternId)
      return pattern ? `${formatTime(pattern.start_time)}~${formatTime(pattern.end_time)}` : '不明'
    }
    if (shift.customStartTime && shift.customEndTime) {
      return `${formatTime(shift.customStartTime)}~${formatTime(shift.customEndTime)}`
    }
    return ''
  }

  // Mobile card view for a single employee
  const renderMobileCard = (employee: Employee) => {
    const isMe = employee.id === currentEmployeeId

    return (
      <div key={employee.id} className={`rounded-xl border ${isMe ? 'border-indigo-300 bg-indigo-50/50' : 'border-gray-200 bg-white'} mb-4`}>
        <div className={`px-4 py-3 border-b ${isMe ? 'border-indigo-200 bg-indigo-100/50' : 'border-gray-100'} rounded-t-xl`}>
          <div className="flex items-center gap-2">
            {isMe && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">自分</span>}
            <span className={`font-semibold ${isMe ? 'text-indigo-800' : 'text-gray-800'}`}>{employee.name}</span>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Day headers */}
            {days.map(({ day, dayOfWeek, isSunday, isSaturday }) => (
              <div key={day} className="text-center">
                <div className={`text-[10px] font-medium ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-500'}`}>
                  {day}
                </div>
                <div className={`text-[10px] ${isSunday ? 'text-red-400' : isSaturday ? 'text-blue-400' : 'text-gray-400'}`}>
                  {dayOfWeek}
                </div>
                {(() => {
                  const shift = shiftData[employee.id]?.[day]
                  if (!shift) return <div className="h-8" />

                  const isAvailableToWork = shift.restReason === '出勤可能' && !shift.isRest

                  if (shift.isRest) {
                    // For other employees, hide the rest_reason
                    const restLabel = isMe ? (shift.restReason || '休み') : '休み'
                    return (
                      <div className="text-[9px] text-red-500 font-medium bg-red-50 rounded px-0.5 py-1 mt-0.5 leading-tight">
                        {restLabel}
                      </div>
                    )
                  }

                  if (isAvailableToWork) {
                    return (
                      <div className="text-[9px] text-cyan-600 font-medium bg-cyan-50 rounded px-0.5 py-1 mt-0.5 leading-tight">
                        出勤可
                      </div>
                    )
                  }

                  const workplace = (shift.am || '') + (shift.am && shift.pm ? '/' : '') + (shift.pm || '')
                  return (
                    <div className="text-[9px] text-gray-700 bg-gray-50 rounded px-0.5 py-1 mt-0.5 leading-tight">
                      {workplace || '-'}
                    </div>
                  )
                })()}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Desktop table view
  const renderDesktopTable = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed min-w-[1200px]">
          <thead>
            <tr>
              <th className="w-28 border-r border-gray-200 p-2 text-sm font-semibold text-gray-700 bg-gray-50 sticky left-0 z-10">
                従業員
              </th>
              {days.map(({ day, dayOfWeek, isWednesday, isSunday, isSaturday }) => (
                <th
                  key={day}
                  className={`p-1 text-center font-medium text-xs w-20 ${
                    isSunday ? 'bg-pink-50 text-red-600' : isSaturday ? 'bg-blue-50 text-blue-600' : isWednesday ? 'bg-green-50' : 'bg-gray-50'
                  } text-gray-700`}
                >
                  <div>{day}</div>
                  <div>({dayOfWeek})</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map((employee) => {
              const isMe = employee.id === currentEmployeeId
              return (
                <tr
                  key={employee.id}
                  className={`border-b border-gray-200 ${isMe ? 'bg-indigo-50/60' : ''}`}
                >
                  <td className={`border-r border-gray-200 p-2 text-sm font-semibold text-left sticky left-0 z-10 ${
                    isMe ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-50 text-gray-800'
                  }`}>
                    <div className="flex items-center gap-1">
                      {isMe && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">自分</span>}
                      <span>{employee.name}</span>
                    </div>
                  </td>
                  {days.map(({ day, isSunday, isWednesday, isSaturday }) => {
                    const shift = shiftData[employee.id]?.[day]
                    const isAvailableToWork = shift?.restReason === '出勤可能' && !shift.isRest
                    const bgClass = isMe
                      ? (isSunday ? 'bg-indigo-50' : isWednesday ? 'bg-indigo-50/50' : 'bg-indigo-50/30')
                      : (isSunday ? 'bg-pink-50' : isSaturday ? 'bg-blue-50/30' : isWednesday ? 'bg-green-50' : '')
                    const cellClass = `border-r border-gray-200 h-16 p-0.5 align-top ${bgClass}`

                    if (!shift || (!shift.am && !shift.pm && !shift.isRest && !isAvailableToWork)) {
                      return <td key={day} className={cellClass}></td>
                    }

                    const timeLabel = getShiftTimeLabel(shift)
                    const cellContent = (shift.am || '') + (shift.am && shift.pm ? '/' : '') + (shift.pm || '')

                    return (
                      <td key={day} className={cellClass}>
                        {shift.isRest ? (
                          <div className="h-full flex items-center justify-center text-center text-red-600 font-medium text-xs">
                            {/* hide rest_reason for other employees */}
                            {isMe ? timeLabel : '休み'}
                          </div>
                        ) : isAvailableToWork ? (
                          <div className="h-full flex items-center justify-center text-center text-cyan-600 font-medium text-xs">
                            出勤可能
                          </div>
                        ) : (
                          <div className="h-full flex flex-col text-xs text-center">
                            <div className="flex-1 flex items-center justify-center px-0.5 overflow-hidden font-medium text-gray-800">
                              {cellContent}
                            </div>
                            <div className="flex-1 flex items-center justify-center border-t border-gray-200 px-0.5 overflow-hidden text-gray-500 text-[10px]">
                              {timeLabel}
                            </div>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  // Sorted employees: current user first
  const sortedEmployees = useMemo(() => {
    const active = employees.filter(e => e.is_active)
    if (!currentEmployeeId) return active
    const me = active.find(e => e.id === currentEmployeeId)
    const others = active.filter(e => e.id !== currentEmployeeId)
    return me ? [me, ...others] : active
  }, [employees, currentEmployeeId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-500">読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-600" />
          シフト確認
        </h2>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={() => changeMonth('prev')}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800 min-w-[120px] text-center text-sm">
            {monthName}
          </span>
          <button
            onClick={() => changeMonth('next')}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Desktop Table (hidden on mobile) */}
      <div className="hidden lg:block">
        {renderDesktopTable()}
      </div>

      {/* Mobile Card View (hidden on desktop) */}
      <div className="lg:hidden">
        {sortedEmployees.map(emp => renderMobileCard(emp))}
      </div>
    </div>
  )
}

export default EmployeeShiftView
