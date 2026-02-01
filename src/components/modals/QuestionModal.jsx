import { useState, useMemo } from 'react';
import { Save } from 'lucide-react';

const QuestionModal = ({ isOpen, onClose, onSave, question, categories }) => {
  const initialFormData = useMemo(() => {
    if (question) {
      return {
        question: question.question || '',
        answer: question.answer || '',
        keywords: question.keywords || '',
        isFollowup: question.isFollowup || false,
        category: question.category || categories[0]?.category || ''
      };
    }
    return {
      question: '',
      answer: '',
      keywords: '',
      isFollowup: false,
      category: categories[0]?.category || ''
    };
  }, [question, categories]);

  const [formData, setFormData] = useState(initialFormData);

  // Sync formData when question/categories change and modal is open
  if (isOpen && formData.question !== initialFormData.question && question) {
    setFormData(initialFormData);
  }

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('질문과 답변은 필수입니다.');
      return;
    }
    onSave(formData);
    setFormData({
      question: '',
      answer: '',
      keywords: '',
      isFollowup: false,
      category: categories[0]?.category || ''
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      question: '',
      answer: '',
      keywords: '',
      isFollowup: false,
      category: categories[0]?.category || ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {question ? '질문 수정' : '새 질문 추가'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.category} value={cat.category}>{cat.category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">질문 *</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="면접관이 물어볼 질문을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">모범 답변 *</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
              placeholder="모범 답변을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">키워드</label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="콤마로 구분하여 키워드 입력"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFollowup}
              onChange={(e) => setFormData(prev => ({ ...prev, isFollowup: e.target.checked }))}
              className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">꼬리질문</span>
          </label>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              취소
            </button>
            <button type="submit" className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center gap-2">
              <Save size={18} />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;
