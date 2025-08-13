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
  CheckCircle2,
  Users
} from 'lucide-react'

// 更新された型定義
interface Workplace {
  id: string
  name: string
  facility: 'クリニック棟' | '健診棟'
  time_slot: 'AM' | 'PM'
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
  required_count: number
  order_index: number
  remarks?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type FacilityType = 'クリニック棟' | '健診棟'
type TimeSlot = 'AM' | 'PM'
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

export default function WorkplacePage() {
  // 表のデータを参考にした初期データ
  const [workplaces, setWorkplaces] = useState<Workplace[]>([
    // 月・火・木・土曜日 AM クリニック棟
    { id: '1', name: 'D', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'monday', required_count: 1, order_index: 1, remarks: 'PM、CF不可', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '2', name: '処', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'monday', required_count: 3, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '3', name: 'CF外', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'monday', required_count: 1, order_index: 3, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '4', name: 'CF中', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'monday', required_count: 1, order_index: 4, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    // 月・火・木・土曜日 AM 健診棟
    { id: '5', name: 'CF洗浄', facility: '健診棟', time_slot: 'AM', day_of_week: 'monday', required_count: 1, order_index: 1, remarks: 'AM健診棟の看護助手さんが行う', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '6', name: '健診G', facility: '健診棟', time_slot: 'AM', day_of_week: 'monday', required_count: 2, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '7', name: '健診', facility: '健診棟', time_slot: 'AM', day_of_week: 'monday', required_count: 4, order_index: 3, remarks: '最低3人', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    // 月・火・木・土曜日 PM クリニック棟
    { id: '8', name: 'D', facility: 'クリニック棟', time_slot: 'PM', day_of_week: 'monday', required_count: 1, order_index: 1, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '9', name: '処', facility: 'クリニック棟', time_slot: 'PM', day_of_week: 'monday', required_count: 4, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    // 月・火・木・土曜日 PM 健診棟
    { id: '10', name: 'CF洗浄', facility: '健診棟', time_slot: 'PM', day_of_week: 'monday', required_count: 1, order_index: 1, remarks: '看護助手', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '11', name: '健診', facility: '健診棟', time_slot: 'PM', day_of_week: 'monday', required_count: 1, order_index: 2, remarks: '翌日健診準備', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },

    // 火曜日（月曜日と同じ）
    { id: '12', name: 'D', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'tuesday', required_count: 1, order_index: 1, remarks: 'PM、CF不可', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '13', name: '処', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'tuesday', required_count: 3, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '14', name: 'CF外', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'tuesday', required_count: 1, order_index: 3, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '15', name: 'CF中', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'tuesday', required_count: 1, order_index: 4, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '16', name: 'CF洗浄', facility: '健診棟', time_slot: 'AM', day_of_week: 'tuesday', required_count: 1, order_index: 1, remarks: 'AM健診棟の看護助手さんが行う', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '17', name: '健診G', facility: '健診棟', time_slot: 'AM', day_of_week: 'tuesday', required_count: 2, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '18', name: '健診', facility: '健診棟', time_slot: 'AM', day_of_week: 'tuesday', required_count: 4, order_index: 3, remarks: '最低3人', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '19', name: 'D', facility: 'クリニック棟', time_slot: 'PM', day_of_week: 'tuesday', required_count: 1, order_index: 1, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '20', name: '処', facility: 'クリニック棟', time_slot: 'PM', day_of_week: 'tuesday', required_count: 4, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '21', name: 'CF洗浄', facility: '健診棟', time_slot: 'PM', day_of_week: 'tuesday', required_count: 1, order_index: 1, remarks: '看護助手', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '22', name: '健診', facility: '健診棟', time_slot: 'PM', day_of_week: 'tuesday', required_count: 1, order_index: 2, remarks: '翌日健診準備', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },

    // 水曜日 AM 健診棟のみ
    { id: '23', name: '健診G', facility: '健診棟', time_slot: 'AM', day_of_week: 'wednesday', required_count: 2, order_index: 1, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '24', name: '健診', facility: '健診棟', time_slot: 'AM', day_of_week: 'wednesday', required_count: 4, order_index: 2, remarks: '最低3人', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    // 水曜日 PM 健診棟のみ
    { id: '25', name: '健診G', facility: '健診棟', time_slot: 'PM', day_of_week: 'wednesday', required_count: 1, order_index: 1, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '26', name: '健診', facility: '健診棟', time_slot: 'PM', day_of_week: 'wednesday', required_count: 3, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },

    // 木曜日（月曜日と同じ）
    { id: '27', name: 'D', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'thursday', required_count: 1, order_index: 1, remarks: 'PM、CF不可', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '28', name: '処', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'thursday', required_count: 3, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '29', name: 'CF外', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'thursday', required_count: 1, order_index: 3, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '30', name: 'CF中', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'thursday', required_count: 1, order_index: 4, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '31', name: 'CF洗浄', facility: '健診棟', time_slot: 'AM', day_of_week: 'thursday', required_count: 1, order_index: 1, remarks: 'AM健診棟の看護助手さんが行う', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '32', name: '健診G', facility: '健診棟', time_slot: 'AM', day_of_week: 'thursday', required_count: 2, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '33', name: '健診', facility: '健診棟', time_slot: 'AM', day_of_week: 'thursday', required_count: 4, order_index: 3, remarks: '最低3人', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '34', name: 'D', facility: 'クリニック棟', time_slot: 'PM', day_of_week: 'thursday', required_count: 1, order_index: 1, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '35', name: '処', facility: 'クリニック棟', time_slot: 'PM', day_of_week: 'thursday', required_count: 4, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '36', name: 'CF洗浄', facility: '健診棟', time_slot: 'PM', day_of_week: 'thursday', required_count: 1, order_index: 1, remarks: '看護助手', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '37', name: '健診', facility: '健診棟', time_slot: 'PM', day_of_week: 'thursday', required_count: 1, order_index: 2, remarks: '翌日健診準備', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },

    // 金曜日 AM クリニック棟
    { id: '38', name: 'D', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'friday', required_count: 1, order_index: 1, remarks: 'PM、CF不可', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '39', name: '処', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'friday', required_count: 3, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '40', name: 'CF外', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'friday', required_count: 1, order_index: 3, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '41', name: 'CF中', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'friday', required_count: 1, order_index: 4, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    // 金曜日 AM 健診棟
    { id: '42', name: 'CF洗浄', facility: '健診棟', time_slot: 'AM', day_of_week: 'friday', required_count: 1, order_index: 1, remarks: 'AM健診棟の看護助手さんが行う', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '43', name: '健診G', facility: '健診棟', time_slot: 'AM', day_of_week: 'friday', required_count: 2, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '44', name: '健診', facility: '健診棟', time_slot: 'AM', day_of_week: 'friday', required_count: 4, order_index: 3, remarks: '最低3人', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    // 金曜日 PM クリニック棟
    { id: '45', name: 'D', facility: 'クリニック棟', time_slot: 'PM', day_of_week: 'friday', required_count: 1, order_index: 1, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '46', name: '処', facility: 'クリニック棟', time_slot: 'PM', day_of_week: 'friday', required_count: 4, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    // 金曜日 PM 健診棟
    { id: '47', name: 'CF洗浄', facility: '健診棟', time_slot: 'PM', day_of_week: 'friday', required_count: 1, order_index: 1, remarks: '看護助手', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '48', name: '健診G', facility: '健診棟', time_slot: 'PM', day_of_week: 'friday', required_count: 1, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '49', name: '健診', facility: '健診棟', time_slot: 'PM', day_of_week: 'friday', required_count: 3, order_index: 3, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },

    // 土曜日（月曜日と同じ）
    { id: '50', name: 'D', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'saturday', required_count: 1, order_index: 1, remarks: 'PM、CF不可', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '51', name: '処', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'saturday', required_count: 3, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '52', name: 'CF外', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'saturday', required_count: 1, order_index: 3, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '53', name: 'CF中', facility: 'クリニック棟', time_slot: 'AM', day_of_week: 'saturday', required_count: 1, order_index: 4, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '54', name: 'CF洗浄', facility: '健診棟', time_slot: 'AM', day_of_week: 'saturday', required_count: 1, order_index: 1, remarks: 'AM健診棟の看護助手さんが行う', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '55', name: '健診G', facility: '健診棟', time_slot: 'AM', day_of_week: 'saturday', required_count: 2, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '56', name: '健診', facility: '健診棟', time_slot: 'AM', day_of_week: 'saturday', required_count: 4, order_index: 3, remarks: '最低3人', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '57', name: 'D', facility: 'クリニック棟', time_slot: 'PM', day_of_week: 'saturday', required_count: 1, order_index: 1, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '58', name: '処', facility: 'クリニック棟', time_slot: 'PM', day_of_week: 'saturday', required_count: 4, order_index: 2, remarks: '', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '59', name: 'CF洗浄', facility: '健診棟', time_slot: 'PM', day_of_week: 'saturday', required_count: 1, order_index: 1, remarks: '看護助手', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: '60', name: '健診', facility: '健診棟', time_slot: 'PM', day_of_week: 'saturday', required_count: 1, order_index: 2, remarks: '翌日健診準備', is_active: true, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }
  ])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorkplace, setEditingWorkplace] = useState<Workplace | null>(null)
  const [selectedFacility, setSelectedFacility] = useState<FacilityType>('クリニック棟')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>('AM')
  
  // 曜日選択の状態を追加
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<DayOfWeek>('monday')

  // フォーム状態（人数フィールドを追加）
  const [formData, setFormData] = useState({
    name: '',
    facility: 'クリニック棟' as FacilityType,
    time_slot: 'AM' as TimeSlot,
    day_of_week: 'monday' as DayOfWeek,
    required_count: 1,
    remarks: ''
  })

  // 曜日の日本語表示
  const dayOfWeekLabels = {
    monday: '月曜日',
    tuesday: '火曜日', 
    wednesday: '水曜日',
    thursday: '木曜日',
    friday: '金曜日',
    saturday: '土曜日'
  }

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
      const filteredWorkplaces = getFilteredWorkplaces(formData.facility, formData.time_slot, formData.day_of_week)
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
        wp.day_of_week === workplace.day_of_week &&
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
          {Object.entries(dayOfWeekLabels).map(([key, label]) => (
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
              {getFilteredWorkplaces('クリニック棟', 'AM', selectedDayOfWeek).map((workplace, index) => (
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
                          disabled={index === getFilteredWorkplaces('クリニック棟', 'AM', selectedDayOfWeek).length - 1}
                          className={`p-1 rounded ${index === getFilteredWorkplaces('クリニック棟', 'AM', selectedDayOfWeek).length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
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

            {getFilteredWorkplaces('クリニック棟', 'AM', selectedDayOfWeek).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>配置場所が登録されていません</p>
              </div>
            )}
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
              {getFilteredWorkplaces('健診棟', 'AM', selectedDayOfWeek).map((workplace, index) => (
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
                          disabled={index === getFilteredWorkplaces('健診棟', 'AM', selectedDayOfWeek).length - 1}
                          className={`p-1 rounded ${index === getFilteredWorkplaces('健診棟', 'AM', selectedDayOfWeek).length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
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

            {getFilteredWorkplaces('健診棟', 'AM', selectedDayOfWeek).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>配置場所が登録されていません</p>
              </div>
            )}
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
              {getFilteredWorkplaces('クリニック棟', 'PM', selectedDayOfWeek).map((workplace, index) => (
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
                          disabled={index === getFilteredWorkplaces('クリニック棟', 'PM', selectedDayOfWeek).length - 1}
                          className={`p-1 rounded ${index === getFilteredWorkplaces('クリニック棟', 'PM', selectedDayOfWeek).length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
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

            {getFilteredWorkplaces('クリニック棟', 'PM', selectedDayOfWeek).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>配置場所が登録されていません</p>
              </div>
            )}
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
              {getFilteredWorkplaces('健診棟', 'PM', selectedDayOfWeek).map((workplace, index) => (
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
                          disabled={index === getFilteredWorkplaces('健診棟', 'PM', selectedDayOfWeek).length - 1}
                          className={`p-1 rounded ${index === getFilteredWorkplaces('健診棟', 'PM', selectedDayOfWeek).length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
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

            {getFilteredWorkplaces('健診棟', 'PM', selectedDayOfWeek).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>配置場所が登録されていません</p>
              </div>
            )}
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
                    <option value="クリニック棟" className="bg-white text-gray-900 py-2">🏢 クリニック棟</option>
                    <option value="健診棟" className="bg-white text-gray-900 py-2">🔬 健診棟</option>
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
                    {Object.entries(dayOfWeekLabels).map(([key, label]) => (
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