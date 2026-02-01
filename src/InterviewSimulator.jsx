import { useState, useEffect, useMemo, useCallback } from 'react';
import { Shuffle, Eye, EyeOff, RotateCcw, Filter, X, BookOpen, Sparkles, Plus, Building2, FolderPlus, Settings, ChevronDown } from 'lucide-react';
import { DEFAULT_INTERVIEW_DATA } from './constants/interviewData';
import { CATEGORY_COLORS, defaultColor } from './constants/categoryColors';
import QuestionCard from './components/QuestionCard';
import QuestionModal from './components/modals/QuestionModal';
import CategoryModal from './components/modals/CategoryModal';
import CompanyModal from './components/modals/CompanyModal';

export default function InterviewSimulator() {
  // localStorage에서 회사 목록 로드
  const loadCompanies = () => {
    const saved = localStorage.getItem('interview_companies');
    if (saved) {
      return JSON.parse(saved);
    }
    // 기본 회사 (빈 템플릿)
    return [{
      id: 'default',
      name: '새 회사',
      data: DEFAULT_INTERVIEW_DATA
    }];
  };

  const loadCurrentCompany = () => {
    return localStorage.getItem('interview_current_company') || 'default';
  };

  const [companies, setCompanies] = useState(loadCompanies);
  const [currentCompanyId, setCurrentCompanyId] = useState(loadCurrentCompany);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [recordings, setRecordings] = useState({});
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // 현재 회사 데이터 가져오기
  const currentCompany = useMemo(() => {
    return companies.find(c => c.id === currentCompanyId) || companies[0];
  }, [companies, currentCompanyId]);

  const data = useMemo(() => {
    return currentCompany?.data || { categories: [], totalQuestions: 0 };
  }, [currentCompany]);

  // localStorage에 저장
  useEffect(() => {
    localStorage.setItem('interview_companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem('interview_current_company', currentCompanyId);
  }, [currentCompanyId]);

  const allQuestions = useMemo(() => {
    const questions = [];
    data.categories.forEach(cat => {
      cat.questions.forEach((q, idx) => {
        questions.push({ ...q, category: cat.category, id: `${cat.category}-${idx}` });
      });
    });
    return questions;
  }, [data]);

  const filteredQuestions = useMemo(() => {
    if (selectedCategories.length === 0) return allQuestions;
    return allQuestions.filter(q => selectedCategories.includes(q.category));
  }, [allQuestions, selectedCategories]);

  const progress = useMemo(() => {
    const total = filteredQuestions.length;
    const completed = filteredQuestions.filter(q => completedQuestions[q.id]).length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [filteredQuestions, completedQuestions]);

  const recordingStats = useMemo(() => Object.keys(recordings).length, [recordings]);

  // 회사 관리 함수들
  const addCompany = useCallback((name) => {
    const newCompany = {
      id: Date.now().toString(),
      name,
      data: { categories: [], totalQuestions: 0 }
    };
    setCompanies(prev => [...prev, newCompany]);
    setCurrentCompanyId(newCompany.id);
    setShowCompanyModal(false);
  }, []);

  const deleteCompany = useCallback((id) => {
    if (companies.length <= 1) {
      alert('최소 하나의 회사는 필요합니다.');
      return;
    }
    if (confirm('정말 이 회사를 삭제하시겠습니까?')) {
      setCompanies(prev => prev.filter(c => c.id !== id));
      if (currentCompanyId === id) {
        setCurrentCompanyId(companies.find(c => c.id !== id)?.id);
      }
    }
  }, [companies, currentCompanyId]);

  // 데이터 업데이트 함수
  const updateCompanyData = useCallback((newData) => {
    setCompanies(prev => prev.map(c =>
      c.id === currentCompanyId
        ? { ...c, data: { ...newData, totalQuestions: newData.categories.reduce((sum, cat) => sum + cat.questions.length, 0) } }
        : c
    ));
  }, [currentCompanyId]);

  // 카테고리 관리
  const addCategory = useCallback((name) => {
    const newCategories = [...data.categories, {
      order: data.categories.length + 1,
      category: name,
      questions: []
    }];
    updateCompanyData({ ...data, categories: newCategories });
  }, [data, updateCompanyData]);

  const deleteCategory = useCallback((categoryName) => {
    if (confirm(`"${categoryName}" 카테고리와 모든 질문을 삭제하시겠습니까?`)) {
      const newCategories = data.categories.filter(c => c.category !== categoryName);
      updateCompanyData({ ...data, categories: newCategories });
    }
  }, [data, updateCompanyData]);

  // 질문 관리
  const addQuestion = useCallback((questionData) => {
    const newCategories = data.categories.map(cat => {
      if (cat.category === questionData.category) {
        return {
          ...cat,
          questions: [...cat.questions, {
            question: questionData.question,
            answer: questionData.answer,
            keywords: questionData.keywords,
            isFollowup: questionData.isFollowup
          }]
        };
      }
      return cat;
    });
    updateCompanyData({ ...data, categories: newCategories });
  }, [data, updateCompanyData]);

  const updateQuestion = useCallback((originalCategory, originalQuestion, newData) => {
    let newCategories = data.categories.map(cat => {
      if (cat.category === originalCategory) {
        return {
          ...cat,
          questions: cat.questions.filter(q => q.question !== originalQuestion)
        };
      }
      return cat;
    });

    newCategories = newCategories.map(cat => {
      if (cat.category === newData.category) {
        return {
          ...cat,
          questions: [...cat.questions, {
            question: newData.question,
            answer: newData.answer,
            keywords: newData.keywords,
            isFollowup: newData.isFollowup
          }]
        };
      }
      return cat;
    });

    updateCompanyData({ ...data, categories: newCategories });
  }, [data, updateCompanyData]);

  const deleteQuestion = useCallback((category, question) => {
    if (confirm('이 질문을 삭제하시겠습니까?')) {
      const newCategories = data.categories.map(cat => {
        if (cat.category === category) {
          return {
            ...cat,
            questions: cat.questions.filter(q => q.question !== question)
          };
        }
        return cat;
      });
      updateCompanyData({ ...data, categories: newCategories });
    }
  }, [data, updateCompanyData]);

  const toggleCategory = useCallback((category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  }, []);

  const toggleQuestion = useCallback((id) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleComplete = useCallback((id) => {
    setCompletedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleAnswer = useCallback((id) => {
    setVisibleAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const selectRandomQuestion = useCallback(() => {
    const uncompletedQuestions = filteredQuestions.filter(q => !completedQuestions[q.id]);
    const pool = uncompletedQuestions.length > 0 ? uncompletedQuestions : filteredQuestions;
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    setRandomQuestion(selected);
    setExpandedQuestions(prev => ({ ...prev, [selected.id]: true }));
    setVisibleAnswers(prev => ({ ...prev, [selected.id]: false }));
  }, [filteredQuestions, completedQuestions]);

  const showAllAnswers = useCallback(() => {
    const newVisible = {};
    filteredQuestions.forEach(q => { newVisible[q.id] = true; });
    setVisibleAnswers(prev => ({ ...prev, ...newVisible }));
    const newExpanded = {};
    filteredQuestions.forEach(q => { newExpanded[q.id] = true; });
    setExpandedQuestions(prev => ({ ...prev, ...newExpanded }));
  }, [filteredQuestions]);

  const hideAllAnswers = useCallback(() => {
    const newVisible = {};
    filteredQuestions.forEach(q => { newVisible[q.id] = false; });
    setVisibleAnswers(prev => ({ ...prev, ...newVisible }));
  }, [filteredQuestions]);

  const resetProgress = useCallback(() => {
    setCompletedQuestions({});
    setExpandedQuestions({});
    setVisibleAnswers({});
    setRandomQuestion(null);
  }, []);

  const allAnswersVisible = useMemo(() => {
    return filteredQuestions.length > 0 && filteredQuestions.every(q => visibleAnswers[q.id]);
  }, [filteredQuestions, visibleAnswers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <button
                  onClick={() => setShowCompanyModal(true)}
                  className="text-xl font-bold text-gray-800 hover:text-blue-600 flex items-center gap-2 transition-colors"
                >
                  {currentCompany?.name || '회사 선택'}
                  <ChevronDown size={18} />
                </button>
                <p className="text-sm text-gray-500">{data.totalQuestions}개 질문 · {recordingStats}개 녹음됨</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-2.5 rounded-xl border-2 transition-all ${isEditMode ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                <Settings size={20} />
              </button>
              <button onClick={() => setShowFilterPanel(!showFilterPanel)} className={`p-2.5 rounded-xl border-2 transition-all ${showFilterPanel || selectedCategories.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <Filter size={20} />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">학습 진행률</span>
              <span className="font-semibold text-gray-800">{progress.completed} / {progress.total} ({progress.percentage}%)</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress.percentage}%` }} />
            </div>
          </div>
        </div>
      </header>

      {showFilterPanel && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">카테고리 필터</h3>
              <div className="flex items-center gap-2">
                {isEditMode && (
                  <button
                    onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <FolderPlus size={14} />카테고리 추가
                  </button>
                )}
                {selectedCategories.length > 0 && (
                  <button onClick={() => setSelectedCategories([])} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"><X size={14} />필터 초기화</button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.categories.map(cat => {
                const colors = CATEGORY_COLORS[cat.category] || defaultColor;
                const isSelected = selectedCategories.includes(cat.category);
                return (
                  <div key={cat.category} className="flex items-center gap-1">
                    <button onClick={() => toggleCategory(cat.category)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isSelected ? `${colors.badge} ${colors.text} ring-2 ring-offset-1 ${colors.border.replace('border-', 'ring-')}` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {cat.category} ({cat.questions.length})
                    </button>
                    {isEditMode && (
                      <button
                        onClick={() => deleteCategory(cat.category)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {isEditMode && (
            <button
              onClick={() => { setEditingQuestion(null); setShowQuestionModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus size={18} />질문 추가
            </button>
          )}
          <button onClick={selectRandomQuestion} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all hover:scale-105" disabled={filteredQuestions.length === 0}>
            <Shuffle size={18} />랜덤 질문
          </button>
          <button onClick={allAnswersVisible ? hideAllAnswers : showAllAnswers} className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300">
            {allAnswersVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            {allAnswersVisible ? '전체 답안 숨기기' : '전체 답안 보기'}
          </button>
          <button onClick={resetProgress} className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300">
            <RotateCcw size={18} />진행률 초기화
          </button>
        </div>
      </div>

      {randomQuestion && (
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-1 shadow-xl">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="text-violet-500" size={20} />
                <span className="font-semibold text-violet-600">랜덤 선택된 질문</span>
              </div>
              <QuestionCard
                question={randomQuestion}
                category={randomQuestion.category}
                isExpanded={expandedQuestions[randomQuestion.id]}
                onToggle={() => toggleQuestion(randomQuestion.id)}
                isCompleted={completedQuestions[randomQuestion.id]}
                onComplete={() => toggleComplete(randomQuestion.id)}
                recordings={recordings}
                setRecordings={setRecordings}
                showAnswer={visibleAnswers[randomQuestion.id]}
                onToggleAnswer={() => toggleAnswer(randomQuestion.id)}
                onEdit={() => { setEditingQuestion(randomQuestion); setShowQuestionModal(true); }}
                onDelete={() => deleteQuestion(randomQuestion.category, randomQuestion.question)}
                isEditMode={isEditMode}
              />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 pb-8">
        <div className="space-y-3">
          {filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              category={question.category}
              isExpanded={expandedQuestions[question.id]}
              onToggle={() => toggleQuestion(question.id)}
              isCompleted={completedQuestions[question.id]}
              onComplete={() => toggleComplete(question.id)}
              recordings={recordings}
              setRecordings={setRecordings}
              showAnswer={visibleAnswers[question.id]}
              onToggleAnswer={() => toggleAnswer(question.id)}
              onEdit={() => { setEditingQuestion(question); setShowQuestionModal(true); }}
              onDelete={() => deleteQuestion(question.category, question.question)}
              isEditMode={isEditMode}
            />
          ))}
        </div>
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <Filter size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {data.categories.length === 0
                ? '아직 질문이 없습니다. 질문을 추가해보세요!'
                : '선택된 카테고리에 질문이 없습니다.'}
            </p>
            {isEditMode && data.categories.length === 0 && (
              <button
                onClick={() => setShowCategoryModal(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                카테고리 추가하기
              </button>
            )}
          </div>
        )}
      </main>

      {/* 모달들 */}
      <CompanyModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        companies={companies}
        onSelect={setCurrentCompanyId}
        onAdd={addCompany}
        onDelete={deleteCompany}
      />

      <QuestionModal
        isOpen={showQuestionModal}
        onClose={() => { setShowQuestionModal(false); setEditingQuestion(null); }}
        onSave={(formData) => {
          if (editingQuestion) {
            updateQuestion(editingQuestion.category, editingQuestion.question, formData);
          } else {
            addQuestion(formData);
          }
        }}
        question={editingQuestion}
        categories={data.categories}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
        onSave={addCategory}
        categoryName={editingCategory}
      />
    </div>
  );
}
