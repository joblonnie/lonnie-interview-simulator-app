import { useState, useRef } from 'react';
import { Building2, Trash2, Plus, Download, Upload } from 'lucide-react';

const CompanyModal = ({ isOpen, onClose, companies, onSelect, onAdd, onDelete, onExport, onImport }) => {
  const [newCompanyName, setNewCompanyName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onImport(data);
      } catch {
        alert('유효하지 않은 파일 형식입니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden">
        <div className="p-4 md:p-6" style={{ borderBottom: '1px solid var(--orchid)' }}>
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-dark)' }}>
            <Building2 style={{ color: 'var(--orchid-accent)' }} size={22} />
            회사 선택
          </h2>
        </div>
        <div className="p-3 md:p-4 overflow-y-auto max-h-[60vh] md:max-h-[50vh]">
          <div className="space-y-2">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-3 md:p-4 rounded-xl transition-all cursor-pointer group"
                style={{ border: '2px solid var(--orchid)', backgroundColor: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--orchid-dark)'; e.currentTarget.style.backgroundColor = 'var(--cloud)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--orchid)'; e.currentTarget.style.backgroundColor = 'white'; }}
                onClick={() => { onSelect(company.id); onClose(); }}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base" style={{ color: 'var(--text-dark)' }}>{company.name}</h3>
                  <p className="text-xs md:text-sm" style={{ color: 'var(--text-light)' }}>
                    {company.data.categories.length}개 카테고리 · {company.data.totalQuestions}개 질문
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => { e.stopPropagation(); onExport(company); }}
                    className="p-1.5 md:p-2 rounded-lg hover:opacity-70"
                    style={{ color: 'var(--ice-accent)' }}
                    title="내보내기"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(company.id); }}
                    className="p-1.5 md:p-2 rounded-lg hover:opacity-70"
                    style={{ color: 'var(--orchid-accent)' }}
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showAddForm ? (
            <div className="mt-3 md:mt-4 p-3 md:p-4 rounded-xl" style={{ backgroundColor: 'var(--cloud)' }}>
              <input
                type="text"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="회사 이름 입력"
                className="w-full px-3 md:px-4 py-2 bg-white rounded-lg focus:ring-2 focus:outline-none mb-3 text-sm md:text-base"
                style={{ border: '1px solid var(--orchid)', color: 'var(--text-dark)' }}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddForm(false); setNewCompanyName(''); }}
                  className="flex-1 px-3 py-2 rounded-lg hover:opacity-80 text-sm md:text-base"
                  style={{ border: '1px solid var(--orchid)', color: 'var(--text-mid)' }}
                >
                  취소
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 px-3 py-2 text-white rounded-lg hover:opacity-90 text-sm md:text-base"
                  style={{ backgroundColor: 'var(--orchid-accent)' }}
                >
                  추가
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 md:mt-4 flex gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex-1 p-3 md:p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                style={{ borderColor: 'var(--orchid)', color: 'var(--text-light)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--orchid-dark)'; e.currentTarget.style.color = 'var(--orchid-accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--orchid)'; e.currentTarget.style.color = 'var(--text-light)'; }}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">새 회사 추가</span>
                <span className="sm:hidden">추가</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 md:p-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center"
                style={{ borderColor: 'var(--ice-dark)', color: 'var(--text-light)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ice-accent)'; e.currentTarget.style.color = 'var(--ice-accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ice-dark)'; e.currentTarget.style.color = 'var(--text-light)'; }}
                title="템플릿 가져오기"
              >
                <Upload size={18} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>
        <div className="p-3 md:p-4" style={{ borderTop: '1px solid var(--orchid)' }}>
          <button onClick={onClose} className="w-full px-4 py-2.5 md:py-3 rounded-lg font-medium hover:opacity-80 text-sm md:text-base" style={{ border: '1px solid var(--orchid)', color: 'var(--text-mid)' }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;
