import { useState, useEffect } from 'react';
import { Save, CornerDownRight } from 'lucide-react';
import { ALL_SUBCATEGORIES } from '../../constants/categoryColors';
import KeywordInput from '../KeywordInput';

const QuestionModal = ({ isOpen, onClose, onSave, question, categories, customCategories }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    keywords: '',
    isFollowup: false,
    category: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (question) {
        setFormData({
          question: question.question || '',
          answer: question.answer || '',
          keywords: question.keywords || '',
          isFollowup: question.isFollowup || false,
          category: question.category || ''
        });
      } else {
        const allSubs = customCategories
          ? Object.values(customCategories).flatMap(m => m.subcategories)
          : ALL_SUBCATEGORIES;
        setFormData({
          question: '',
          answer: '',
          keywords: '',
          isFollowup: false,
          category: categories[0]?.category || allSubs[0] || ''
        });
      }
    }
  }, [isOpen, question, categories, customCategories]);

  if (!isOpen) return null;

  const allSubcategories = customCategories
    ? Object.values(customCategories).flatMap(m => m.subcategories)
    : ALL_SUBCATEGORIES;

  const availableCategories = [
    ...new Set([
      ...categories.map(c => c.category),
      ...allSubcategories
    ])
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('질문과 답변은 필수입니다.');
      return;
    }
    if (!formData.category) {
      alert('카테고리를 선택해주세요.');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--cloud)' }}>
        {/* 헤더 */}
        <div className="p-4 md:p-5 bg-white" style={{ borderBottom: '1px solid var(--orchid)' }}>
          <h2 className="text-base md:text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
            {question ? '질문 수정' : '새 질문 추가'}
          </h2>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-mid)' }}>카테고리</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 bg-white rounded-lg focus:ring-2 focus:outline-none"
              style={{ border: '1px solid var(--orchid)', color: 'var(--text-dark)' }}
            >
              <option value="">카테고리 선택</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-mid)' }}>질문 *</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              className="w-full px-3 py-2.5 bg-white rounded-lg focus:ring-2 focus:outline-none resize-none"
              style={{ border: '1px solid var(--orchid)', color: 'var(--text-dark)' }}
              rows={2}
              placeholder="면접 질문을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-mid)' }}>모범 답변 *</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              className="w-full px-3 py-2.5 bg-white rounded-lg focus:ring-2 focus:outline-none resize-none"
              style={{ border: '1px solid var(--orchid)', color: 'var(--text-dark)' }}
              rows={5}
              placeholder="모범 답변을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-mid)' }}>
              키워드 <span className="text-xs font-normal" style={{ color: 'var(--text-light)' }}>(입력 후 Enter)</span>
            </label>
            <KeywordInput
              keywords={formData.keywords}
              onChange={(keywords) => setFormData(prev => ({ ...prev, keywords }))}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFollowup}
              onChange={(e) => setFormData(prev => ({ ...prev, isFollowup: e.target.checked }))}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--orchid-accent)' }}
            />
            <CornerDownRight size={14} style={{ color: 'var(--text-light)' }} />
            <span className="text-sm" style={{ color: 'var(--text-mid)' }}>꼬리질문으로 표시</span>
          </label>
        </form>

        {/* 버튼 */}
        <div className="p-4 md:p-5 bg-white flex gap-3" style={{ borderTop: '1px solid var(--orchid)' }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 md:px-4 py-2.5 rounded-lg font-medium hover:opacity-80 text-sm md:text-base"
            style={{ border: '1px solid var(--orchid-dark)', color: 'var(--text-mid)' }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-3 md:px-4 py-2.5 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 text-sm md:text-base"
            style={{ backgroundColor: 'var(--orchid-accent)' }}
          >
            <Save size={18} />
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
