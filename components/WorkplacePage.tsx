'use client'

import { useState } from 'react'
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Users
} from 'lucide-react'
import { useShiftData } from '@/contexts/ShiftDataContext'
import type { Workplace, FacilityType, TimeSlot, DayOfWeek } from '@/types'
import { facilityColors } from '@/lib/colors'
import { DAY_LABELS, FACILITY_TYPES } from '@/lib/constants'

// 施設ごとのUI設定
const facilityConfig: Record<FacilityType, {
  icon: string
  label: string
  addButtonClass: string
  badgeBg: string
  badgeText: string
  editButtonClass: string
}> = {
  [FACILITY_TYPES.CLINIC]: {
    icon: '🏢',
    label: 'クリニック棟',
    addButtonClass: 'bg-blue-500 hover:bg-blue-600',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    editButtonClass: 'text-blue-600 hover:bg-blue-100',
  },
  [FACILITY_TYPES.HEALTH_CHECK]: {
    icon: '🔬',
    label: '健診棟',
    addButtonClass: 'bg-green-500 hover:bg-green-600',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-700',
    editButtonClass: 'text-green-600 hover:bg-green-100',
  },
}

// 再利用可能な施設セクションコンポーネント
function FacilitySection({
  facility,
  timeSlot,
  filteredWorkplaces,
  onAdd,
  onEdit,
  onDelete,
  onChangeOrder,
}: {
  facility: FacilityType
  timeSlot: TimeSlot
  filteredWorkplaces: Workplace[]
  onAdd: () => void
  onEdit: (workplace: Workplace) => void
  onDelete: (id: string) => void
  onChangeOrder: (id: string, direction: 'up' | 'down') => void
}) {
  const colors = facilityColors[facility]
  const config = facilityConfig[facility]

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-2xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-lg font-bold ${colors.text} flex items-center gap-2`}>
          {config.icon} {config.label}
        </h4>
        <button
          onClick={onAdd}
          className={`flex items-center gap-1 px-3 py-2 ${config.addButtonClass} text-white rounded-lg text-sm font-semibold transition-colors`}
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      <div className="space-y-2">
        {filteredWorkplaces.map((workplace, index) => (
          <div key={workplace.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => onChangeOrder(workplace.id, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onChangeOrder(workplace.id, 'down')}
                    disabled={index === filteredWorkplaces.length - 1}
                    className={`p-1 rounded ${index === filteredWorkplaces.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{workplace.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-sm text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                      <Users className="w-3 h-3" />
                      <span className="font-semibold">{workplace.required_count}人</span>
                    </div>
                  </div>
                  {workplace.remarks && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {workplace.remarks}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${config.badgeBg} ${config.badgeText} px-2 py-1 rounded`}>
                  #{workplace.order_index}
                </span>
                <button
                  onClick={() => onEdit(workplace)}
                  className={`p-2 ${config.editButtonClass} rounded-lg transition-colors`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(workplace.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkplaces.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>配置場所が登録されていません</p>
        </div>
      )}
    </div>
  )
}

export default function WorkplacePage() {
  const { workplaces, addWorkplace, updateWorkplace, deleteWorkplace: deleteWorkplaceFromContext } = useShiftData()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkplace, setEditingWorkplace] = useState<Workplace | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<FacilityType>(FACILITY_TYPES.CLINIC)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('AM')
  
  // 曜日選択の状態を追加
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<DayOfWeek>('月')
  const [isSaving, setIsSaving] = useState(false)

  // フォーム状態（人数フィールドを追加）
  const [formData, setFormData] = useState({
    name: '',
    facility: FACILITY_TYPES.CLINIC as FacilityType,
    time_slot: 'AM' as TimeSlot,
    day_of_week: '月' as DayOfWeek,
    required_count: 1,
    remarks: ''
  })

  // フィルタリングされた配置場所（曜日フィルターを追加）
  const getFilteredWorkplaces = (facility: FacilityType, timeSlot: TimeSlot, dayOfWeek: DayOfWeek) => {
    return workplaces
      .filter(wp => wp.facility === facility && wp.time_slot === timeSlot && wp.day_of_week === dayOfWeek && wp.is_active)
      .sort((a, b) => a.order_index - b.order_index)
  }

  // モーダルを開く
  const openModal = (workplace?: Workplace, facility?: FacilityType, timeSlot?: TimeSlot) => {
    if (workplace) {
      setEditingWorkplace(workplace)
      setFormData({
        name: workplace.name,
        facility: workplace.facility,
        time_slot: workplace.time_slot,
        day_of_week: workplace.day_of_week,
        required_count: workplace.required_count,
        remarks: workplace.remarks || ''
      })
    } else {
      setEditingWorkplace(null)
      setFormData({
        name: '',
        facility: facility || selectedFacility,
        time_slot: timeSlot || selectedTimeSlot,
        day_of_week: selectedDayOfWeek,
        required_count: 1,
        remarks: ''
      })
    }
    setIsModalOpen(true)
  }

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingWorkplace(null)
  }

  // 配置場所を保存
  const saveWorkplace = async () => {
    setIsSaving(true)
    try {
      if (editingWorkplace) {
        // 編集
        await updateWorkplace(editingWorkplace.id, formData)
      } else {
        // 新規追加
        const filteredWorkplaces = getFilteredWorkplaces(formData.facility, formData.time_slot, formData.day_of_week)
        const nextOrderIndex = Math.max(...filteredWorkplaces.map(wp => wp.order_index), 0) + 1

        await addWorkplace({
          ...formData,
          order_index: nextOrderIndex,
          is_active: true
        })
      }
      closeModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : '配置場所の保存に失敗しました'
      alert(message)
    } finally {
      setIsSaving(false)
    }
  }

  // 配置場所を削除
  const handleDeleteWorkplace = async (id: string) => {
    if (confirm('この配置場所を削除しますか？')) {
      try {
        await deleteWorkplaceFromContext(id)
      } catch (error) {
        const message = error instanceof Error ? error.message : '配置場所の削除に失敗しました'
        alert(message)
      }
    }
  }

  // 順序を変更
  const changeOrder = async (id: string, direction: 'up' | 'down') => {
    const workplace = workplaces.find(wp => wp.id === id)
    if (!workplace) return

    const sameCategoryWorkplaces = workplaces.filter(wp =>
      wp.facility === workplace.facility &&
      wp.time_slot === workplace.time_slot &&
      wp.day_of_week === workplace.day_of_week &&
      wp.is_active
    ).sort((a, b) => a.order_index - b.order_index)

    const currentIndex = sameCategoryWorkplaces.findIndex(wp => wp.id === id)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sameCategoryWorkplaces.length - 1)
    ) {
      return
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const targetWorkplace = sameCategoryWorkplaces[targetIndex]

    // 2つの配置場所のorder_indexを入れ替え
    await updateWorkplace(workplace.id, { order_index: targetWorkplace.order_index })
    await updateWorkplace(targetWorkplace.id, { order_index: workplace.order_index })
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <MapPin className="w-8 h-8" />
          配置場所管理
        </h2>
        <p className="text-lg text-gray-600">
          曜日別・時間帯別の配置場所と必要人数を管理
        </p>
      </div>

      {/* 曜日選択タブ */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 曜日選択</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DAY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedDayOfWeek(key as DayOfWeek)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedDayOfWeek === key
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* AM/PM分割表示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AM配置 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              🌅 AM（午前）
            </h3>
          </div>

          {/* クリニック棟 AM */}
          <FacilitySection
            facility={FACILITY_TYPES.CLINIC}
            timeSlot="AM"
            filteredWorkplaces={getFilteredWorkplaces(FACILITY_TYPES.CLINIC, 'AM', selectedDayOfWeek)}
            onAdd={() => openModal(undefined, FACILITY_TYPES.CLINIC, 'AM')}
            onEdit={(workplace) => openModal(workplace)}
            onDelete={handleDeleteWorkplace}
            onChangeOrder={changeOrder}
          />

          {/* 健診棟 AM */}
          <FacilitySection
            facility={FACILITY_TYPES.HEALTH_CHECK}
            timeSlot="AM"
            filteredWorkplaces={getFilteredWorkplaces(FACILITY_TYPES.HEALTH_CHECK, 'AM', selectedDayOfWeek)}
            onAdd={() => openModal(undefined, FACILITY_TYPES.HEALTH_CHECK, 'AM')}
            onEdit={(workplace) => openModal(workplace)}
            onDelete={handleDeleteWorkplace}
            onChangeOrder={changeOrder}
          />
        </div>

        {/* PM配置 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
              🌆 PM（午後）
            </h3>
          </div>

          {/* クリニック棟 PM */}
          <FacilitySection
            facility={FACILITY_TYPES.CLINIC}
            timeSlot="PM"
            filteredWorkplaces={getFilteredWorkplaces(FACILITY_TYPES.CLINIC, 'PM', selectedDayOfWeek)}
            onAdd={() => openModal(undefined, FACILITY_TYPES.CLINIC, 'PM')}
            onEdit={(workplace) => openModal(workplace)}
            onDelete={handleDeleteWorkplace}
            onChangeOrder={changeOrder}
          />

          {/* 健診棟 PM */}
          <FacilitySection
            facility={FACILITY_TYPES.HEALTH_CHECK}
            timeSlot="PM"
            filteredWorkplaces={getFilteredWorkplaces(FACILITY_TYPES.HEALTH_CHECK, 'PM', selectedDayOfWeek)}
            onAdd={() => openModal(undefined, FACILITY_TYPES.HEALTH_CHECK, 'PM')}
            onEdit={(workplace) => openModal(workplace)}
            onDelete={handleDeleteWorkplace}
            onChangeOrder={changeOrder}
          />
        </div>
      </div>

      {/* 配置場所編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">
                {editingWorkplace ? '配置場所編集' : '新規配置場所追加'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  配置場所名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white text-gray-900"
                  placeholder="例：処置(採血)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    施設 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.facility}
                    onChange={(e) => setFormData(prev => ({ ...prev, facility: e.target.value as FacilityType }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white text-gray-900"
                  >
                    <option value={FACILITY_TYPES.CLINIC} className="bg-white text-gray-900 py-2">🏢 クリニック棟</option>
                    <option value={FACILITY_TYPES.HEALTH_CHECK} className="bg-white text-gray-900 py-2">🔬 健診棟</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    時間帯 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.time_slot}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_slot: e.target.value as TimeSlot }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white text-gray-900"
                  >
                    <option value="AM" className="bg-white text-gray-900 py-2">🌅 AM（午前）</option>
                    <option value="PM" className="bg-white text-gray-900 py-2">🌆 PM（午後）</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    曜日 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData(prev => ({ ...prev, day_of_week: e.target.value as DayOfWeek }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white text-gray-900"
                  >
                    {Object.entries(DAY_LABELS).map(([key, label]) => (
                      <option key={key} value={key} className="bg-white text-gray-900 py-2">{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    必要人数 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.required_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, required_count: parseInt(e.target.value) }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white text-gray-900"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num} className="bg-white text-gray-900 py-2">{num}人</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  備考
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none bg-white text-gray-900"
                />
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
                  onClick={saveWorkplace}
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}