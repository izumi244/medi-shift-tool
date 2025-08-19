'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit3, Download, RefreshCw, ClipboardList, X } from 'lucide-react';

interface ShiftAssignment {
  am?: string;
  pm?: string;
  timeInfo: string;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{employeeId: string, day: number, employeeName: string} | null>(null);
  const [editValues, setEditValues] = useState({am: '', pm: '', timeInfo: ''});

  // サンプル従業員データ
  const employees: Employee[] = [
    { id: '1', name: '看護師A', type: '常勤・看護師', employmentType: 'full-time', position: 'nurse' },
    { id: '2', name: 'パート看護師A', type: 'パート・看護師', employmentType: 'part-time', position: 'nurse' },
    { id: '3', name: '臨床検査技師A', type: '常勤・臨床検査技師', employmentType: 'full-time', position: 'technician' }
  ];

  // ルールに基づいたサンプルシフトデータ（1週間分）
  const [shiftData, setShiftData] = useState<ShiftData>({
    '1': { // 看護師A（常勤）
      1: { am: 'D', pm: '処', timeInfo: '早番' }, // 金曜日
      2: { am: '処', pm: 'CF中', timeInfo: '遅番' }, // 土曜日
      // 3: 日曜日は完全に休み（データなし）
      4: { am: 'CF中', pm: '処', timeInfo: '早番' }, // 月曜日
      5: { am: 'D', pm: 'CF外', timeInfo: '遅番' }, // 火曜日
      6: { am: '健診G', pm: '健診', timeInfo: '早番', isClinicOnly: true }, // 水曜日：健診棟のみ
      15: { timeInfo: '有休' }
    },
    '2': { // パート看護師A
      1: { am: 'D', timeInfo: '9:00-15:00' }, // 金曜日
      2: { am: '処', timeInfo: '9:00-15:00' }, // 土曜日
      // 3: 日曜日は完全に休み（データなし）
      4: { am: 'CF外', timeInfo: '9:00-15:00' }, // 月曜日
      5: { pm: 'D', timeInfo: '13:00-18:00' }, // 火曜日
      6: { timeInfo: '休み' }, // 水曜日：クリニック休診のため休み
      20: { timeInfo: '希望休' }
    },
    '3': { // 臨床検査技師A
      1: { am: '健診G', pm: '健診', timeInfo: '早番' }, // 金曜日
      2: { am: 'CF洗浄', pm: '健診G', timeInfo: '早番' }, // 土曜日
      // 3: 日曜日は完全に休み（データなし）
      4: { am: '健診G', pm: '健診', timeInfo: '早番' }, // 月曜日
      5: { am: '健診', pm: 'CF洗浄', timeInfo: '遅番' }, // 火曜日
      6: { am: 'CF洗浄', pm: '健診G', timeInfo: '遅番', isClinicOnly: true }, // 水曜日：健診棟のみ
      25: { timeInfo: '有休' }
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
      days.push({ 
        day, 
        dayOfWeek, 
        isWednesday: dayOfWeek === '水',
        isSunday: dayOfWeek === '日'
      });
    }
    return days;
  };

  const days = generateDays();

  // 編集機能のハンドラー
  const handleCellClick = (employeeId: string, day: number, employeeName: string) => {
    if (!editMode) return;
    
    const shift = shiftData[employeeId]?.[day];
    setEditingCell({employeeId, day, employeeName});
    setEditValues({
      am: shift?.am || '',
      pm: shift?.pm || '',
      timeInfo: shift?.timeInfo || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;
    
    const {employeeId, day} = editingCell;
    setShiftData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [day]: {
          am: editValues.am,
          pm: editValues.pm,
          timeInfo: editValues.timeInfo
        }
      }
    }));
    
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingCell(null);
    setEditValues({am: '', pm: '', timeInfo: ''});
  };

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

  // 文字数に応じた最適なフォントサイズを計算
  const getOptimalFontSize = (text: string, isWorkplace: boolean = true) => {
    const length = text.length;
    
    if (isWorkplace) {
      // 配置情報（上段）のサイズ調整
      if (length >= 10) return 'text-xs transform scale-[0.4] origin-center leading-none whitespace-nowrap';
      if (length >= 8) return 'text-xs transform scale-[0.5] origin-center leading-none whitespace-nowrap';
      if (length >= 6) return 'text-xs transform scale-[0.65] origin-center leading-none whitespace-nowrap';
      if (length >= 4) return 'text-xs transform scale-[0.8] origin-center leading-none whitespace-nowrap';
      return 'text-xs leading-none whitespace-nowrap';
    } else {
      // 時間情報（下段）のサイズ調整
      if (length >= 12) return 'text-xs transform scale-[0.5] origin-center leading-none whitespace-nowrap';
      if (length >= 8) return 'text-xs transform scale-[0.65] origin-center leading-none whitespace-nowrap';
      if (length >= 6) return 'text-xs transform scale-[0.75] origin-center leading-none whitespace-nowrap';
      return 'text-xs leading-none whitespace-nowrap';
    }
  };

  // シフトセルをレンダリング
  const renderShiftCell = (employee: Employee, day: number, dayInfo: { isSunday: boolean, isWednesday: boolean }) => {
    const shift = shiftData[employee.id]?.[day];
    
    if (!shift) {
      return (
        <td key={day} className={`border-r border-gray-200 h-20 p-0.5 align-top ${
          dayInfo.isSunday ? 'bg-pink-100' :
          dayInfo.isWednesday ? 'bg-green-100' : ''
        } ${editMode ? 'cursor-pointer hover:bg-yellow-50' : ''}`}
        onClick={() => handleCellClick(employee.id, day, employee.name)}>
          <div className="h-full flex flex-col"></div>
        </td>
      );
    }

    let cellClass = "border-r border-gray-200 h-20 p-0.5 align-top ";
    if (dayInfo.isSunday) {
      cellClass += "bg-pink-100 ";
    } else if (dayInfo.isWednesday) {
      cellClass += "bg-green-100 ";
    }
    if (editMode) {
      cellClass += "cursor-pointer hover:bg-yellow-50 ";
    }

    // 配置情報を結合
    const cellContent = (shift.am || '') + (shift.am && shift.pm ? '/' : '') + (shift.pm || '');
    const workplaceFontSize = getOptimalFontSize(cellContent, true);
    const timeFontSize = getOptimalFontSize(shift.timeInfo, false);

    return (
      <td key={day} className={cellClass} onClick={() => handleCellClick(employee.id, day, employee.name)}>
        {/* 休みの場合：セル全体結合 */}
        {(!shift.am && !shift.pm && (shift.timeInfo === '休み' || shift.timeInfo === '有休' || shift.timeInfo === '希望休')) ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-red-600 font-medium text-sm">
              休
            </div>
          </div>
        ) : (
          /* 通常勤務の場合：上下分割 */
          <div className="h-full flex flex-col">
            {/* 上段：配置情報 - 高さ統一 */}
            <div className="h-10 flex items-center justify-center px-0.5 overflow-hidden">
              <div className={`text-gray-800 font-medium text-center ${workplaceFontSize}`}>
                {cellContent}
              </div>
            </div>
            {/* 下段：時間情報 */}
            <div className="h-10 flex items-center justify-center border-t border-gray-200 px-0.5 overflow-hidden">
              <div className={`text-gray-600 text-center ${timeFontSize}`}>
                {shift.timeInfo}
              </div>
            </div>
          </div>
        )}
      </td>
    );
  };

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <ClipboardList className="w-8 h-8" />
          シフト表示
        </h2>
        <p className="text-lg text-gray-600">
          作成されたシフト表の確認・編集
        </p>
      </div>

      {/* シフト表コンテンツ */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-1">
        <div className="w-full mx-auto">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-2 bg-white p-1 rounded shadow-sm">
            <div className="flex items-center gap-1">
              <button
                onClick={() => changeMonth('prev')}
                className="flex items-center gap-1 px-2 py-1 border border-gray-300 bg-white rounded text-xs hover:bg-gray-50 transition-colors text-gray-700"
              >
                <ChevronLeft className="w-3 h-3 text-gray-700" />
                前月
              </button>
              <h1 className="text-xl font-bold text-gray-800">
                {monthName}
              </h1>
              <button
                onClick={() => changeMonth('next')}
                className="flex items-center gap-1 px-2 py-1 border border-gray-300 bg-white rounded text-xs hover:bg-gray-50 transition-colors text-gray-700"
              >
                次月
                <ChevronRight className="w-3 h-3 text-gray-700" />
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  editMode
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                {editMode ? '編集中' : '編集モード'}
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
                      {/* 空欄 */}
                    </th>
                    {days.map(({ day, dayOfWeek, isWednesday, isSunday }) => (
                      <th
                        key={day}
                        className={`border-r border-gray-200 p-0.5 text-center font-medium text-gray-700 text-xs w-auto ${
                          isSunday ? 'bg-pink-100' :
                          isWednesday ? 'bg-green-100' : ''
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
                  {/* 備考行 */}
                  <tr className="border-b border-gray-200">
                    <td className="border-r border-gray-200 p-0.5 text-center w-8 bg-gray-50">
                      <div className="text-xs font-medium text-gray-800 text-center">
                        備考
                      </div>
                    </td>
                    {days.map(({ day, isSunday, isWednesday }) => (
                      <td key={day} className={`border-r border-gray-200 h-10 p-0.5 align-top ${
                        isSunday ? 'bg-pink-100' :
                        isWednesday ? 'bg-green-100' : ''
                      }`}>
                        {/* 空欄 */}
                      </td>
                    ))}
                  </tr>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-200">
                      <td className="border-r border-gray-200 p-0.5 text-center w-8 bg-gray-50">
                        <div className="text-xs font-medium text-gray-800 text-center">
                          {employee.name.slice(0, 4)}
                        </div>
                      </td>
                      {days.map(({ day, isSunday, isWednesday }) => renderShiftCell(employee, day, { isSunday, isWednesday }))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 編集モーダル */}
      {isEditModalOpen && editingCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">シフト編集</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">
                {editingCell.employeeName} - {currentDate.getMonth() + 1}月{editingCell.day}日
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  午前配置
                </label>
                <input
                  type="text"
                  value={editValues.am}
                  onChange={(e) => setEditValues(prev => ({ ...prev, am: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                  placeholder="例：D、処、CF中など"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  午後配置
                </label>
                <input
                  type="text"
                  value={editValues.pm}
                  onChange={(e) => setEditValues(prev => ({ ...prev, pm: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                  placeholder="例：処、CF外、健診など"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  時間情報
                </label>
                <input
                  type="text"
                  value={editValues.timeInfo}
                  onChange={(e) => setEditValues(prev => ({ ...prev, timeInfo: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                  placeholder="例：早番、遅番、9:00-15:00、休み"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftPage;