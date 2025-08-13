'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Clock,
  Building,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import { Workplace, FacilityType, TimeSlot } from '@/types'

export default function WorkplacePage() {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([
    // クリニック棟 AM
    { id: '1', name: 'D(デスク等)', facility: 'クリニック棟', time_slot: 'AM', order_index: 1, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '2', name: '処置(採血)', facility: 'クリニック棟', time_slot: 'AM', order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '3', name: '処置(予約)', facility: 'クリニック棟', time_slot: 'AM', order_index: 3, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '4', name: '処置(フリー)', facility: 'クリニック棟', time_slot: 'AM', order_index: 4, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '5', name: 'エコー', facility: 'クリニック棟', time_slot: 'AM', order_index: 5, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    
    // クリニック棟 PM
    { id: '6', name: '11時-14時休憩回し', facility: 'クリニック棟', time_slot: 'PM', order_index: 1, remarks: '診療', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '7', name: 'CF(12:30〜)', facility: 'クリニック棟', time_slot: 'PM', order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '8', name: 'CF中(直接介助)', facility: 'クリニック棟', time_slot: 'PM', order_index: 3, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '9', name: 'CF外(外回り)', facility: 'クリニック棟', time_slot: 'PM', order_index: 4, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '10', name: 'CF洗浄', facility: 'クリニック棟', time_slot: 'PM', order_index: 5, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    
    // 健診棟 AM
    { id: '11', name: 'D(デスク等)', facility: '健診棟', time_slot: 'AM', order_index: 1, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '12', name: '処置', facility: '健診棟', time_slot: 'AM', order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '13', name: '処置(半日 週3)', facility: '健診棟', time_slot: 'AM', order_index: 3, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '14', name: 'CF中(直接介助)', facility: '健診棟', time_slot: 'AM', order_index: 4, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '15', name: 'CF外(外回り)', facility: '健診棟', time_slot: 'AM', order_index: 5, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '16', name: '補助、案内(W希望制)', facility: '健診棟', time_slot: 'AM', order_index: 6, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '17', name: 'CF洗浄(半日 週3)', facility: '健診棟', time_slot: 'AM', order_index: 7, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    
    // 健診棟 PM
    { id: '18', name: 'D(デスク等)', facility: '健診棟', time_slot: 'PM', order_index: 1, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '19', name: '処置', facility: '健診棟', time_slot: 'PM', order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '20', name: '処置', facility: '健診棟', time_slot: 'PM', order_index: 3, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '21', name: '処置', facility: '健診棟', time_slot: 'PM', order_index: 4, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '22', name: '処置', facility: '健診棟', time_slot: 'PM', order_index: 5, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '23', name: 'エコー', facility: '健診棟', time_slot: 'PM', order_index: 6, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '24', name: '健診翌日準備', facility: '健診棟', time_slot: 'PM', order_index: 7, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '25', name: 'CF片付け', facility: '健診棟', time_slot: 'PM', order_index: 8, remarks: '終わり次第処置台流(16時頃)', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkplace, setEditingWorkplace] = useState<Workplace | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<FacilityType>('クリニック棟')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('AM')

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    facility: 'クリニック棟' as FacilityType,
    time_slot: 'AM' as TimeSlot,
    remarks: ''
  })

  // フィルタリングされた配置場所
  const getFilteredWorkplaces = (facility: FacilityType, timeSlot: TimeSlot) => {
    return workplaces
      .filter(wp => wp.facility === facility && wp.time_slot === timeSlot && wp.is_active)
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
        remarks: workplace.remarks || ''
      })
    } else {
      setEditingWorkplace(null)
      setFormData({
        name: '',
        facility: facility || selectedFacility,
        time_slot: timeSlot || selectedTimeSlot,
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
  const saveWorkplace = () => {
    const now = new Date().toISOString()
    
    if (editingWorkplace) {
      // 編集
      setWorkplaces(prev => prev.map(wp => 
        wp.id === editingWorkplace.id
          ? { ...wp, ...formData, updated_at: now }
          : wp
      ))
    } else {
      // 新規追加
      const filteredWorkplaces = getFilteredWorkplaces(formData.facility, formData.time_slot)
      const nextOrderIndex = Math.max(...filteredWorkplaces.map(wp => wp.order_index), 0) + 1
      
      const newWorkplace: Workplace = {
        id: (workplaces.length + 1).toString(),
        ...formData,
        order_index: nextOrderIndex,
        is_active: true,
        created_at: now,
        updated_at: now
      }
      setWorkplaces(prev => [...prev, newWorkplace])
    }
    
    closeModal()
  }

  // 配置場所を削除
  const deleteWorkplace = (id: string) => {
    if (confirm('この配置場所を削除しますか？')) {
      setWorkplaces(prev => prev.map(wp => 
        wp.id === id ? { ...wp, is_active: false } : wp
      ))
    }
  }

  // 順序を変更
  const changeOrder = (id: string, direction: 'up' | 'down') => {
    setWorkplaces(prev => {
      const workplace = prev.find(wp => wp.id === id)
      if (!workplace) return prev

      const sameCategoryWorkplaces = prev.filter(wp => 
        wp.facility === workplace.facility && 
        wp.time_slot === workplace.time_slot && 
        wp.is_active
      ).sort((a, b) => a.order_index - b.order_index)

      const currentIndex = sameCategoryWorkplaces.findIndex(wp => wp.id === id)
      if (
        (direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === sameCategoryWorkplaces.length - 1)
      ) {
        return prev
      }

      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      const targetWorkplace = sameCategoryWorkplaces[targetIndex]

      return prev.map(wp => {
        if (wp.id === workplace.id) {
          return { ...wp, order_index: targetWorkplace.order_index }
        } else if (wp.id === targetWorkplace.id) {
          return { ...wp, order_index: workplace.order_index }
        }
        return wp
      })
    })
  }

  const facilityColors = {
    'クリニック棟': {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      accent: 'bg-blue-500'
    },
    '健診棟': {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      accent: 'bg-green-500'
    }
  }

  const timeSlotColors = {
    'AM': {
      bg: 'bg-orange-100',
      border: 'border-orange-300',
      text: 'text-orange-800',
      icon: '🌅'
    },
    'PM': {
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      text: 'text-purple-800',
      icon: '🌆'
    }
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
          配置場所を管理
        </p>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              🏢
            </div>
            <div>
              <div className="text-sm text-gray-600">クリニック棟</div>
              <div className="text-xl font-bold text-blue-600">
                {workplaces.filter(wp => wp.facility === 'クリニック棟' && wp.is_active).length}箇所
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              🔬
            </div>
            <div>
              <div className="text-sm text-gray-600">健診棟</div>
              <div className="text-xl font-bold text-green-600">
                {workplaces.filter(wp => wp.facility === '健診棟' && wp.is_active).length}箇所
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              🌅
            </div>
            <div>
              <div className="text-sm text-gray-600">AM配置</div>
              <div className="text-xl font-bold text-orange-600">
                {workplaces.filter(wp => wp.time_slot === 'AM' && wp.is_active).length}箇所
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              🌆
            </div>
            <div>
              <div className="text-sm text-gray-600">PM配置</div>
              <div className="text-xl font-bold text-purple-600">
                {workplaces.filter(wp => wp.time_slot === 'PM' && wp.is_active).length}箇所
              </div>
            </div>
          </div>
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
          <div className={`${facilityColors['クリニック棟'].bg} ${facilityColors['クリニック棟'].border} border-2 rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-bold ${facilityColors['クリニック棟'].text} flex items-center gap-2`}>
                🏢 クリニック棟
              </h4>
              <button
                onClick={() => openModal(undefined, 'クリニック棟', 'AM')}
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>

            <div className="space-y-2">
              {getFilteredWorkplaces('クリニック棟', 'AM').map((workplace, index) => (
                <div key={workplace.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => changeOrder(workplace.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => changeOrder(workplace.id, 'down')}
                          disabled={index === getFilteredWorkplaces('クリニック棟', 'AM').length - 1}
                          className={`p-1 rounded ${index === getFilteredWorkplaces('クリニック棟', 'AM').length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{workplace.name}</div>
                        {workplace.remarks && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {workplace.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        #{workplace.order_index}
                      </span>
                      <button
                        onClick={() => openModal(workplace)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWorkplace(workplace.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 水曜日休診の注意 */}
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">※ 水曜日は休診</span>
              </div>
            </div>
          </div>

          {/* 健診棟 AM */}
          <div className={`${facilityColors['健診棟'].bg} ${facilityColors['健診棟'].border} border-2 rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-bold ${facilityColors['健診棟'].text} flex items-center gap-2`}>
                🔬 健診棟
              </h4>
              <button
                onClick={() => openModal(undefined, '健診棟', 'AM')}
                className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>

            <div className="space-y-2">
              {getFilteredWorkplaces('健診棟', 'AM').map((workplace, index) => (
                <div key={workplace.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => changeOrder(workplace.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => changeOrder(workplace.id, 'down')}
                          disabled={index === getFilteredWorkplaces('健診棟', 'AM').length - 1}
                          className={`p-1 rounded ${index === getFilteredWorkplaces('健診棟', 'AM').length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{workplace.name}</div>
                        {workplace.remarks && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {workplace.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        #{workplace.order_index}
                      </span>
                      <button
                        onClick={() => openModal(workplace)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWorkplace(workplace.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PM配置 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
              🌆 PM（午後）
            </h3>
          </div>

          {/* クリニック棟 PM */}
          <div className={`${facilityColors['クリニック棟'].bg} ${facilityColors['クリニック棟'].border} border-2 rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-bold ${facilityColors['クリニック棟'].text} flex items-center gap-2`}>
                🏢 クリニック棟
              </h4>
              <button
                onClick={() => openModal(undefined, 'クリニック棟', 'PM')}
                className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>

            <div className="space-y-2">
              {getFilteredWorkplaces('クリニック棟', 'PM').map((workplace, index) => (
                <div key={workplace.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => changeOrder(workplace.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => changeOrder(workplace.id, 'down')}
                          disabled={index === getFilteredWorkplaces('クリニック棟', 'PM').length - 1}
                          className={`p-1 rounded ${index === getFilteredWorkplaces('クリニック棟', 'PM').length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{workplace.name}</div>
                        {workplace.remarks && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {workplace.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        #{workplace.order_index}
                      </span>
                      <button
                        onClick={() => openModal(workplace)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWorkplace(workplace.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 診療の注意 */}
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">診療</span>
              </div>
            </div>
          </div>

          {/* 健診棟 PM */}
          <div className={`${facilityColors['健診棟'].bg} ${facilityColors['健診棟'].border} border-2 rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-bold ${facilityColors['健診棟'].text} flex items-center gap-2`}>
                🔬 健診棟
              </h4>
              <button
                onClick={() => openModal(undefined, '健診棟', 'PM')}
                className="flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                追加
              </button>
            </div>

            <div className="space-y-2">
              {getFilteredWorkplaces('健診棟', 'PM').map((workplace, index) => (
                <div key={workplace.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => changeOrder(workplace.id, 'up')}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => changeOrder(workplace.id, 'down')}
                          disabled={index === getFilteredWorkplaces('健診棟', 'PM').length - 1}
                          className={`p-1 rounded ${index === getFilteredWorkplaces('健診棟', 'PM').length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{workplace.name}</div>
                        {workplace.remarks && (
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {workplace.remarks}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        #{workplace.order_index}
                      </span>
                      <button
                        onClick={() => openModal(workplace)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteWorkplace(workplace.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CF片付けの注意 */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-medium">CF片付け：終わり次第処置台流(16時頃)</span>
              </div>
            </div>
          </div>
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
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
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  >
                    <option value="クリニック棟">🏢 クリニック棟</option>
                    <option value="健診棟">🔬 健診棟</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    時間帯 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.time_slot}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_slot: e.target.value as TimeSlot }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  >
                    <option value="AM">🌅 AM（午前）</option>
                    <option value="PM">🌆 PM（午後）</option>
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
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
                  placeholder="例：水曜日は休診、週3回のみ実施など"
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
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}