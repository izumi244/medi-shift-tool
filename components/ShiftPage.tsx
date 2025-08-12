'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Download, RefreshCw } from 'lucide-react';

interface ShiftAssignment {
  am?: string;
  pm?: string;
  timeInfo: string;
  isHoliday?: boolean;
  isClinicOnly?: boolean;
}

interface Employee {
  id: string;
  name: string;
  type: string;
  employmentType: 'full-time' | 'part-time';
  position: 'nurse' | 'technician';
}

interface ShiftData {
  [employeeId: string]: {
    [day: number]: ShiftAssignment;
  };
}

const ShiftPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // 2025年8月
  const [editMode, setEditMode] = useState(false);

  // サンプル従業員データ
  const employees: Employee[] = [
    { id: '1', name: '看護師A', type: '常勤・看護師', employmentType: 'full-time', position: 'nurse' },
    { id: '2', name: 'パート看護師A', type: 'パート・看護師', employmentType: 'part-time', position: 'nurse' },
    { id: '3', name: '臨床検査技師A', type: '常勤・臨床検査技師', employmentType: 'full-time', position: 'technician' }
  ];

  // サンプルシフトデータ
  const [shiftData] = useState<ShiftData>({
    '1': {
      1: { am: 'デスク', pm: '処置(採血)', timeInfo: '早番 8:30-17:30' },
      2: { am: '処置(採血)', pm: 'CF中', timeInfo: '遅番 9:30-18:30' },
      3: { pm: 'デスク', timeInfo: '午後のみ 13:00-18:30' },
      4: { timeInfo: '休み', isHoliday: true },
      5: { am: 'エコー', pm: 'CF外', timeInfo: '早番 8:30-17:30' },
      6: { am: '処置(予約)', pm: 'CF洗浄', timeInfo: '早番 8:30-17:30' },
      7: { pm: '健診翌日準備', timeInfo: '健診のみ 9:00-16:30', isClinicOnly: true },
      8: { am: 'CF中', pm: 'エコー', timeInfo: '遅番 9:30-18:30' },
      15: { timeInfo: '有休', isHoliday: true },
      31: { am: 'デスク', pm: '処置(採血)', timeInfo: '早番 8:30-17:30' }
    },
    '2': {
      1: { am: 'デスク', timeInfo: '9:00-15:00' },
      2: { am: '処置(予約)', timeInfo: '9:00-15:00' },
      3: { timeInfo: '休み', isHoliday: true },
      4: { pm: '処置1', timeInfo: '13:00-18:00' },
      5: { am: '処置(採血)', timeInfo: '9:00-15:00' },
      6: { pm: 'CF外', timeInfo: '13:00-18:00' },
      7: { am: 'エコー', timeInfo: '9:00-15:00', isClinicOnly: true },
      8: { am: '処置(フリー)', timeInfo: '9:00-15:00' },
      20: { timeInfo: '希望休', isHoliday: true },
      31: { pm: 'デスク', timeInfo: '13:00-18:00' }
    },
    '3': {
      1: { am: '処置', pm: '処置', timeInfo: '早番 8:30-17:30' },
      2: { am: 'CF洗浄', pm: '健診翌日準備', timeInfo: '早番 8:30-17:30' },
      3: { timeInfo: '休み', isHoliday: true },
      4: { am: 'D(デスク等)', pm: 'エコー', timeInfo: '早番 8:30-17:30' },
      5: { am: '補助、案内', pm: 'CF片付け', timeInfo: '遅番 9:30-18:30' },
      6: { am: '処置', pm: '処置', timeInfo: '早番 8:30-17:30' },
      7: { am: 'エコー', pm: 'CF洗浄', timeInfo: '健診のみ 9:00-16:30', isClinicOnly: true },
      8: { am: 'D(デスク等)', pm: '健診翌日準備', timeInfo: '早番 8:30-17:30' },
      25: { timeInfo: '有休', isHoliday: true },
      31: { am: '補助、案内', pm: 'エコー', timeInfo: '早番 8:30-17:30' }
    }
  });

  // 月の情報を取得
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 日付配列を生成
  const generateDays = () => {
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.toLocaleDateString('ja-JP', { weekday: 'short' });
      days.push({ day, dayOfWeek, isWednesday: dayOfWeek === '水' });
    }
    return days;
  };

  const days = generateDays();

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(month - 1);
    } else {
      newDate.setMonth(month + 1);
    }
    setCurrentDate(newDate);
  };

  // シフトセルをレンダリング
  const renderShiftCell = (employee: Employee, day: number) => {
    const shift = shiftData[employee.id]?.[day];
    if (!shift) {
      return (
        <td key={day} className="border-r border-gray-200 h-10 p-0.5 align-top text-xs">
          <div className="h-full flex flex-col"></div>
        </td>
      );
    }

    let cellClass = "border-r border-gray-200 h-10 p-0.5 align-top text-xs ";
    if (shift.isHoliday) {
      cellClass += "bg-pink-100 ";
    } else if (shift.isClinicOnly) {
      cellClass += "bg-green-100 ";
    }

    return (
      <td key={day} className={cellClass}>
        <div className="h-full flex flex-col text-xs leading-tight">
          <div className="flex-1">
            {(shift.am || shift.pm) && (
              <div className="text-gray-800 font-medium text-xs mb-0.5 truncate">
                {shift.am || ''}{shift.am && shift.pm ? '/' : ''}{shift.pm || ''}
              </div>
            )}
            {shift.isHoliday && (
              <div className="text-center text-red-600 font-medium text-xs mt-1">
                休み
              </div>
            )}
          </div>
          <div className="text-gray-600 text-xs border-t border-gray-200 pt-0.5 text-center leading-none truncate">
            {shift.timeInfo}
          </div>
        </div>
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-2">
      <div className="w-full mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-3 bg-white p-2 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth('prev')}
              className="flex items-center gap-1 px-2 py-1 border border-gray-300 bg-white rounded text-sm hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              前月
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {monthName}
            </h1>
            <button
              onClick={() => changeMonth('next')}
              className="flex items-center gap-1 px-2 py-1 border border-gray-300 bg-white rounded text-sm hover:bg-gray-50 transition-colors"
            >
              次月
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
                editMode
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              編集モード
            </button>
            <button className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
              <Download className="w-3 h-3" />
              PDF出力
            </button>
            <button className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors">
              <RefreshCw className="w-3 h-3" />
              再生成
            </button>
          </div>
        </div>

        {/* シフト表 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="w-full">
            <table className="w-full border-collapse table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-r border-gray-200 p-1 text-center font-medium text-gray-700 w-12 text-xs">
                    従業員
                  </th>
                  {days.map(({ day, dayOfWeek, isWednesday }) => (
                    <th
                      key={day}
                      className={`border-r border-gray-200 p-1 text-center font-medium text-gray-700 text-xs w-auto ${
                        isWednesday ? 'bg-yellow-100' : ''
                      }`}
                      style={{ width: `${(100 - 8) / daysInMonth}%` }}
                    >
                      <div>{day}</div>
                      <div className="text-xs">({dayOfWeek})</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-200">
                    <td className="border-r border-gray-200 p-0.5 text-center w-12 bg-gray-50">
                      <div className="text-xs font-medium text-gray-800 transform -rotate-12 whitespace-nowrap">
                        {employee.name.slice(0, 5)}
                      </div>
                    </td>
                    {days.map(({ day }) => renderShiftCell(employee, day))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 凡例 */}
        <div className="mt-2 flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
            <span className="text-xs text-gray-700">通常勤務</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-pink-100 border border-gray-300 rounded"></div>
            <span className="text-xs text-gray-700">休み</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-gray-300 rounded"></div>
            <span className="text-xs text-gray-700">健診棟のみ（クリニック休診日）</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftPage;