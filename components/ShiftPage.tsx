'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Download, RefreshCw, ClipboardList, X } from 'lucide-react';
import { useShiftData } from '@/contexts/ShiftDataContext';
import type { ShiftPattern, Employee } from '@/types';

// --- Component-Specific Types ---
interface ShiftAssignment {
  am?: string; // workplace
  pm?: string; // workplace
  patternId?: string;
  customStartTime?: string;
  customEndTime?: string;
  isRest?: boolean;
  restReason?: string; // '休み' | '有休' | '希望休'
}

interface ShiftData {
  [employeeId: string]: {
    [day: number]: ShiftAssignment;
  };
}

// --- Main Component ---
const ShiftPage: React.FC = () => {
  const { employees, shiftPatterns, shifts, leaveRequests, addShift, updateShift } = useShiftData();
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [editMode, setEditMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{employeeId: string, day: number, employeeName: string} | null>(null);

  const [editValues, setEditValues] = useState({
    editType: 'pattern' as 'pattern' | 'custom' | 'rest',
    am: '',
    pm: '',
    patternId: '',
    customStartTime: '',
    customEndTime: '',
    restReason: '休み'
  });

  // shiftsデータをShiftData形式に変換（承認済み希望休を含む）
  const shiftData = React.useMemo(() => {
    const data: ShiftData = {};
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 既存のシフトデータを追加
    shifts.forEach(shift => {
      const shiftDate = new Date(shift.date);

      // 現在表示中の月のシフトのみ含める
      if (shiftDate.getFullYear() === year && shiftDate.getMonth() === month) {
        const day = shiftDate.getDate();

        if (!data[shift.employee_id]) {
          data[shift.employee_id] = {};
        }

        data[shift.employee_id][day] = {
          am: shift.am_workplace || undefined,
          pm: shift.pm_workplace || undefined,
          patternId: shift.shift_pattern_id || undefined,
          customStartTime: shift.custom_start_time || undefined,
          customEndTime: shift.custom_end_time || undefined,
          isRest: shift.is_rest,
          restReason: shift.rest_reason || undefined
        };
      }
    });

    // 承認済み希望休を追加（既存シフトがない場合のみ）
    leaveRequests.forEach(leave => {
      if (leave.status === '承認') {
        const leaveDate = new Date(leave.date);

        // 現在表示中の月の承認済み希望休のみ含める
        if (leaveDate.getFullYear() === year && leaveDate.getMonth() === month) {
          const day = leaveDate.getDate();

          if (!data[leave.employee_id]) {
            data[leave.employee_id] = {};
          }

          // 既存のシフトがない場合のみ希望休を表示
          if (!data[leave.employee_id][day]) {
            data[leave.employee_id][day] = {
              isRest: true,
              restReason: leave.leave_type
            };
          }
        }
      }
    });

    return data;
  }, [shifts, leaveRequests, currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const generateDays = () => {
    const daysArray = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' });
      daysArray.push({ day, dayOfWeek, isWednesday: dayOfWeek === '水', isSunday: dayOfWeek === '日' });
    }
    return daysArray;
  };
  const days = generateDays();

  const handleCellClick = (employeeId: string, day: number, employeeName: string) => {
    if (!editMode) return;

    // --- Day Constraint Validation ---
    const employee = employees.find(e => e.id === employeeId);
    const dayInfo = days[day - 1];

    if (employee && employee.day_constraints && employee.day_constraints.length > 0 && dayInfo) {
      for (const constraint of employee.day_constraints) {
        // constraint.then (e.g., '木') matches the clicked day's weekday
        if (constraint.then === dayInfo.dayOfWeek) {
          const previousDayInfo = days[day - 2]; // Day before the clicked day
          // Check if the previous day exists and its weekday matches the 'if' condition
          if (previousDayInfo && previousDayInfo.dayOfWeek === constraint.if) {
            const previousDayShift = shiftData[employeeId]?.[previousDayInfo.day];
            // Check if there was a shift on the previous day (not a rest day)
            if (previousDayShift && !previousDayShift.isRest) {
              alert(`${employee.name}は「${constraint.if}曜出勤後は${constraint.then}曜休み」の制約があります。`);
              return; // Prevent opening the edit modal
            }
          }
        }
      }
    }
    // --- End Validation ---
    
    const shift = shiftData[employeeId]?.[day];
    setEditingCell({employeeId, day, employeeName});

    let editType: 'pattern' | 'custom' | 'rest' = 'pattern';
    if (shift?.isRest) editType = 'rest';
    else if (shift?.customStartTime) editType = 'custom';

    setEditValues({
      editType: editType,
      am: shift?.am || '',
      pm: shift?.pm || '',
      patternId: shift?.patternId || '',
      customStartTime: shift?.customStartTime || '',
      customEndTime: shift?.customEndTime || '',
      restReason: shift?.restReason || '休み'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    const { employeeId, day } = editingCell;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 既存のシフトを探す
    const existingShift = shifts.find(s => {
      const shiftDate = new Date(s.date);
      return s.employee_id === employeeId &&
             shiftDate.getFullYear() === year &&
             shiftDate.getMonth() === month &&
             shiftDate.getDate() === day;
    });

    const shiftData = {
      employee_id: employeeId,
      date: dateString,
      am_workplace: editValues.editType !== 'rest' ? editValues.am : undefined,
      pm_workplace: editValues.editType !== 'rest' ? editValues.pm : undefined,
      shift_pattern_id: editValues.editType === 'pattern' ? editValues.patternId : undefined,
      custom_start_time: editValues.editType === 'custom' ? editValues.customStartTime : undefined,
      custom_end_time: editValues.editType === 'custom' ? editValues.customEndTime : undefined,
      is_rest: editValues.editType === 'rest',
      rest_reason: editValues.editType === 'rest' ? editValues.restReason : undefined,
      status: 'confirmed' as const
    };

    try {
      if (existingShift) {
        await updateShift(existingShift.id, shiftData);
      } else {
        await addShift(shiftData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('シフト保存エラー:', error);
      alert('シフトの保存に失敗しました');
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingCell(null);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month + (direction === 'prev' ? -1 : 1));
    setCurrentDate(newDate);
  };

  // 時刻を HH:MM:SS から HH:MM に変換
  const formatTime = (time: string): string => {
    return time.substring(0, 5); // "08:30:00" -> "08:30"
  };

  const getShiftTimeLabel = (shift: ShiftAssignment): string => {
    if (shift.isRest) return shift.restReason || '休み';
    if (shift.patternId) {
      const pattern = shiftPatterns.find(p => p.id === shift.patternId);
      return pattern ? `${formatTime(pattern.start_time)}~${formatTime(pattern.end_time)}` : '不明';
    }
    if (shift.customStartTime && shift.customEndTime) {
      return `${formatTime(shift.customStartTime)}~${formatTime(shift.customEndTime)}`;
    }
    return '';
  };

  const renderShiftCell = (employee: Employee, day: number, dayInfo: { isSunday: boolean, isWednesday: boolean }) => {
    const shift = shiftData[employee.id]?.[day];
    const cellClass = `border-r border-gray-200 h-20 p-0.5 align-top ${dayInfo.isSunday ? 'bg-pink-50' : dayInfo.isWednesday ? 'bg-green-50' : ''} ${editMode ? 'cursor-pointer hover:bg-yellow-100' : ''}`;

    if (!shift || (!shift.am && !shift.pm && !shift.isRest)) {
      return <td key={day} className={cellClass} onClick={() => handleCellClick(employee.id, day, employee.name)}></td>;
    }

    const timeLabel = getShiftTimeLabel(shift);
    const cellContent = (shift.am || '') + (shift.am && shift.pm ? '/' : '') + (shift.pm || '');

    return (
      <td key={day} className={cellClass} onClick={() => handleCellClick(employee.id, day, employee.name)}>
        {shift.isRest ? (
          <div className="h-full flex items-center justify-center text-center text-red-600 font-medium text-sm">{timeLabel}</div>
        ) : (
          <div className="h-full flex flex-col text-xs text-center">
            <div className="h-10 flex items-center justify-center px-0.5 overflow-hidden font-medium text-gray-800">{cellContent}</div>
            <div className="h-10 flex items-center justify-center border-t border-gray-200 px-0.5 overflow-hidden text-gray-600">{timeLabel}</div>
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="space-y-6">
      <div className="pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3"><ClipboardList className="w-8 h-8" />シフト表示</h2>
        <p className="text-lg text-gray-600">作成されたシフト表の確認・編集</p>
      </div>

      <div className="bg-white p-2 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <button onClick={() => changeMonth('prev')} className="p-2 rounded-md hover:bg-gray-100"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                <h3 className="text-xl font-bold text-gray-800">{monthName}</h3>
                <button onClick={() => changeMonth('next')} className="p-2 rounded-md hover:bg-gray-100"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setEditMode(!editMode)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${editMode ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}><Edit3 className="w-4 h-4" />{editMode ? '編集中' : '編集'}</button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"><Download className="w-4 h-4" />PDF</button>
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[1200px]">
            <thead>
              <tr>
                <th className="w-28 border-r border-gray-200 p-2 text-sm font-semibold text-gray-700 bg-gray-50">従業員</th>
                {days.map(({ day, dayOfWeek, isWednesday, isSunday }) => (
                  <th key={day} className={`p-1 text-center font-medium text-gray-700 text-xs w-20 ${isSunday ? 'bg-pink-50' : isWednesday ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <div>{day}</div><div>({dayOfWeek})</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-gray-200">
                  <td className="border-r border-gray-200 p-2 text-sm font-semibold text-gray-800 bg-gray-50 text-left">{employee.name}</td>
                  {days.map(({ day, isSunday, isWednesday }) => renderShiftCell(employee, day, { isSunday, isWednesday }))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && editingCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-indigo-600">シフト編集</h3>
                <p className="text-gray-600">{editingCell.employeeName} - {month + 1}月{editingCell.day}日</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">午前配置</label>
                      <input type="text" value={editValues.am} onChange={(e) => setEditValues(prev => ({ ...prev, am: e.target.value }))} className="w-full p-3 border-2 border-gray-200 rounded-xl" placeholder="例: D, 処" />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">午後配置</label>
                      <input type="text" value={editValues.pm} onChange={(e) => setEditValues(prev => ({ ...prev, pm: e.target.value }))} className="w-full p-3 border-2 border-gray-200 rounded-xl" placeholder="例: 処, 健診" />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">勤務タイプ</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2"><input type="radio" value="pattern" checked={editValues.editType === 'pattern'} onChange={(e) => setEditValues(p => ({...p, editType: e.target.value as any}))} className="w-4 h-4" />パターン</label>
                  <label className="flex items-center gap-2"><input type="radio" value="custom" checked={editValues.editType === 'custom'} onChange={(e) => setEditValues(p => ({...p, editType: e.target.value as any}))} className="w-4 h-4" />直接入力</label>
                  <label className="flex items-center gap-2"><input type="radio" value="rest" checked={editValues.editType === 'rest'} onChange={(e) => setEditValues(p => ({...p, editType: e.target.value as any}))} className="w-4 h-4" />休み</label>
                </div>
              </div>

              {editValues.editType === 'pattern' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">シフトパターン</label>
                  <select value={editValues.patternId} onChange={(e) => setEditValues(p => ({...p, patternId: e.target.value}))} className="w-full p-3 border-2 border-gray-200 rounded-xl">
                    <option value="">パターンを選択...</option>
                    {shiftPatterns.filter(p => employees.find(e => e.id === editingCell.employeeId)?.assignable_shift_pattern_ids.includes(p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatTime(p.start_time)}-{formatTime(p.end_time)})</option>
                    ))}
                  </select>
                </div>
              )}

              {editValues.editType === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">開始時刻</label>
                    <input type="time" value={editValues.customStartTime} onChange={(e) => setEditValues(p => ({...p, customStartTime: e.target.value}))} className="w-full p-3 border-2 border-gray-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">終了時刻</label>
                    <input type="time" value={editValues.customEndTime} onChange={(e) => setEditValues(p => ({...p, customEndTime: e.target.value}))} className="w-full p-3 border-2 border-gray-200 rounded-xl" />
                  </div>
                </div>
              )}

              {editValues.editType === 'rest' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">理由</label>
                  <select value={editValues.restReason} onChange={(e) => setEditValues(p => ({...p, restReason: e.target.value}))} className="w-full p-3 border-2 border-gray-200 rounded-xl">
                    <option>休み</option>
                    <option>有休</option>
                    <option>希望休</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold">キャンセル</button>
                <button type="button" onClick={handleSaveEdit} className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftPage;
