import { useState } from 'react';
import { Building2, Trash2, Plus } from 'lucide-react';

const CompanyModal = ({ isOpen, onClose, companies, onSelect, onAdd, onDelete }) => {
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newCompanyName.trim()) {
      alert('회사 이름을 입력하세요.');
      return;
    }
    onAdd(newCompanyName.trim());
    setNewCompanyName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-blue-500" size={24} />
            회사 선택
          </h2>
        </div>
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="space-y-2">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer group"
                onClick={() => { onSelect(company.id); onClose(); }}
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{company.name}</h3>
                  <p className="text-sm text-gray-500">
                    {company.data.categories.length}개 카테고리 · {company.data.totalQuestions}개 질문
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(company.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {showAddForm ? (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="회사 이름 입력"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddForm(false); setNewCompanyName(''); }}
                  className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  취소
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  추가
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 w-full p-4 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              새 회사 추가
            </button>
          )}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;
