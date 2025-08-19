'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  AlertTriangle, 
  ArrowUp, 
  Settings, 
  Target
} from 'lucide-react';

// 型定義
interface AIConstraintGuideline {
  id: string;
  constraint_content: string;
  priority_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ConstraintsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConstraint, setSelectedConstraint] = useState<AIConstraintGuideline | null>(null);

  // フォームデータ
  const [formData, setFormData] = useState({
    constraint_content: '',
    priority_level: 5
  });

  // サンプル制約データ
  const [constraints, setConstraints] = useState<AIConstraintGuideline[]>([
    {
      id: '1',
      constraint_content: '新人スタッフは経験者とペアで配置してください。一人での対応は避けてください。',
      priority_level: 9,
      is_active: true,
      created_at: '2025-08-01T09:00:00Z',
      updated_at: '2025-08-01T09:00:00Z'
    },
    {
      id: '2',
      constraint_content: '妊娠中のスタッフは重労働を避け、デスクワーク中心の配置にしてください。',
      priority_level: 8,
      is_active: true,
      created_at: '2025-08-02T10:30:00Z',
      updated_at: '2025-08-02T10:30:00Z'
    },
    {
      id: '3',
      constraint_content: 'CF洗浄業務は技師資格を持つスタッフのみに配置してください。',
      priority_level: 7,
      is_active: true,
      created_at: '2025-08-03T14:15:00Z',
      updated_at: '2025-08-03T14:15:00Z'
    },
    {
      id: '4',
      constraint_content: '連続勤務は3日までとし、その後は最低1日の休暇を設けてください。',
      priority_level: 6,
      is_active: true,
      created_at: '2025-08-04T16:45:00Z',
      updated_at: '2025-08-04T16:45:00Z'
    }
  ]);

  // モーダルを開く
  const openModal = (constraint?: AIConstraintGuideline) => {
    if (constraint) {
      setSelectedConstraint(constraint);
      setFormData({
        constraint_content: constraint.constraint_content,
        priority_level: constraint.priority_level
      });
    } else {
      setSelectedConstraint(null);
      setFormData({
        constraint_content: '',
        priority_level: 5
      });
    }
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedConstraint(null);
    setFormData({
      constraint_content: '',
      priority_level: 5
    });
  };

  // 制約を保存
  const saveConstraint = () => {
    const now = new Date().toISOString();

    if (selectedConstraint) {
      // 編集
      setConstraints(prev => prev.map(constraint => 
        constraint.id === selectedConstraint.id 
          ? { ...constraint, ...formData, updated_at: now }
          : constraint
      ));
    } else {
      // 新規追加
      const newConstraint: AIConstraintGuideline = {
        id: (constraints.length + 1).toString(),
        ...formData,
        is_active: true,
        created_at: now,
        updated_at: now
      };
      setConstraints(prev => [...prev, newConstraint]);
    }
    
    closeModal();
  };

  // 制約を削除
  const deleteConstraint = (id: string) => {
    if (confirm('この制約ルールを削除しますか？')) {
      setConstraints(prev => prev.map(constraint => 
        constraint.id === id ? { ...constraint, is_active: false } : constraint
      ));
    }
  };

  // 優先度の色分け
  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', badge: 'bg-red-500' };
    if (priority >= 7) return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', badge: 'bg-orange-500' };
    if (priority >= 5) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', badge: 'bg-yellow-500' };
    return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', badge: 'bg-gray-500' };
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

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">最高優先度</div>
              <div className="text-xl font-bold text-red-600">
                {constraints.filter(c => c.priority_level >= 9 && c.is_active).length}件
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">高優先度</div>
              <div className="text-xl font-bold text-orange-600">
                {constraints.filter(c => c.priority_level >= 7 && c.priority_level < 9 && c.is_active).length}件
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">総制約数</div>
              <div className="text-xl font-bold text-blue-600">
                {constraints.filter(c => c.is_active).length}件
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">適用率</div>
              <div className="text-xl font-bold text-green-600">95%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 制約ルール追加ボタン */}
      <div className="flex justify-end">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          新しい制約ルール追加
        </button>
      </div>

      {/* 制約ルール一覧 */}
      <div className="space-y-4">
        {constraints.filter(c => c.is_active).map((constraint) => {
          const priorityColor = getPriorityColor(constraint.priority_level);
          
          return (
            <div key={constraint.id} className={`bg-white rounded-2xl p-6 border-2 ${priorityColor.border} shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${priorityColor.badge}`}></div>
                      <span className="text-sm font-medium text-gray-600">
                        優先度: {constraint.priority_level}
                      </span>
                    </div>
                  </div>

                  <div className="text-gray-900 text-base leading-relaxed mb-3">
                    {constraint.constraint_content}
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
                    onClick={() => deleteConstraint(constraint.id)}
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
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">
                {selectedConstraint ? '制約ルール編集' : '新しい制約ルール追加'}
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
                  優先度レベル <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority_level: parseInt(e.target.value) }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
                >
                  <option value={10} className="text-gray-800">10 (最高) - 絶対遵守</option>
                  <option value={9} className="text-gray-800">9 (最高) - 法的要件</option>
                  <option value={8} className="text-gray-800">8 (高) - 安全性重要</option>
                  <option value={7} className="text-gray-800">7 (高) - 業務効率重要</option>
                  <option value={6} className="text-gray-800">6 (中) - 推奨</option>
                  <option value={5} className="text-gray-800">5 (中) - 標準</option>
                  <option value={4} className="text-gray-800">4 (低) - 軽微</option>
                  <option value={3} className="text-gray-800">3 (低) - 任意</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  制約内容（自然言語で記述） <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.constraint_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, constraint_content: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none text-gray-800"
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
                  disabled={!formData.constraint_content}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  {selectedConstraint ? '更新' : '追加'}
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