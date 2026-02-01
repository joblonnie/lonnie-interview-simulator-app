import { ChevronDown, ChevronRight, CheckCircle, Circle, Mic, Eye, EyeOff, FileText, Edit3, Trash2 } from 'lucide-react';
import { CATEGORY_COLORS, defaultColor } from '../constants/categoryColors';
import AudioRecorder from './AudioRecorder';

const QuestionCard = ({ question, category, isExpanded, onToggle, isCompleted, onComplete, recordings, setRecordings, showAnswer, onToggleAnswer, onEdit, onDelete, isEditMode }) => {
  const colors = CATEGORY_COLORS[category] || defaultColor;
  const questionId = `${category}-${question.question.slice(0, 20)}`;

  return (
    <div className={`rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}>
      <div className="p-4 cursor-pointer flex items-start gap-3" onClick={onToggle}>
        <button onClick={(e) => { e.stopPropagation(); onComplete(); }} className={`mt-0.5 flex-shrink-0 transition-colors ${isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-gray-400'}`}>
          {isCompleted ? <CheckCircle size={22} /> : <Circle size={22} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge} ${colors.text}`}>{category}</span>
            {question.isFollowup && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">꼬리질문</span>}
            {recordings[questionId] && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><Mic size={12} />녹음됨</span>}
          </div>
          <h3 className={`font-medium text-gray-800 ${isCompleted ? 'line-through opacity-60' : ''}`}>Q. {question.question}</h3>
        </div>
        <div className="flex items-center gap-1">
          {isEditMode && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                <Edit3 size={18} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={18} />
              </button>
            </>
          )}
          <div className="text-gray-400">{isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <div className="pl-9 space-y-3 mt-3">
            <AudioRecorder questionId={questionId} recordings={recordings} setRecordings={setRecordings} />
            <button
              onClick={(e) => { e.stopPropagation(); onToggleAnswer(); }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                showAnswer
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FileText size={18} />
              <span className="font-medium">{showAnswer ? '모범 답안 숨기기' : '모범 답안 보기'}</span>
              {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            {showAnswer && (
              <div className="bg-white rounded-lg p-4 border border-gray-100 animate-fadeIn">
                <div className="text-xs font-semibold text-emerald-600 mb-2 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle size={14} />
                  모범 답안
                </div>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{question.answer}</p>
                {question.keywords && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="font-medium text-gray-500 whitespace-nowrap">키워드:</span>
                      <span className={`${colors.text} font-medium`}>{question.keywords}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
