import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Circle, Eye, EyeOff, FileText, Edit3, Trash2, BarChart3, CornerDownRight, Plus, Minus, GripVertical } from 'lucide-react';
import AudioRecorder from './AudioRecorder';
import SpeechAnalysis from './SpeechAnalysis';

const QuestionCard = ({
  question, category, isExpanded, onToggle, isCompleted, onComplete,
  recordings, setRecordings, showAnswer, onToggleAnswer,
  onEdit, onDelete, isEditMode, isFollowup = false, onToggleFollowup, onUpdateKeywords
}) => {
  const questionId = `${category}-${question.question.slice(0, 20)}`;
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const recording = recordings[questionId];
  const hasTranscript = recording?.transcript;

  // 키워드를 배열로 변환
  const keywordArray = question.keywords
    ? question.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
    : [];

  const addKeyword = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    if (keywordArray.includes(trimmed)) {
      setNewKeyword('');
      return;
    }
    const newKeywords = [...keywordArray, trimmed].join(', ');
    onUpdateKeywords?.(category, question.question, newKeywords);
    setNewKeyword('');
  };

  const removeKeyword = (index) => {
    const newKeywords = keywordArray.filter((_, i) => i !== index).join(', ');
    onUpdateKeywords?.(category, question.question, newKeywords);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newArray = [...keywordArray];
    const [draggedItem] = newArray.splice(draggedIndex, 1);
    newArray.splice(dropIndex, 0, draggedItem);

    const newKeywords = newArray.join(', ');
    onUpdateKeywords?.(category, question.question, newKeywords);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="rounded-xl bg-white transition-all" style={{ border: isExpanded ? '1px solid var(--orchid-dark)' : '1px solid var(--orchid)', boxShadow: isExpanded ? '0 4px 12px rgba(166,124,145,0.1)' : 'none' }}>
      <div className="p-3 cursor-pointer flex items-start gap-3" onClick={onToggle}>
        <button onClick={(e) => { e.stopPropagation(); onComplete(); }} className="mt-0.5 flex-shrink-0 transition-colors" style={{ color: isCompleted ? 'var(--orchid-accent)' : 'var(--orchid-dark)' }}>
          {isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--orchid)', color: 'var(--orchid-deep)' }}>{category}</span>
            {isFollowup && (
              <button onClick={(e) => { e.stopPropagation(); onToggleFollowup?.(); }} className="text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ backgroundColor: 'var(--orchid-dark)', color: 'white' }}>
                <CornerDownRight size={10} />꼬리
              </button>
            )}
            {recordings[questionId] && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: 'var(--orchid-accent)' }}>녹음</span>}
          </div>
          <p className="text-sm font-medium" style={{ color: isCompleted ? 'var(--text-light)' : 'var(--text-dark)', textDecoration: isCompleted ? 'line-through' : 'none' }}>Q. {question.question}</p>
        </div>
        <div className="flex items-center gap-1">
          {isEditMode && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--orchid-accent)' }}><Edit3 size={16} /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded hover:opacity-70" style={{ color: 'var(--text-light)' }}><Trash2 size={16} /></button>
            </>
          )}
          <div style={{ color: 'var(--orchid-dark)' }}>{isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0" style={{ borderTop: '1px solid var(--orchid)' }}>
          <div className="pl-0 md:pl-8 space-y-3 mt-3">
            <AudioRecorder questionId={questionId} recordings={recordings} setRecordings={setRecordings} />
            {hasTranscript && (
              <button onClick={(e) => { e.stopPropagation(); setShowAnalysis(!showAnalysis); }} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors" style={{ backgroundColor: showAnalysis ? 'var(--orchid)' : 'white', color: showAnalysis ? 'var(--orchid-deep)' : 'var(--text-mid)', border: '1px solid var(--orchid-dark)' }}>
                <BarChart3 size={16} />{showAnalysis ? '분석 숨기기' : '내 답변 분석'}
              </button>
            )}
            {showAnalysis && hasTranscript && <SpeechAnalysis transcript={recording.transcript} answer={question.answer} keywords={question.keywords} />}
            <button onClick={(e) => { e.stopPropagation(); onToggleAnswer(); }} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors" style={{ backgroundColor: showAnswer ? 'var(--orchid)' : 'white', color: showAnswer ? 'var(--orchid-deep)' : 'var(--text-mid)', border: '1px solid var(--orchid-dark)' }}>
              <FileText size={16} />{showAnswer ? '답안 숨기기' : '모범 답안 보기'}{showAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            {showAnswer && (
              <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--cloud)', border: '1px solid var(--orchid)' }}>
                <div className="text-[10px] font-semibold mb-2 uppercase flex items-center gap-1" style={{ color: 'var(--orchid-accent)' }}><CheckCircle size={12} />모범 답안</div>
                <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-dark)' }}>{question.answer}</p>

                {/* 키워드 노드 영역 - 드래그 앤 드롭 지원 */}
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--orchid)' }}>
                  <div className="text-[10px] font-medium mb-2" style={{ color: 'var(--text-light)' }}>키워드 (드래그하여 순서 변경)</div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {keywordArray.map((keyword, index) => (
                      <span
                        key={`${keyword}-${index}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className="group flex items-center gap-0.5 pl-1 pr-1 py-1 rounded-full text-xs font-medium transition-all cursor-grab active:cursor-grabbing select-none"
                        style={{
                          backgroundColor: dragOverIndex === index ? 'var(--ice-dark)' : 'var(--ice)',
                          color: 'var(--ice-deep)',
                          opacity: draggedIndex === index ? 0.5 : 1,
                          transform: dragOverIndex === index ? 'scale(1.05)' : 'scale(1)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GripVertical size={10} className="opacity-40 group-hover:opacity-70 flex-shrink-0" />
                        <span className="px-1">{keyword}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeKeyword(index); }}
                          className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-white/50 transition-colors flex-shrink-0"
                          title="삭제"
                        >
                          <Minus size={10} />
                        </button>
                      </span>
                    ))}
                    {/* 키워드 추가 */}
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="키워드"
                        className="px-2 py-1 text-xs rounded-l-full outline-none"
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid var(--ice-dark)',
                          borderRight: 'none',
                          color: 'var(--text-dark)',
                          width: '60px'
                        }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); addKeyword(); }}
                        className="flex items-center justify-center w-6 h-6 rounded-r-full transition-colors hover:opacity-80"
                        style={{ backgroundColor: 'var(--ice-accent)', color: 'white' }}
                        title="추가"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
