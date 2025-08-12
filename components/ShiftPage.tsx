'use client'

import { useState } from 'react'
import { 
  ClipboardList, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Download, 
  RefreshCw, 
  Save,
  X,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Eye,
  FileText
} from 'lucide-react'
import { Shift, Employee, Workplace } from '@/types'

interface ShiftDisplayData {
  employee_id: string
  employee_name: string
  employment_type: string
  job_type: string
  shifts: Array<{
    date: string
    am_workplace?: string
    pm_workplace?: string
    shift_type: string
    start_time: string
    end_time: string
    status: 'confirmed' | 'draft' | 'leave'
    color_class: string
  }>
}

export default function ShiftPage() {
  const [currentMonth, setCurrentMonth] = useState('2025-08')
  const [isEditMode, setIsEditMode] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<any>(null)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  // モックデータ
  const employees: Employee[] = [
    { id: '1', name: '看護師A', employment_type: '常勤', job_type: '看護師', assignable_facilities: ['クリニック棟'], available_days: [], phone: '', email: '', is_active: true, created_at: '', updated_at: '' },
    { id: '2', name: '看護師B', employment_type: '常勤', job_type: '看護師', assignable_facilities: ['クリニック棟'], available_days: [], phone: '', email: '', is_active: true, created_at: '', updated_at: '' },
    { id: '3', name: '看護師C', employment_type: '常勤', job_type: '看護師', assignable_facilities: ['健診棟'], available_days: [], phone: '', email: '', is_active: true, created_at: '', updated_at: '' },
    { id: '4', name: '臨床検査技師A', employment_type: '常勤', job_type: '臨床検査技師', assignable_facilities: ['健診棟'], available_days: [], phone: '', email: '', is_active: true, created_at: '', updated_at: '' },
    { id: '5', name: 'パート看護師A', employment_type: 'パート', job_type: '看護師', assignable_facilities: ['クリニック棟'], available_days: [], phone: '', email: '', is_active: true, created_at: '', updated_at: '' },
    { id: '6', name: 'パート看護師B', employment_type: 'パート', job_type: '看護師', assignable_facilities: ['健診棟'], available_days: [], phone: '', email: '', is_active: true, created_at: '', updated_at: '' }
  ]

  const [shiftData, setShiftData] = useState<ShiftDisplayData[]>([
    {
      employee_id: '1',
      employee_name: '看護師A',
      employment_type: '常勤',
      job_type: '看護師',
      shifts: [
        { date: '2025-08-01', am_workplace: 'デスク', pm_workplace: '処置1', shift_type: '早番', start_time: '08:30', end_time: '17:30', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-02', am_workplace: '処置(採血)', pm_workplace: 'CF中', shift_type: '遅番', start_time: '09:30', end_time: '18:30', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-03', am_workplace: '', pm_workplace: 'デスク', shift_type: '午後のみ', start_time: '13:00', end_time: '18:30', status: 'confirmed', color_class: 'bg-green-50' },
        { date: '2025-08-04', am_workplace: '', pm_workplace: '', shift_type: '休み', start_time: '', end_time: '', status: 'leave', color_class: 'bg-pink-100' },
        { date: '2025-08-05', am_workplace: 'エコー', pm_workplace: 'CF外', shift_type: '早番', start_time: '08:30', end_time: '17:30', status: 'confirmed', color_class: 'bg-white' }
      ]
    },
    {
      employee_id: '5',
      employee_name: 'パート看護師A',
      employment_type: 'パート',
      job_type: '看護師',
      shifts: [
        { date: '2025-08-01', am_workplace: 'デスク', pm_workplace: '', shift_type: 'パート①', start_time: '09:00', end_time: '15:00', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-02', am_workplace: '処置(予約)', pm_workplace: '', shift_type: 'パート①', start_time: '09:00', end_time: '15:00', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-03', am_workplace: '', pm_workplace: '', shift_type: '休み', start_time: '', end_time: '', status: 'leave', color_class: 'bg-pink-100' },
        { date: '2025-08-04', am_workplace: '', pm_workplace: '処置1', shift_type: 'パート②', start_time: '13:00', end_time: '18:00', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-05', am_workplace: '処置(採血)', pm_workplace: '', shift_type: 'パート①', start_time: '09:00', end_time: '15:00', status: 'confirmed', color_class: 'bg-white' }
      ]
    },
    {
      employee_id: '2',
      employee_name: '看護師B',
      employment_type: '常勤',
      job_type: '看護師',
      shifts: [
        { date: '2025-08-01', am_workplace: '処置(フリー)', pm_workplace: '休憩回し', shift_type: '遅番', start_time: '09:30', end_time: '18:30', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-02', am_workplace: 'エコー', pm_workplace: 'CF洗浄', shift_type: '早番', start_time: '08:30', end_time: '17:30', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-03', am_workplace: '', pm_workplace: '', shift_type: '休み', start_time: '', end_time: '', status: 'leave', color_class: 'bg-pink-100' },
        { date: '2025-08-04', am_workplace: 'デスク', pm_workplace: 'CF外', shift_type: '早番', start_time: '08:30', end_time: '17:30', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-05', am_workplace: '処置(採血)', pm_workplace: 'CF中', shift_type: '遅番', start_time: '09:30', end_time: '18:30', status: 'confirmed', color_class: 'bg-white' }
      ]
    },
    {
      employee_id: '4',
      employee_name: '臨床検査技師A',
      employment_type: '常勤',
      job_type: '臨床検査技師',
      shifts: [
        { date: '2025-08-01', am_workplace: '処置', pm_workplace: '処置', shift_type: '早番', start_time: '08:30', end_time: '17:30', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-02', am_workplace: 'CF洗浄', pm_workplace: '健診翌日準備', shift_type: '早番', start_time: '08:30', end_time: '17:30', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-03', am_workplace: '', pm_workplace: '', shift_type: '休み', start_time: '', end_time: '', status: 'leave', color_class: 'bg-pink-100' },
        { date: '2025-08-04', am_workplace: 'D(デスク等)', pm_workplace: 'エコー', shift_type: '早番', start_time: '08:30', end_time: '17:30', status: 'confirmed', color_class: 'bg-white' },
        { date: '2025-08-05', am_workplace: '補助、案内', pm_workplace: 'CF片付け', shift_type: '遅番', start_time: '09:30', end_time: '18:30', status: 'confirmed', color_class: 'bg-white' }
      ]
    }
  ])

  // 統計計算
  const calculateStatistics = () => {
    let totalHours = 0
    let violations = 0
    const hoursByEmployee: Record<string, number> = {}

    shiftData.forEach(emp => {
      let empHours = 0
      emp.shifts.forEach(shift => {
        if (shift.status === 'confirmed' && shift.start_time && shift.end_time) {
          const start = new Date(`2000-01-01 ${shift.start_time}`)
          const end = new Date(`2000-01-01 ${shift.end_time}`)
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          empHours += hours
          totalHours += hours
        }
      })
      hoursByEmployee[emp.employee_name] = empHours
    })

    return {
      totalHours,
      violations,
      hoursByEmployee,
      coverage: 98 // モック値
    }
  }

  const stats = calculateStatistics()

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number)
    let newYear = year
    let newMonth = month

    if (direction === 'prev') {
      newMonth -= 1
      if (newMonth === 0) {
        newMonth = 12
        newYear -= 1
      }
    } else {
      newMonth += 1
      if (newMonth === 13) {
        newMonth = 1
        newYear += 1
      }
    }

    setCurrentMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`)
  }

  // 日付の配列を生成
  const generateDates = () => {
    const [year, month] = currentMonth.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    const dates = []
    
    for (let day = 1; day <= Math.min(daysInMonth, 7); day++) { // 最初の7日のみ表示
      const date = `${currentMonth}-${day.toString().padStart(2, '0')}`
      const dayOfWeek = new Date(year, month - 1, day).getDay()
      const dayNames = ['日', '月', '火', '水', '木', '金', '土']
      dates.push({
        date,
        day,
        dayOfWeek: dayNames[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isWednesday: dayOfWeek === 3
      })
    }
    
    return dates
  }

  const dates = generateDates()

  // シフト編集
  const editShift = (employeeId: string, date: string) => {
    const employee = shiftData.find(emp => emp.employee_id === employeeId)
    const shift = employee?.shifts.find(s => s.date === date)
    
    setSelectedEmployee(employeeId)
    setSelectedDate(date)
    setSelectedShift(shift)
    setIsModalOpen(true)
  }

  // PDFエクスポート
  const exportToPDF = () => {
    alert('PDF出力機能は実装予定です')
  }

  // シフト再生成
  const regenerateShift = () => {
    if (confirm('現在のシフトを破棄して再生成しますか？')) {
      alert('AIシフト再生成を開始します（実装予定）')
    }
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <ClipboardList className="w-8 h-8" />
          シフト表示
        </h2>
        <p className="text-lg text-gray-600">
          生成されたシフトの確認・編集（【AM】/【PM】表示対応）
        </p>
      </div>

      {/* 操作バー */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* 月選択 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => changeMonth('prev')}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-800 min-w-[120px] text-center text-lg">
              {currentMonth.replace('-', '年')}月
            </span>
            <button
              onClick={() => changeMonth('next')}
              className="p-2 rounded hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                isEditMode
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              {isEditMode ? '編集中' : '編集モード'}
            </button>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            PDF出力
          </button>
          <button
            onClick={regenerateShift}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            再生成
          </button>
        </div>
      </div>

      {/* 色分け凡例 */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">凡例</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-pink-100 border-2 border-pink-200 rounded"></div>
            <span className="text-sm font-medium">🌸 休み</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-50 border-2 border-green-200 rounded"></div>
            <span className="text-sm font-medium">🌿 健診棟のみの日</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
            <span className="text-sm font-medium">⚪ 通常勤務</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-50 border-2 border-yellow-200 rounded"></div>
            <span className="text-sm font-medium">⚠️ 水曜日（クリニック棟休診）</span>
          </div>
        </div>
      </div>

      {/* シフト表 */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-48 sticky left-0 bg-gray-50 z-10">
                  従業員名
                </th>
                {dates.map((dateInfo) => (
                  <th
                    key={dateInfo.date}
                    className={`px-3 py-4 text-center text-sm font-semibold min-w-[140px] ${
                      dateInfo.isWednesday 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : dateInfo.isWeekend 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'text-gray-700'
                    }`}
                  >
                    <div>{dateInfo.day}日({dateInfo.dayOfWeek})</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shiftData.map((employee) => (
                <tr key={employee.employee_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r-2 border-indigo-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {employee.employee_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{employee.employee_name}</div>
                        <div className="text-xs text-gray-500">
                          {employee.employment_type}・{employee.job_type}
                        </div>
                      </div>
                    </div>
                  </td>
                  {dates.map((dateInfo) => {
                    const shift = employee.shifts.find(s => s.date === dateInfo.date)
                    return (
                      <td
                        key={dateInfo.date}
                        className={`px-2 py-3 text-center border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors ${
                          shift?.color_class || 'bg-white'
                        } ${dateInfo.isWednesday ? 'bg-yellow-50' : ''}`}
                        onClick={() => isEditMode && editShift(employee.employee_id, dateInfo.date)}
                      >
                        {shift ? (
                          <div className="text-xs space-y-1">
                            <div className="font-bold">
                              【{shift.am_workplace || '休'}】/【{shift.pm_workplace || '休'}】
                            </div>
                            <div className="text-gray-600">
                              {shift.shift_type}
                            </div>
                            {shift.start_time && shift.end_time && (
                              <div className="text-gray-500">
                                {shift.start_time}-{shift.end_time}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">未設定</div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">総労働時間</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalHours}時間</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">制約違反</div>
              <div className="text-2xl font-bold text-red-600">{stats.violations}件</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">公平性スコア</div>
              <div className="text-2xl font-bold text-green-600">85点</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">配置充足率</div>
              <div className="text-2xl font-bold text-indigo-600">{stats.coverage}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 従業員別労働時間 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            従業員別労働時間
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.hoursByEmployee).map(([name, hours]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(hours / 40) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 min-w-[50px] text-right">
                    {hours}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 配置場所別使用率 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            配置場所別使用率
          </h3>
          <div className="space-y-3">
            {[
              { name: 'デスク', usage: 85 },
              { name: '処置(採血)', usage: 92 },
              { name: 'CF中', usage: 78 },
              { name: 'エコー', usage: 65 },
              { name: 'CF外', usage: 88 }
            ].map((place) => (
              <div key={place.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{place.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${place.usage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-green-600 min-w-[40px] text-right">
                    {place.usage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* シフト編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">シフト編集</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">従業員</label>
                  <div className="p-3 bg-gray-50 rounded-lg font-medium">
                    {shiftData.find(emp => emp.employee_id === selectedEmployee)?.employee_name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">日付</label>
                  <div className="p-3 bg-gray-50 rounded-lg font-medium">
                    {selectedDate && new Date(selectedDate).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  シフト種別
                </label>
                <select className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors">
                  <option value="早番">早番</option>
                  <option value="遅番">遅番</option>
                  <option value="パート①">パート①</option>
                  <option value="パート②">パート②</option>
                  <option value="休み">休み</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    AM配置
                  </label>
                  <select className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors">
                    <option value="">選択してください</option>
                    <option value="デスク">デスク</option>
                    <option value="処置(採血)">処置(採血)</option>
                    <option value="エコー">エコー</option>
                    <option value="休">休</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PM配置
                  </label>
                  <select className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors">
                    <option value="">選択してください</option>
                    <option value="処置1">処置1</option>
                    <option value="CF中">CF中</option>
                    <option value="CF外">CF外</option>
                    <option value="休">休</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    開始時間
                  </label>
                  <input
                    type="time"
                    defaultValue={selectedShift?.start_time || '08:30'}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    終了時間
                  </label>
                  <input
                    type="time"
                    defaultValue={selectedShift?.end_time || '17:30'}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    // 保存処理（実装予定）
                    setIsModalOpen(false)
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}