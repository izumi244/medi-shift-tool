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
      1: { am: 'デスク', pm: '処置(採血)', timeInfo: '早番' },
      2: { am: '処置(採血)', pm: 'CF中', timeInfo: '遅番' },
      3: { pm: 'デスク', timeInfo: '午後のみ' },
      4: { timeInfo: '休み', isHoliday: true },
      5: { am: 'エコー', pm: 'CF外', timeInfo: '早番' },
      6: { am: '処置(予約)', pm: 'CF洗浄', timeInfo: '早番' },
      7: { pm: '健診翌日準備', timeInfo: '健診のみ', isClinicOnly: true },
      8: { am: 'CF中', pm: 'エコー', timeInfo: '遅番' },
      15: { timeInfo: '有休', isHoliday: true },
      31: { am: 'デスク', pm: '処置(採血)', timeInfo: '早番' }
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
      1: { am: '処置', pm: '処置', timeInfo: '早番' },
      2: { am: 'CF洗浄', pm: '健診翌日準備', timeInfo: '早番' },
      3: { timeInfo: '休み', isHoliday: true },
      4: { am: 'D(デスク等)', pm: 'エコー', timeInfo: '早番' },
      5: { am: '補助、案内', pm: 'CF片付け', timeInfo: '遅番' },
      6: { am: '処置', pm: '処置', timeInfo: '早番' },
      7: { am: 'エコー', pm: 'CF洗浄', timeInfo: '健診のみ', isClinicOnly: true },
      8: { am: 'D(デスク等)', pm: '健診翌日準備', timeInfo: '早番' },
      25: { timeInfo: '有休', isHoliday: true },
      31: { am: '補助、案内', pm: 'エコー', timeInfo: '早番' }
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
        <td key={day} className="border-r border-gray-200 h-20 p-0.5 align-top">
          <div className="h-full flex flex-col"></div>
        </td>
      );
    }

    let cellClass = "border-r border-gray-200 h-20 p-0.5 align-top ";
    if (shift.isHoliday) {
      cellClass += "bg-pink-100 ";
    } else if (shift.isClinicOnly) {
      cellClass += "bg-green-100 ";
    }

    // 配置情報の文字数に応じて文字サイズを段階的に調整（極限まで小さく）
    const cellContent = (shift.am || '') + (shift.am && shift.pm ? '/' : '') + (shift.pm || '');
    const textLength = cellContent.length;
    let workplaceFontSize = '';
    
    if (textLength > 12) {
      workplaceFontSize = 'transform scale-50 origin-center leading-none';
    } else if (textLength > 8) {
      workplaceFontSize = 'transform scale-75 origin-center leading-none';
    } else {
      workplaceFontSize = 'text-xs leading-none';
    }

    return (
      <td key={day} className={cellClass}>
        <div className="h-full flex flex-col">
          {/* 上段：配置情報 - 高さ統一 */}
          <div className="h-10 flex items-center justify-center px-0.5">
            {(shift.am || shift.pm) && (
              <div className={`text-gray-800 font-medium text-xs ${workplaceFontSize} text-center break-words`}>
                {cellContent}
              </div>
            )}
            {shift.isHoliday && (
              <div className="text-center text-red-600 font-medium text-xs transform scale-75 origin-center">
                休み
              </div>
            )}
          </div>
          {/* 下段：時間情報 - 高さ統一 */}
          <div className="h-10 flex items-center justify-center border-t border-gray-200 px-0.5">
            <div className="text-gray-600 text-xs text-center break-words transform scale-75 origin-center leading-none">
              {shift.timeInfo}
            </div>
          </div>
        </div>
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-1">
      <div className="w-full mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-2 bg-white p-1 rounded shadow-sm">
          <div className="flex items-center gap-1">
            <button
              onClick={() => changeMonth('prev')}
              className="flex items-center gap-1 px-2 py-1 border border-gray-300 bg-white rounded text-xs hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              前月
            </button>
            <h1 className="text-sm font-semibold text-gray-800">
              {monthName}
            </h1>
            <button
              onClick={() => changeMonth('next')}
              className="flex items-center gap-1 px-2 py-1 border border-gray-300 bg-white rounded text-xs hover:bg-gray-50 transition-colors"
            >
              次月
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                editMode
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              編集モード
            </button>
            <button className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors">
              <Download className="w-3 h-3" />
              PDF出力
            </button>
            <button className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors">
              <RefreshCw className="w-3 h-3" />
              再生成
            </button>
          </div>
        </div>

        {/* シフト表 */}
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="w-full">
            <table className="w-full border-collapse table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-r border-gray-200 p-0.5 text-center font-medium text-gray-700 w-8 text-xs">
                    従業員
                  </th>
                  {days.map(({ day, dayOfWeek, isWednesday }) => (
                    <th
                      key={day}
                      className={`border-r border-gray-200 p-0.5 text-center font-medium text-gray-700 text-xs w-auto ${
                        isWednesday ? 'bg-yellow-100' : ''
                      }`}
                      style={{ width: `${(100 - 6) / daysInMonth}%` }}
                    >
                      <div className="text-xs">{day}</div>
                      <div className="text-xs">({dayOfWeek})</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-200">
                    <td className="border-r border-gray-200 p-0.5 text-center w-8 bg-gray-50">
                      <div className="text-xs font-medium text-gray-800 text-center">
                        {employee.name.slice(0, 4)}
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
        <div className="mt-1 flex items-center gap-2 bg-gray-50 p-1 rounded">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white border border-gray-300 rounded"></div>
            <span className="text-xs text-gray-700">通常勤務</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-pink-100 border border-gray-300 rounded"></div>
            <span className="text-xs text-gray-700">休み</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-100 border border-gray-300 rounded"></div>
            <span className="text-xs text-gray-700">健診棟のみ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftPage;