'use client';

import React, { useState, useCallback } from 'react';
import {
  Bot,
  Plus,
  Edit,
  Trash2,
  Search,
  X
} from 'lucide-react';
import { useShiftData } from '@/contexts/ShiftDataContext';
import { useModalManager } from '@/hooks/useModalManager';
import type { AIConstraintGuideline } from '@/types';

type ConstraintFormData = {
  constraint_content: string;
};

const ConstraintsPage: React.FC = () => {
  const { constraints, addConstraint, updateConstraint, deleteConstraint: deleteConstraintFromContext } = useShiftData();

  const [searchText, setSearchText] = useState('');

  const getInitialFormData = useCallback((): ConstraintFormData => ({
    constraint_content: ''
  }), []);

  const mapConstraintToFormData = useCallback((constraint: AIConstraintGuideline): ConstraintFormData => ({
    constraint_content: constraint.constraint_content
  }), []);

  const {
    isOpen: isModalOpen,
    editingItem: editingConstraint,
    formData,
    setFormData,
    openModal,
    closeModal
  } = useModalManager<AIConstraintGuideline, ConstraintFormData>(getInitialFormData, mapConstraintToFormData);

  // フィルタリングされた制約
  const filteredConstraints = constraints.filter(constraint => {
    const matchesSearch = constraint.constraint_content.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch && constraint.is_active;
  }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()); // 更新日順でソート

  // 制約を保存
  const saveConstraint = async () => {
    if (editingConstraint) {
      // 編集
      await updateConstraint(editingConstraint.id, formData);
    } else {
      // 新規追加
      await addConstraint({
        ...formData,
        is_active: true
      });
    }

    closeModal();
  };

  // 制約を削除
  const handleDeleteConstraint = async (id: string) => {
    if (confirm('この制約条件を削除しますか？')) {
      await deleteConstraintFromContext(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <Bot className="w-8 h-8" />
          AI制約条件管理
        </h2>
        <p className="text-lg text-gray-600">
          自然言語でシフト作成の制約条件を設定
        </p>
      </div>

      {/* 検索・追加ボタン */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex-1">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="制約条件で検索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors w-full text-gray-800"
            />
          </div>
        </div>

        {/* 追加ボタン */}
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          新しい制約条件追加
        </button>
      </div>

      {/* 制約一覧 */}
      <div className="space-y-4">
        {filteredConstraints.map((constraint) => {
          return (
            <div
              key={constraint.id}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed mb-3">
                    {constraint.constraint_content}
                  </p>
                  <div className="text-sm text-gray-500">
                    更新日: {new Date(constraint.updated_at).toLocaleDateString('ja-JP')}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openModal(constraint)}
                    className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteConstraint(constraint.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredConstraints.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">制約条件がありません</div>
            <p className="text-gray-500">新しい制約条件を追加してください</p>
          </div>
        )}
      </div>

      {/* 制約追加・編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">
                {editingConstraint ? '制約条件編集' : '新しい制約条件追加'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  制約内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.constraint_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, constraint_content: e.target.value }))}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800 resize-none"
                  rows={4}
                  placeholder="例：新人スタッフは経験者とペアで配置してください。一人での対応は避けてください。"
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
                  onClick={saveConstraint}
                  disabled={!formData.constraint_content.trim()}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  {editingConstraint ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstraintsPage;