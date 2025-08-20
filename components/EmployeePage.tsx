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
  Clock
} from 'lucide-react';

// 型定義
type EmploymentType = '常勤' | 'パート';
type JobType = '看護師' | '臨床検査技師';
type FacilityType = 'D' | '処' | 'CF中' | 'CF外' | 'CF洗浄' | '健診G' | '健診' | 'エコー';

interface Employee {
  id: string;
  name: string;
  employment_type: EmploymentType;
  job_type: JobType;
  available_days: string[];
  assignable_workplaces_by_day: Record<string, FacilityType[]>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EmployeePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchText, setSearchText] = useState('');
  
  // フォームデータ（月〜土を最初から開いた状態に）
  const [formData, setFormData] = useState({
    name: '',
    employment_type: '常勤' as EmploymentType,
    job_type: '看護師' as JobType,
    available_days: ['月', '火', '水', '木', '金', '土'] as string[], // 月〜土を最初から選択状態に
    assignable_workplaces_by_day: { 
      '月': [], '火': [], '水': [], '木': [], '金': [], '土': [] 
    } as Record<string, FacilityType[]>
  });

  // サンプル従業員データ
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: '看護師A',
      employment_type: '常勤',
      job_type: '看護師',
      available_days: ['月', '火', '水', '木', '金'],
      assignable_workplaces_by_day: {
        '月': ['D', '処', 'CF中'],
        '火': ['D', '処', 'CF外'],
        '水': ['健診G', '健診'],
        '木': ['D', '処', 'CF中'],
        '金': ['D', '処', 'CF外']
      },
      is_active: true,
      created_at: '2025-08-01T09:00:00Z',
      updated_at: '2025-08-01T09:00:00Z'
    },
    {
      id: '2',
      name: 'パート看護師A',
      employment_type: 'パート',
      job_type: '看護師',
      available_days: ['月', '火', '木', '金'],
      assignable_workplaces_by_day: {
        '月': ['D', '処'],
        '火': ['D', '処'],
        '木': ['D', '処'],
        '金': ['D', '処']
      },
      is_active: true,
      created_at: '2025-08-02T10:30:00Z',
      updated_at: '2025-08-02T10:30:00Z'
    },
    {
      id: '3',
      name: '臨床検査技師A',
      employment_type: '常勤',
      job_type: '臨床検査技師',
      available_days: ['月', '火', '水', '木', '金', '土'],
      assignable_workplaces_by_day: {
        '月': ['健診G', '健診', 'CF洗浄'],
        '火': ['健診G', '健診', 'エコー'],
        '水': ['健診G', '健診'],
        '木': ['健診G', '健診', 'CF洗浄'],
        '金': ['健診G', '健診', 'エコー'],
        '土': ['健診G', '健診']
      },
      is_active: true,
      created_at: '2025-08-03T14:15:00Z',
      updated_at: '2025-08-03T14:15:00Z'
    }
  ]);

  // フィルタリングされた従業員（検索機能無効化）
  const filteredEmployees = employees.filter(emp => emp.is_active);

  // 配置場所オプション（配置場所管理ページから動的取得予定）
  const facilityOptions: { value: FacilityType; label: string; category: string }[] = [
    { value: 'D', label: 'D', category: 'クリニック棟' },
    { value: '処', label: '処', category: 'クリニック棟' },
    { value: 'CF中', label: 'CF中', category: 'クリニック棟' },
    { value: 'CF外', label: 'CF外', category: 'クリニック棟' },
    { value: 'CF洗浄', label: 'CF洗浄', category: 'クリニック棟' },
    { value: '健診G', label: '健診G', category: '健診棟' },
    { value: '健診', label: '健診', category: '健診棟' },
    { value: 'エコー', label: 'エコー', category: '健診棟' }
  ];

  // 曜日オプション（日曜日を削除）
  const dayOptions = ['月', '火', '水', '木', '金', '土'];

  // 水曜日用の配置場所オプション（クリニック棟除外）
  const getAvailableFacilitiesForDay = (day: string) => {
    if (day === '水') {
      // 水曜日はクリニック棟休診のため健診棟のみ
      return facilityOptions.filter(f => f.category === '健診棟');
    }
    return facilityOptions;
  };

  // モーダルを開く
  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      // 編集時も土曜日を確実に開いた状態にする
      const availableDays = employee.available_days.includes('土') 
        ? employee.available_days 
        : [...employee.available_days, '土'];
      
      const assignableWorkplaces = { ...employee.assignable_workplaces_by_day };
      if (!assignableWorkplaces['土']) {
        assignableWorkplaces['土'] = [];
      }
      
      setFormData({
        name: employee.name,
        employment_type: employee.employment_type,
        job_type: employee.job_type,
        available_days: availableDays,
        assignable_workplaces_by_day: assignableWorkplaces
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        employment_type: '常勤',
        job_type: '看護師',
        available_days: ['月', '火', '水', '木', '金', '土'], // 月〜土を最初から選択状態に
        assignable_workplaces_by_day: { 
          '月': [], '火': [], '水': [], '木': [], '金': [], '土': [] 
        }
      });
    }
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({
      name: '',
      employment_type: '常勤',
      job_type: '看護師',
      available_days: ['月', '火', '水', '木', '金', '土'], // 月〜土を最初から選択状態に
      assignable_workplaces_by_day: { 
        '月': [], '火': [], '水': [], '木': [], '金': [], '土': [] 
      }
    });
  };

  // 従業員を保存
  const saveEmployee = () => {
    const now = new Date().toISOString();

    if (editingEmployee) {
      // 編集
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...formData, updated_at: now }
          : emp
      ));
    } else {
      // 新規追加
      const newEmployee: Employee = {
        id: (employees.length + 1).toString(),
        ...formData,
        is_active: true,
        created_at: now,
        updated_at: now
      };
      setEmployees(prev => [...prev, newEmployee]);
    }
    
    closeModal();
  };

  // 従業員を削除
  const deleteEmployee = (id: string) => {
    if (confirm('この従業員を削除しますか？')) {
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, is_active: false } : emp
      ));
    }
  };

  // チェックボックス配列の更新
  const updateArrayField = (field: 'available_days', value: string) => {
    setFormData(prev => {
      const newAvailableDays = prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value];
      
      // 曜日を削除する場合、その曜日の配置場所も削除
      const newAssignableWorkplaces = { ...prev.assignable_workplaces_by_day };
      if (!newAvailableDays.includes(value)) {
        delete newAssignableWorkplaces[value];
      } else if (!newAssignableWorkplaces[value]) {
        newAssignableWorkplaces[value] = [];
      }

      return {
        ...prev,
        [field]: newAvailableDays,
        assignable_workplaces_by_day: newAssignableWorkplaces
      };
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
      {/* ページヘッダー */}
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <Users className="w-8 h-8" />
          従業員管理
        </h2>
        <p className="text-lg text-gray-600">
          従業員の基本情報と曜日別配置可能場所を管理
        </p>
      </div>

      {/* 検索・追加ボタン */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="従業員名で検索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors w-full md:w-64 text-gray-800"
            />
          </div>
        </div>

        {/* 追加ボタン */}
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          新規従業員追加
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">総従業員数</div>
              <div className="text-xl font-bold text-blue-600">
                {employees.filter(e => e.is_active).length}人
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">常勤スタッフ</div>
              <div className="text-xl font-bold text-green-600">
                {employees.filter(e => e.is_active && e.employment_type === '常勤').length}人
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">パートスタッフ</div>
              <div className="text-xl font-bold text-purple-600">
                {employees.filter(e => e.is_active && e.employment_type === 'パート').length}人
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">配置場所</div>
              <div className="text-xl font-bold text-orange-600">
                {facilityOptions.length}箇所
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 従業員一覧テーブル */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">氏名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">雇用形態</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">職種</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">配置可能場所</th>
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
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${employmentTypeColors[employee.employment_type]}`}>
                      {employee.employment_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{employee.job_type}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {Object.values(employee.assignable_workplaces_by_day)
                        .flat()
                        .filter((value, index, self) => self.indexOf(value) === index) // 重複除去
                        .slice(0, 3)
                        .map((facility) => (
                          <span key={facility} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {facility}
                          </span>
                        ))}
                      {Object.values(employee.assignable_workplaces_by_day).flat().filter((value, index, self) => self.indexOf(value) === index).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{Object.values(employee.assignable_workplaces_by_day).flat().filter((value, index, self) => self.indexOf(value) === index).length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {employee.available_days.map((day) => (
                        <span key={day} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {day}
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
                        onClick={() => deleteEmployee(employee.id)}
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

      {/* 従業員編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">
                {editingEmployee ? '従業員編集' : '新規従業員追加'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-5">
              {/* 基本情報セクション */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  基本情報
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      氏名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                      placeholder="例：看護師A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      雇用形態 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.employment_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, employment_type: e.target.value as EmploymentType }))}
                      className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                    >
                      <option value="常勤">常勤</option>
                      <option value="パート">パート</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    職種 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.job_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_type: e.target.value as JobType }))}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                  >
                    <option value="看護師">看護師</option>
                    <option value="臨床検査技師">臨床検査技師</option>
                  </select>
                </div>
              </div>

              {/* 曜日別配置可能場所セクション */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  曜日別配置可能場所 <span className="text-red-500">*</span>
                </h4>
                <div className="space-y-2">
                  {dayOptions.map((day) => (
                    <div key={day} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={formData.available_days.includes(day)}
                          onChange={() => updateArrayField('available_days', day)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200"
                        />
                        <span className="text-sm font-semibold text-gray-800">{day}曜日</span>
                        {formData.available_days.includes(day) && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            勤務日
                          </span>
                        )}
                        {day === '水' && (
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                            クリニック棟休診
                          </span>
                        )}
                      </div>
                      {formData.available_days.includes(day) && (
                        <div className="ml-7">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">配置可能場所:</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const availableFacilities = getAvailableFacilitiesForDay(day).map(f => f.value);
                                  setFormData(prev => ({
                                    ...prev,
                                    assignable_workplaces_by_day: {
                                      ...prev.assignable_workplaces_by_day,
                                      [day]: availableFacilities
                                    }
                                  }));
                                }}
                                className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                              >
                                全選択
                              </button>
                              {day !== '水' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const clinicFacilities = facilityOptions
                                      .filter(f => f.category === 'クリニック棟')
                                      .map(f => f.value);
                                    setFormData(prev => ({
                                      ...prev,
                                      assignable_workplaces_by_day: {
                                        ...prev.assignable_workplaces_by_day,
                                        [day]: clinicFacilities
                                      }
                                    }));
                                  }}
                                  className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                >
                                  クリニック
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const kenshinFacilities = facilityOptions
                                    .filter(f => f.category === '健診棟')
                                    .map(f => f.value);
                                  setFormData(prev => ({
                                    ...prev,
                                    assignable_workplaces_by_day: {
                                      ...prev.assignable_workplaces_by_day,
                                      [day]: kenshinFacilities
                                    }
                                  }));
                                }}
                                className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                              >
                                健診
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    assignable_workplaces_by_day: {
                                      ...prev.assignable_workplaces_by_day,
                                      [day]: []
                                    }
                                  }));
                                }}
                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                              >
                                クリア
                              </button>
                            </div>
                          </div>
                          
                          {/* クリニック棟（水曜日は非表示） */}
                          {day !== '水' && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-gray-600 mb-1">クリニック棟</div>
                              <div className="grid grid-cols-3 md:grid-cols-5 gap-1">
                                {facilityOptions
                                  .filter(f => f.category === 'クリニック棟')
                                  .map((facility) => (
                                  <label key={`${day}-${facility.value}`} className="flex items-center gap-1 cursor-pointer text-xs">
                                    <input
                                      type="checkbox"
                                      checked={formData.assignable_workplaces_by_day[day]?.includes(facility.value) || false}
                                      onChange={(e) => {
                                        const dayWorkplaces = formData.assignable_workplaces_by_day[day] || [];
                                        const newDayWorkplaces = e.target.checked
                                          ? [...dayWorkplaces, facility.value]
                                          : dayWorkplaces.filter(w => w !== facility.value);
                                        
                                        setFormData(prev => ({
                                          ...prev,
                                          assignable_workplaces_by_day: {
                                            ...prev.assignable_workplaces_by_day,
                                            [day]: newDayWorkplaces
                                          }
                                        }));
                                      }}
                                      className="w-3 h-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200"
                                    />
                                    <span className="text-gray-700">{facility.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 健診棟 */}
                          <div>
                            <div className="text-xs font-medium text-gray-600 mb-1">健診棟</div>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-1">
                              {facilityOptions
                                .filter(f => f.category === '健診棟')
                                .map((facility) => (
                                <label key={`${day}-${facility.value}`} className="flex items-center gap-1 cursor-pointer text-xs">
                                  <input
                                    type="checkbox"
                                    checked={formData.assignable_workplaces_by_day[day]?.includes(facility.value) || false}
                                    onChange={(e) => {
                                      const dayWorkplaces = formData.assignable_workplaces_by_day[day] || [];
                                      const newDayWorkplaces = e.target.checked
                                        ? [...dayWorkplaces, facility.value]
                                        : dayWorkplaces.filter(w => w !== facility.value);
                                      
                                      setFormData(prev => ({
                                        ...prev,
                                        assignable_workplaces_by_day: {
                                          ...prev.assignable_workplaces_by_day,
                                          [day]: newDayWorkplaces
                                        }
                                      }));
                                    }}
                                    className="w-3 h-3 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200"
                                  />
                                  <span className="text-gray-700">{facility.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={saveEmployee}
                  disabled={!formData.name || formData.available_days.length === 0}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  {editingEmployee ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePage;