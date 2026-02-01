import { useState } from 'react';

const CategoryModal = ({ isOpen, onClose, onSave, categoryName }) => {
  const [name, setName] = useState(categoryName || '');

  // Sync name when modal opens with new categoryName
  if (isOpen && name === '' && categoryName) {
    setName(categoryName);
  }

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('카테고리 이름을 입력하세요.');
      return;
    }
    onSave(name.trim());
    setName('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {categoryName ? '카테고리 수정' : '새 카테고리 추가'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: JavaScript, React"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              취소
            </button>
            <button type="submit" className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
