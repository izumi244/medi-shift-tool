'use client';

import React, { useState, useCallback } from 'react';
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Tag,
  Palette
} from 'lucide-react';
import { useShiftData } from '@/contexts/ShiftDataContext';
import { useModalManager } from '@/hooks/useModalManager';
import type { ShiftPattern } from '@/types';

type ShiftPatternFormData = Omit<ShiftPattern, 'id'>;

const ShiftPatternPage: React.FC = () => {
  const { shiftPatterns, addShiftPattern, updateShiftPattern, deleteShiftPattern: deleteShiftPatternFromContext } = useShiftData();

  const getInitialFormData = useCallback((): ShiftPatternFormData => ({
    name: '',
    start_time: '09:00',
    end_time: '17:00',
    break_minutes: 60,
    color: '#e0f2fe'
  }), []);

  const mapPatternToFormData = useCallback((pattern: ShiftPattern): ShiftPatternFormData => ({
    name: pattern.name,
    start_time: pattern.start_time,
    end_time: pattern.end_time,
    break_minutes: pattern.break_minutes,
    color: pattern.color
  }), []);

  const {
    isOpen: isModalOpen,
    editingItem: editingPattern,
    formData,
    setFormData,
    openModal,
    closeModal
  } = useModalManager<ShiftPattern, ShiftPatternFormData>(getInitialFormData, mapPatternToFormData);

  const colorOptions = [
    { name: 'Blue', value: '#e0f2fe' },
    { name: 'Green', value: '#dcfce7' },
    { name: 'Yellow', value: '#fef9c3' },
    { name: 'Pink', value: '#fce7f3' },
    { name: 'Purple', value: '#f3e8ff' },
    { name: 'Indigo', value: '#e0e7ff' },
    { name: 'Gray', value: '#f3f4f6' },
  ];

  const savePattern = async () => {
    if (editingPattern) {
      await updateShiftPattern(editingPattern.id, formData);
    } else {
      await addShiftPattern(formData);
    }
    closeModal();
  };

  const handleDeletePattern = async (id: string) => {
    if (confirm('このシフトパターンを削除しますか？')) {
      await deleteShiftPatternFromContext(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <Clock className="w-8 h-8" />
          シフトパターン管理
        </h2>
        <p className="text-lg text-gray-600">
          勤務時間帯のパターンを登録・編集します
        </p>
      </div>

      <div className="text-right">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex"
        >
          <Plus className="w-5 h-5" />
          新規パターン追加
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shiftPatterns.map(pattern => (
          <div key={pattern.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col" style={{ borderLeft: `5px solid ${pattern.color}` }}>
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{pattern.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>{pattern.start_time} ~ {pattern.end_time}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    休憩: {pattern.break_minutes}分
                  </div>
                </div>
                <div className="w-4 h-10 rounded-full" style={{ backgroundColor: pattern.color }}></div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-b-2xl border-t border-gray-200">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => openModal(pattern)}
                  className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                  title="編集"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeletePattern(pattern.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="削除"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">
                {editingPattern ? 'パターン編集' : '新規パターン追加'}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  パターン名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                  placeholder="例: 早番"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">開始時刻 <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">終了時刻 <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">休憩時間（分）<span className="text-red-500">*</span></label>
                <input
                  type="number"
                  step="15"
                  min="0"
                  value={formData.break_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, break_minutes: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  表示色 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map(opt => (
                    <label key={opt.value} className="flex items-center justify-center p-2 rounded-lg cursor-pointer border-2" style={{ backgroundColor: opt.value, borderColor: formData.color === opt.value ? '#4f46e5' : opt.value }}>
                      <input
                        type="radio"
                        name="color"
                        value={opt.value}
                        checked={formData.color === opt.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="sr-only"
                      />
                    </label>
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
                  onClick={savePattern}
                  disabled={!formData.name || !formData.start_time || !formData.end_time}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
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
  );
};

export default ShiftPatternPage;
