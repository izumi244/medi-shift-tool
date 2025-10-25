'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  MapPin,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useShiftData } from '@/contexts/ShiftDataContext';
import type { Employee, EmploymentType, JobType } from '@/types';

const EmployeePage: React.FC = () => {
  const { employees, shiftPatterns, workplaces, addEmployee, updateEmployee, deleteEmployee: deleteEmployeeFromContext } = useShiftData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchText, setSearchText] = useState('');

  // 曜日の英語→日本語変換マップ
  const dayMapping: Record<string, string> = {
    'monday': '月',
    'tuesday': '火',
    'wednesday': '水',
    'thursday': '木',
    'friday': '金',
    'saturday': '土',
    'sunday': '日'
  };

  // 曜日を日本語に統一する関数
  const normalizeDayToJapanese = (day: string): string => {
    return dayMapping[day.toLowerCase()] || day;
  };

  // 配置場所をworkplacesから動的に生成
  const facilityOptions = React.useMemo(() => {
    const uniqueWorkplaces = new Map<string, { value: string; label: string; category: string }>();

    workplaces.forEach(wp => {
      if (!uniqueWorkplaces.has(wp.name)) {
        uniqueWorkplaces.set(wp.name, {
          value: wp.name,
          label: wp.name,
          category: wp.facility
        });
      }
    });

    return Array.from(uniqueWorkplaces.values());
  }, [workplaces]);

  const dayOptions = ['月', '火', '水', '木', '金', '土'];

  const getInitialFormData = () => ({
    name: '',
    employment_type: '常勤' as EmploymentType,
    job_type: '看護師' as JobType,
    available_days: ['月', '火', '水', '木', '金', '土'],
    assignable_workplaces_by_day: {
      '月': [], '火': [], '水': [], '木': [], '金': [], '土': []
    } as Record<string, string[]>,
    assignable_shift_pattern_ids: [] as string[],
    day_constraints: [] as { if: string; then: string; }[]
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const filteredEmployees = employees.filter(emp => emp.is_active && emp.name.toLowerCase().includes(searchText.toLowerCase()));

  const getAvailableFacilitiesForDay = (day: string) => {
    if (day === '水') {
      return facilityOptions.filter(f => f.category === '健診棟');
    }
    return facilityOptions;
  };

  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);

      // 曜日を日本語に正規化
      const normalizedDays = employee.available_days.map(day => normalizeDayToJapanese(day));
      const availableDays = normalizedDays.includes('土')
        ? normalizedDays
        : [...normalizedDays, '土'];

      // assignable_workplaces_by_dayのキーも日本語に正規化
      const normalizedWorkplaces: Record<string, string[]> = {};
      Object.entries(employee.assignable_workplaces_by_day || {}).forEach(([day, workplaces]) => {
        const japaneseDay = normalizeDayToJapanese(day);
        normalizedWorkplaces[japaneseDay] = workplaces;
      });

      if (!normalizedWorkplaces['土']) {
        normalizedWorkplaces['土'] = [];
      }

      setFormData({
        name: employee.name,
        employment_type: employee.employment_type,
        job_type: employee.job_type,
        available_days: availableDays,
        assignable_workplaces_by_day: normalizedWorkplaces,
        assignable_shift_pattern_ids: employee.assignable_shift_pattern_ids || [],
        day_constraints: employee.day_constraints || []
      });
    } else {
      setEditingEmployee(null);
      setFormData(getInitialFormData());
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const saveEmployee = async () => {
    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, formData);
    } else {
      await addEmployee(formData);
    }
    closeModal();
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('この従業員を削除しますか？')) {
      await deleteEmployeeFromContext(id);
    }
  };

  const updateCheckboxArray = <K extends keyof typeof formData>(field: K, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];

      const newState = {
        ...prev,
        [field]: newValues
      };

      if (field === 'available_days') {
        const newAssignableWorkplaces = { ...prev.assignable_workplaces_by_day };
        if (!newValues.includes(value)) {
          delete newAssignableWorkplaces[value];
        } else if (!newAssignableWorkplaces[value]) {
          newAssignableWorkplaces[value] = [];
        }
        newState.assignable_workplaces_by_day = newAssignableWorkplaces;
      }

      return newState;
    });
  };

  const employmentTypeColors = {
    '常勤': 'bg-blue-100 text-blue-800 border-blue-200',
    'パート': 'bg-purple-100 text-purple-800 border-purple-200'
  };

  const jobTypeIcons = {
    '看護師': '🩺',
    '臨床検査技師': '🔬'
  };

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <Users className="w-8 h-8" />
          従業員管理
        </h2>
        <p className="text-lg text-gray-600">
          従業員の基本情報、勤務日、配置、対応シフトを管理
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="従業員名で検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors w-full md:w-64 text-gray-800"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          新規従業員追加
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">氏名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">雇用/職種</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">対応シフト</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">勤務可能曜日</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg">
                        {jobTypeIcons[employee.job_type]}
                      </div>
                      <div className="font-semibold text-gray-900">{employee.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${employmentTypeColors[employee.employment_type]} w-fit`}>
                        {employee.employment_type}
                      </span>
                      <span className="text-sm text-gray-700">{employee.job_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {employee.assignable_shift_pattern_ids.map(patternId => {
                        const pattern = shiftPatterns.find(p => p.id === patternId);
                        return pattern ? (
                          <span key={patternId} className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: pattern.color }}>
                            {pattern.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {employee.available_days.map((day) => (
                        <span key={day} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {normalizeDayToJapanese(day)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(employee)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">
                {editingEmployee ? '従業員編集' : '新規従業員追加'}
              </h3>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Users className="w-5 h-5" />基本情報</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800" placeholder="例：看護師A" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">雇用形態 <span className="text-red-500">*</span></label>
                    <select value={formData.employment_type} onChange={(e) => setFormData(prev => ({ ...prev, employment_type: e.target.value as EmploymentType }))} className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800">
                      <option value="常勤">常勤</option>
                      <option value="パート">パート</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">職種 <span className="text-red-500">*</span></label>
                  <select value={formData.job_type} onChange={(e) => setFormData(prev => ({ ...prev, job_type: e.target.value as JobType }))} className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800">
                    <option value="看護師">看護師</option>
                    <option value="臨床検査技師">臨床検査技師</option>
                  </select>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                 <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Clock className="w-5 h-5" />対応可能シフトパターン</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {shiftPatterns.map(pattern => (
                        <label key={pattern.id} className="flex items-center gap-2 p-3 rounded-lg cursor-pointer border-2" style={{ backgroundColor: formData.assignable_shift_pattern_ids.includes(pattern.id) ? pattern.color : 'white' }}>
                            <input
                                type="checkbox"
                                checked={formData.assignable_shift_pattern_ids.includes(pattern.id)}
                                onChange={() => updateCheckboxArray('assignable_shift_pattern_ids', pattern.id)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="font-medium text-gray-700">{pattern.name}</span>
                        </label>
                    ))}
                 </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><RefreshCw className="w-5 h-5" />勤務制約</h4>
                <label className="flex items-center gap-2 p-3 rounded-lg cursor-pointer border-2 bg-white">
                  <input
                    type="checkbox"
                    checked={formData.day_constraints.some(c => c.if === '水' && c.then === '木')}
                    onChange={() => {
                      const rule = { if: '水', then: '木' };
                      const hasRule = formData.day_constraints.some(c => c.if === rule.if && c.then === rule.then);
                      const newConstraints = hasRule
                        ? formData.day_constraints.filter(c => c.if !== rule.if || c.then !== rule.then)
                        : [...formData.day_constraints, rule];
                      setFormData(prev => ({ ...prev, day_constraints: newConstraints }));
                    }}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="font-medium text-gray-700">水曜に出勤した場合、木曜は必ず休み</span>
                </label>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><Calendar className="w-5 h-5" />曜日別配置可能場所 <span className="text-red-500">*</span></h4>
                <div className="space-y-2">
                  {dayOptions.map((day) => (
                    <div key={day} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <input type="checkbox" checked={formData.available_days.includes(day)} onChange={() => updateCheckboxArray('available_days', day)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200" />
                        <span className="text-sm font-semibold text-gray-800">{day}曜日</span>
                        {formData.available_days.includes(day) && <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">勤務日</span>}
                        {day === '水' && <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">クリニック棟休診</span>}
                      </div>
                      {formData.available_days.includes(day) && (
                        <div className="ml-7">
                          <div className="text-xs font-medium text-gray-600 mb-1">クリニック棟</div>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-1">
                            {facilityOptions.filter(f => f.category === 'クリニック棟').map((facility) => (
                              <label key={`${day}-${facility.value}`} className="flex items-center gap-1 cursor-pointer text-xs">
                                <input type="checkbox" checked={formData.assignable_workplaces_by_day[day]?.includes(facility.value) || false} onChange={(e) => { const dayWorkplaces = formData.assignable_workplaces_by_day[day] || []; const newDayWorkplaces = e.target.checked ? [...dayWorkplaces, facility.value] : dayWorkplaces.filter(w => w !== facility.value); setFormData(prev => ({ ...prev, assignable_workplaces_by_day: { ...prev.assignable_workplaces_by_day, [day]: newDayWorkplaces } })); }} className="w-3 h-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200" disabled={day === '水'} />
                                <span className={`text-gray-700 ${day === '水' ? 'text-gray-400' : ''}`}>{facility.label}</span>
                              </label>
                            ))}
                          </div>
                          <div className="text-xs font-medium text-gray-600 mt-2 mb-1">健診棟</div>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-1">
                            {facilityOptions.filter(f => f.category === '健診棟').map((facility) => (
                              <label key={`${day}-${facility.value}`} className="flex items-center gap-1 cursor-pointer text-xs">
                                <input type="checkbox" checked={formData.assignable_workplaces_by_day[day]?.includes(facility.value) || false} onChange={(e) => { const dayWorkplaces = formData.assignable_workplaces_by_day[day] || []; const newDayWorkplaces = e.target.checked ? [...dayWorkplaces, facility.value] : dayWorkplaces.filter(w => w !== facility.value); setFormData(prev => ({ ...prev, assignable_workplaces_by_day: { ...prev.assignable_workplaces_by_day, [day]: newDayWorkplaces } })); }} className="w-3 h-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200" />
                                <span className="text-gray-700">{facility.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={closeModal} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors">キャンセル</button>
                <button type="button" onClick={saveEmployee} disabled={!formData.name || formData.available_days.length === 0} className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300">{editingEmployee ? '更新' : '追加'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePage;
