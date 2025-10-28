import { useState, useCallback } from 'react'

/**
 * モーダルの開閉と編集アイテムの管理を行うカスタムフック
 * @template T - 編集対象のアイテムの型
 * @template F - フォームデータの型
 * @param getDefaultFormData - デフォルトのフォームデータを返す関数
 * @param mapItemToFormData - アイテムをフォームデータに変換する関数（オプション）
 */
export function useModalManager<T, F>(
  getDefaultFormData: () => F,
  mapItemToFormData?: (item: T) => F
) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<F>(getDefaultFormData())

  const openModal = useCallback(
    (item?: T) => {
      if (item) {
        setEditingItem(item)
        if (mapItemToFormData) {
          setFormData(mapItemToFormData(item))
        }
      } else {
        setEditingItem(null)
        setFormData(getDefaultFormData())
      }
      setIsOpen(true)
    },
    [getDefaultFormData, mapItemToFormData]
  )

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setEditingItem(null)
    setFormData(getDefaultFormData())
  }, [getDefaultFormData])

  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData())
  }, [getDefaultFormData])

  return {
    isOpen,
    editingItem,
    formData,
    setFormData,
    openModal,
    closeModal,
    resetForm
  }
}
