import { useState, useEffect } from 'react';
import { Save, FolderPlus } from 'lucide-react';

const CategoryModal = ({ isOpen, onClose, onSave, categoryName, isMainCategory = false }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(categoryName || '');
    }
  }, [isOpen, categoryName]);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-4 md:p-6" style={{ borderBottom: '1px solid var(--orchid)' }}>
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
            <FolderPlus size={20} style={{ color: isMainCategory ? 'var(--ice-accent)' : 'var(--orchid-accent)' }} />
            {categoryName ? (isMainCategory ? '대분류 수정' : '중분류 수정') : (isMainCategory ? '새 대분류 추가' : '새 중분류 추가')}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-mid)' }}>
              {isMainCategory ? '대분류' : '중분류'} 이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg focus:ring-2 focus:outline-none text-sm md:text-base"
              style={{ border: '1px solid var(--orchid)', color: 'var(--text-dark)' }}
              placeholder={isMainCategory ? "예: 소개, 기술" : "예: JavaScript, React"}
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium hover:opacity-80 text-sm md:text-base"
              style={{ border: '1px solid var(--orchid)', color: 'var(--text-mid)' }}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-3 md:px-4 py-2.5 md:py-3 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 text-sm md:text-base"
              style={{ backgroundColor: isMainCategory ? 'var(--ice-accent)' : 'var(--orchid-accent)' }}
            >
              <Save size={18} />
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
