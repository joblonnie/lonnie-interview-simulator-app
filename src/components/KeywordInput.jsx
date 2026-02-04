import { useState, useRef } from 'react';
import { X } from 'lucide-react';

const KeywordInput = ({ keywords, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // 키워드 문자열을 배열로 변환
  const keywordArray = keywords
    ? keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
    : [];

  const addKeyword = (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    if (keywordArray.includes(trimmed)) return; // 중복 방지
    const newKeywords = [...keywordArray, trimmed];
    onChange(newKeywords.join(', '));
    setInputValue('');
  };

  const removeKeyword = (index) => {
    const newKeywords = keywordArray.filter((_, i) => i !== index);
    onChange(newKeywords.join(', '));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && keywordArray.length > 0) {
      removeKeyword(keywordArray.length - 1);
    }
  };

  return (
    <div
      className="flex flex-wrap gap-1.5 p-2 bg-white rounded-lg min-h-[42px] cursor-text"
      style={{ border: '1px solid var(--orchid)' }}
      onClick={() => inputRef.current?.focus()}
    >
      {keywordArray.map((keyword, index) => (
        <span
          key={index}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: 'var(--ice)', color: 'var(--ice-deep)' }}
        >
          {keyword}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeKeyword(index); }}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-[80px] outline-none text-sm bg-transparent"
        style={{ color: 'var(--text-dark)' }}
        placeholder={keywordArray.length === 0 ? "키워드 입력 후 Enter" : ""}
      />
    </div>
  );
};

export default KeywordInput;
