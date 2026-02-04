import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shuffle, RotateCcw, BookOpen, Sparkles, ChevronDown, ChevronRight,
  Download, Plus, FolderOpen, Folder, Trash2, Edit3, FilePlus, FolderPlus, Pencil
} from 'lucide-react';

import QuestionCard from './components/QuestionCard';
import CompanyModal from './components/modals/CompanyModal';
import QuestionModal from './components/modals/QuestionModal';
import CategoryModal from './components/modals/CategoryModal';
import { MAIN_CATEGORIES as DEFAULT_MAIN_CATEGORIES } from './constants/categoryColors';
import { DEFAULT_INTERVIEW_DATA } from './constants/interviewData';

const DEFAULT_CATEGORIES_STRUCTURE = {
  '소개': { subcategories: ['자기소개', '문화-성향'] },
  '이력 기반': { subcategories: ['프로젝트-경험', '협업'] },
  '기술': { subcategories: ['JavaScript', 'React', 'TypeScript', '브라우저-렌더링', '메모리-성능', '네트워크', '빌드-배포', '아키텍처-기술판단'] },
  '마무리': { subcategories: ['역질문'] }
};

export default function InterviewSimulator() {
  const loadCompanies = () => {
    const saved = localStorage.getItem('interview_companies');
    if (saved) return JSON.parse(saved);
    return [{ id: 'default', name: '새 회사', data: DEFAULT_INTERVIEW_DATA, customCategories: null }];
  };

  const loadCurrentCompany = () => localStorage.getItem('interview_current_company') || 'default';

  const [companies, setCompanies] = useState(loadCompanies);
  const [currentCompanyId, setCurrentCompanyId] = useState(loadCurrentCompany);
  const [selectedMainCategory, setSelectedMainCategory] = useState('소개');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [expandedMain, setExpandedMain] = useState({ '소개': true });
  const [completedQuestions, setCompletedQuestions] = useState({});
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [recordings, setRecordings] = useState({});
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [categoryModalType, setCategoryModalType] = useState('sub'); // 'main' | 'sub'
  const [categoryModalMode, setCategoryModalMode] = useState('add'); // 'add' | 'edit'
  const [editingMainCategory, setEditingMainCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const currentCompany = useMemo(() => companies.find(c => c.id === currentCompanyId) || companies[0], [companies, currentCompanyId]);
  const data = useMemo(() => currentCompany?.data || { categories: [], totalQuestions: 0 }, [currentCompany]);
  const categoriesStructure = useMemo(() => currentCompany?.customCategories || DEFAULT_CATEGORIES_STRUCTURE, [currentCompany]);

  useEffect(() => { localStorage.setItem('interview_companies', JSON.stringify(companies)); }, [companies]);
  useEffect(() => { localStorage.setItem('interview_current_company', currentCompanyId); }, [currentCompanyId]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const getMainCategoryDynamic = useCallback((subcategory) => {
    for (const [main, data] of Object.entries(categoriesStructure)) {
      if (data.subcategories.includes(subcategory)) return main;
    }
    return Object.keys(categoriesStructure)[0] || '기타';
  }, [categoriesStructure]);

  const allQuestions = useMemo(() => {
    const questions = [];
    data.categories.forEach(cat => {
      cat.questions.forEach((q, idx) => {
        questions.push({ ...q, category: cat.category, mainCategory: getMainCategoryDynamic(cat.category), id: `${cat.category}-${idx}` });
      });
    });
    return questions;
  }, [data, getMainCategoryDynamic]);

  const questionsBySubCategory = useMemo(() => {
    const grouped = {};
    allQuestions.forEach(q => { if (!grouped[q.category]) grouped[q.category] = []; grouped[q.category].push(q); });
    return grouped;
  }, [allQuestions]);

  const currentQuestions = useMemo(() => {
    if (selectedSubCategory) return questionsBySubCategory[selectedSubCategory] || [];
    const mainCat = categoriesStructure[selectedMainCategory];
    if (!mainCat) return [];
    return allQuestions.filter(q => mainCat.subcategories.includes(q.category));
  }, [selectedMainCategory, selectedSubCategory, questionsBySubCategory, allQuestions, categoriesStructure]);

  const progress = useMemo(() => {
    const total = allQuestions.length;
    const completed = allQuestions.filter(q => completedQuestions[q.id]).length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [allQuestions, completedQuestions]);

  const subCategoryProgress = useMemo(() => {
    const result = {};
    Object.entries(questionsBySubCategory).forEach(([sub, questions]) => {
      result[sub] = { total: questions.length, completed: questions.filter(q => completedQuestions[q.id]).length };
    });
    return result;
  }, [questionsBySubCategory, completedQuestions]);

  const recordingStats = useMemo(() => Object.keys(recordings).length, [recordings]);

  // 회사 관리
  const addCompany = useCallback((name) => {
    const newCompany = { id: Date.now().toString(), name, data: { categories: [], totalQuestions: 0 }, customCategories: null };
    setCompanies(prev => [...prev, newCompany]); setCurrentCompanyId(newCompany.id); setShowCompanyModal(false);
  }, []);
  const deleteCompany = useCallback((id) => {
    if (companies.length <= 1) { alert('최소 하나의 회사는 필요합니다.'); return; }
    if (confirm('정말 삭제하시겠습니까?')) { setCompanies(prev => prev.filter(c => c.id !== id)); if (currentCompanyId === id) setCurrentCompanyId(companies.find(c => c.id !== id)?.id); }
  }, [companies, currentCompanyId]);
  const exportCompany = useCallback((company) => {
    const blob = new Blob([JSON.stringify({ name: company.name, data: company.data, customCategories: company.customCategories, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${company.name.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_interview.json`; a.click(); URL.revokeObjectURL(url);
  }, []);
  const importCompany = useCallback((importData) => {
    if (!importData.name || !importData.data) { alert('유효하지 않은 파일입니다.'); return; }
    const newCompany = { id: Date.now().toString(), name: importData.name, data: { ...importData.data, totalQuestions: importData.data.categories?.reduce((sum, cat) => sum + cat.questions.length, 0) || 0 }, customCategories: importData.customCategories || null };
    setCompanies(prev => [...prev, newCompany]); setCurrentCompanyId(newCompany.id); setShowCompanyModal(false);
  }, []);
  const updateCompanyData = useCallback((newData) => {
    setCompanies(prev => prev.map(c => c.id === currentCompanyId ? { ...c, data: { ...newData, totalQuestions: newData.categories.reduce((sum, cat) => sum + cat.questions.length, 0) } } : c));
  }, [currentCompanyId]);
  const updateCustomCategories = useCallback((newCategories) => {
    setCompanies(prev => prev.map(c => c.id === currentCompanyId ? { ...c, customCategories: newCategories } : c));
  }, [currentCompanyId]);

  // 대분류 관리
  const addMainCategory = useCallback((name) => {
    const current = currentCompany?.customCategories || { ...DEFAULT_CATEGORIES_STRUCTURE };
    if (current[name]) { alert('이미 존재하는 대분류입니다.'); return; }
    updateCustomCategories({ ...current, [name]: { subcategories: [] } });
  }, [currentCompany, updateCustomCategories]);

  const editMainCategory = useCallback((oldName, newName) => {
    if (oldName === newName) return;
    const current = currentCompany?.customCategories || { ...DEFAULT_CATEGORIES_STRUCTURE };
    if (current[newName]) { alert('이미 존재하는 대분류입니다.'); return; }
    const newCategories = {};
    Object.entries(current).forEach(([key, value]) => {
      if (key === oldName) {
        newCategories[newName] = value;
      } else {
        newCategories[key] = value;
      }
    });
    updateCustomCategories(newCategories);
    if (selectedMainCategory === oldName) setSelectedMainCategory(newName);
  }, [currentCompany, updateCustomCategories, selectedMainCategory]);

  const deleteMainCategory = useCallback((mainName) => {
    const current = currentCompany?.customCategories || { ...DEFAULT_CATEGORIES_STRUCTURE };
    if (Object.keys(current).length <= 1) { alert('최소 하나의 대분류는 필요합니다.'); return; }
    if (!confirm(`"${mainName}" 대분류와 하위 중분류를 모두 삭제하시겠습니까?`)) return;
    const newCategories = { ...current };
    delete newCategories[mainName];
    updateCustomCategories(newCategories);
    if (selectedMainCategory === mainName) setSelectedMainCategory(Object.keys(newCategories)[0]);
  }, [currentCompany, updateCustomCategories, selectedMainCategory]);

  // 중분류 관리
  const addSubCategory = useCallback((mainName, subName) => {
    const current = currentCompany?.customCategories || { ...DEFAULT_CATEGORIES_STRUCTURE };
    if (!current[mainName]) return;
    if (current[mainName].subcategories.includes(subName)) { alert('이미 존재하는 중분류입니다.'); return; }
    updateCustomCategories({
      ...current,
      [mainName]: { ...current[mainName], subcategories: [...current[mainName].subcategories, subName] }
    });
  }, [currentCompany, updateCustomCategories]);

  const editSubCategory = useCallback((mainName, oldSubName, newSubName) => {
    if (oldSubName === newSubName) return;
    const current = currentCompany?.customCategories || { ...DEFAULT_CATEGORIES_STRUCTURE };
    if (!current[mainName]) return;
    if (current[mainName].subcategories.includes(newSubName)) { alert('이미 존재하는 중분류입니다.'); return; }

    // 카테고리 구조 업데이트
    updateCustomCategories({
      ...current,
      [mainName]: {
        ...current[mainName],
        subcategories: current[mainName].subcategories.map(s => s === oldSubName ? newSubName : s)
      }
    });

    // 질문 데이터의 카테고리 이름도 업데이트
    const newCategories = data.categories.map(cat =>
      cat.category === oldSubName ? { ...cat, category: newSubName } : cat
    );
    updateCompanyData({ ...data, categories: newCategories });

    if (selectedSubCategory === oldSubName) setSelectedSubCategory(newSubName);
  }, [currentCompany, updateCustomCategories, data, updateCompanyData, selectedSubCategory]);

  const deleteSubCategory = useCallback((mainName, subName) => {
    const current = currentCompany?.customCategories || { ...DEFAULT_CATEGORIES_STRUCTURE };
    if (!confirm(`"${subName}" 중분류를 삭제하시겠습니까?`)) return;
    updateCustomCategories({
      ...current,
      [mainName]: { ...current[mainName], subcategories: current[mainName].subcategories.filter(s => s !== subName) }
    });
    if (selectedSubCategory === subName) setSelectedSubCategory(null);
  }, [currentCompany, updateCustomCategories, selectedSubCategory]);

  const addQuestion = useCallback((questionData) => {
    let newCategories = data.categories.map(cat => cat.category === questionData.category ? { ...cat, questions: [...cat.questions, { question: questionData.question, answer: questionData.answer, keywords: questionData.keywords, isFollowup: questionData.isFollowup }] } : cat);
    if (!data.categories.find(c => c.category === questionData.category)) newCategories.push({ order: newCategories.length + 1, category: questionData.category, questions: [{ question: questionData.question, answer: questionData.answer, keywords: questionData.keywords, isFollowup: questionData.isFollowup }] });
    updateCompanyData({ ...data, categories: newCategories });
  }, [data, updateCompanyData]);

  const updateQuestion = useCallback((originalCategory, originalQuestion, newData) => {
    let newCategories = data.categories.map(cat => {
      if (cat.category === originalCategory) {
        if (originalCategory === newData.category) return { ...cat, questions: cat.questions.map(q => q.question === originalQuestion ? { question: newData.question, answer: newData.answer, keywords: newData.keywords, isFollowup: newData.isFollowup } : q) };
        else return { ...cat, questions: cat.questions.filter(q => q.question !== originalQuestion) };
      }
      return cat;
    });
    if (originalCategory !== newData.category) newCategories = newCategories.map(cat => cat.category === newData.category ? { ...cat, questions: [...cat.questions, { question: newData.question, answer: newData.answer, keywords: newData.keywords, isFollowup: newData.isFollowup }] } : cat);
    updateCompanyData({ ...data, categories: newCategories });
  }, [data, updateCompanyData]);

  const deleteQuestion = useCallback((category, question) => {
    if (confirm('삭제하시겠습니까?')) updateCompanyData({ ...data, categories: data.categories.map(cat => cat.category === category ? { ...cat, questions: cat.questions.filter(q => q.question !== question) } : cat) });
  }, [data, updateCompanyData]);

  const updateKeywords = useCallback((category, questionText, newKeywords) => {
    updateCompanyData({
      ...data,
      categories: data.categories.map(cat =>
        cat.category === category
          ? { ...cat, questions: cat.questions.map(q => q.question === questionText ? { ...q, keywords: newKeywords } : q) }
          : cat
      )
    });
  }, [data, updateCompanyData]);

  const toggleQuestion = useCallback((id) => setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] })), []);
  const toggleComplete = useCallback((id) => setCompletedQuestions(prev => ({ ...prev, [id]: !prev[id] })), []);
  const toggleAnswer = useCallback((id) => setVisibleAnswers(prev => ({ ...prev, [id]: !prev[id] })), []);
  const toggleFollowup = useCallback((category, questionText) => { updateCompanyData({ ...data, categories: data.categories.map(cat => cat.category === category ? { ...cat, questions: cat.questions.map(q => q.question === questionText ? { ...q, isFollowup: !q.isFollowup } : q) } : cat) }); }, [data, updateCompanyData]);

  const selectRandomQuestion = useCallback(() => {
    const uncompleted = currentQuestions.filter(q => !completedQuestions[q.id]);
    const pool = uncompleted.length > 0 ? uncompleted : currentQuestions;
    if (pool.length === 0) return;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    setRandomQuestion(selected); setExpandedQuestions(prev => ({ ...prev, [selected.id]: true }));
  }, [currentQuestions, completedQuestions]);

  const resetProgress = useCallback(() => { setCompletedQuestions({}); setExpandedQuestions({}); setVisibleAnswers({}); setRandomQuestion(null); }, []);

  const exportRecordings = useCallback(() => {
    if (Object.keys(recordings).length === 0) { alert('녹음이 없습니다.'); return; }
    const blob = new Blob([JSON.stringify({ company: currentCompany?.name || 'Unknown', exportedAt: new Date().toISOString(), recordings: Object.entries(recordings).map(([id, rec]) => ({ questionId: id, transcript: rec.transcript || null, duration: rec.duration })) }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${currentCompany?.name || 'recordings'}_녹음.json`; a.click(); URL.revokeObjectURL(url);
  }, [recordings, currentCompany]);

  const handleContextMenu = useCallback((e, type, mainName = null, subName = null) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type, mainName, subName });
  }, []);

  // 카테고리 모달 열기 헬퍼
  const openCategoryModal = (type, mode, mainName = null, subName = null) => {
    setCategoryModalType(type);
    setCategoryModalMode(mode);
    setEditingMainCategory(mainName);
    setEditingSubCategory(subName);
    setShowCategoryModal(true);
    setContextMenu(null);
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--cloud)' }}>
      {/* 헤더 */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b z-10" style={{ borderColor: 'var(--orchid)' }}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--orchid-accent)' }}>
                <BookOpen className="text-white" size={22} />
              </div>
              <div>
                <button onClick={() => setShowCompanyModal(true)} className="text-lg font-bold flex items-center gap-1.5 hover:opacity-70" style={{ color: 'var(--text-dark)' }}>
                  {currentCompany?.name || '회사 선택'}
                  <ChevronDown size={16} />
                </button>
                <p className="text-xs" style={{ color: 'var(--text-light)' }}>{progress.completed}/{progress.total} 완료 · {recordingStats}개 녹음</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={selectRandomQuestion} disabled={currentQuestions.length === 0} className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: 'var(--orchid-accent)' }}>
                <Shuffle size={16} /><span className="hidden sm:inline">랜덤</span>
              </button>
              <button onClick={resetProgress} className="p-2 bg-white rounded-lg hover:bg-opacity-80" style={{ color: 'var(--text-mid)', border: '1px solid var(--orchid)' }}>
                <RotateCcw size={18} />
              </button>
              {recordingStats > 0 && (
                <button onClick={exportRecordings} className="p-2 text-white rounded-lg hover:opacity-90" style={{ backgroundColor: 'var(--orchid-deep)' }}>
                  <Download size={18} />
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--orchid)' }}>
            <div className="h-full transition-all duration-500" style={{ width: `${progress.percentage}%`, backgroundColor: 'var(--orchid-accent)' }} />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* 사이드바 */}
        <aside className="w-56 flex-shrink-0 bg-white/60 backdrop-blur-sm overflow-y-auto" style={{ borderRight: '1px solid var(--orchid)' }}>
          <nav className="p-2">
            {Object.entries(categoriesStructure).map(([mainName, mainData]) => {
              const isExpanded = expandedMain[mainName];
              const mainCount = mainData.subcategories.reduce((sum, sub) => sum + (questionsBySubCategory[sub]?.length || 0), 0);
              const mainCompleted = mainData.subcategories.reduce((sum, sub) => sum + (subCategoryProgress[sub]?.completed || 0), 0);
              const isMainSelected = selectedMainCategory === mainName && !selectedSubCategory;
              const isHovered = hoveredCategory === `main-${mainName}`;

              return (
                <div key={mainName} className="mb-1">
                  <div
                    className="group flex items-center gap-1"
                    onMouseEnter={() => setHoveredCategory(`main-${mainName}`)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onContextMenu={(e) => handleContextMenu(e, 'main', mainName)}
                  >
                    <button
                      onClick={() => { setExpandedMain(prev => ({ ...prev, [mainName]: !prev[mainName] })); setSelectedMainCategory(mainName); setSelectedSubCategory(null); }}
                      className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-semibold transition-colors"
                      style={{ backgroundColor: isMainSelected ? 'var(--ice)' : 'transparent', color: isMainSelected ? 'var(--ice-deep)' : 'var(--text-dark)' }}
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className="flex-1 truncate">{mainName}</span>
                      <span className="text-xs" style={{ color: 'var(--text-light)' }}>{mainCompleted}/{mainCount}</span>
                    </button>
                    {isHovered && (
                      <button
                        onClick={() => openCategoryModal('sub', 'add', mainName)}
                        className="p-1 rounded hover:opacity-70"
                        style={{ color: 'var(--ice-accent)' }}
                        title="중분류 추가"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="ml-3 mt-0.5 space-y-0.5 pl-2" style={{ borderLeft: '2px solid var(--orchid)' }}>
                      {mainData.subcategories.map(subName => {
                        const subProg = subCategoryProgress[subName] || { total: 0, completed: 0 };
                        const isSelected = selectedSubCategory === subName;
                        const isDone = subProg.completed === subProg.total && subProg.total > 0;
                        const isSubHovered = hoveredCategory === `sub-${subName}`;
                        return (
                          <div
                            key={subName}
                            className="group flex items-center gap-1"
                            onMouseEnter={() => setHoveredCategory(`sub-${subName}`)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            onContextMenu={(e) => handleContextMenu(e, 'sub', mainName, subName)}
                          >
                            <button onClick={() => { setSelectedMainCategory(mainName); setSelectedSubCategory(subName); }}
                              className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors"
                              style={{ backgroundColor: isSelected ? 'var(--orchid)' : 'transparent', color: isSelected ? 'var(--orchid-deep)' : 'var(--text-mid)', fontWeight: isSelected ? 500 : 400 }}
                            >
                              {isSelected ? <FolderOpen size={12} /> : <Folder size={12} />}
                              <span className="flex-1 truncate">{subName}</span>
                              <span className="text-[10px]" style={{ color: isDone ? 'var(--orchid-accent)' : 'var(--text-light)' }}>{subProg.completed}/{subProg.total}</span>
                            </button>
                            {isSubHovered && (
                              <button
                                onClick={() => { setSelectedSubCategory(subName); setEditingQuestion(null); setShowQuestionModal(true); }}
                                className="p-0.5 rounded hover:opacity-70"
                                style={{ color: 'var(--orchid-accent)' }}
                                title="질문 추가"
                              >
                                <Plus size={12} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {/* 대분류 추가 */}
            <div
              className="group mt-2 flex items-center justify-center"
              onMouseEnter={() => setHoveredCategory('add-main')}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {hoveredCategory === 'add-main' && (
                <button
                  onClick={() => openCategoryModal('main', 'add')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-70"
                  style={{ color: 'var(--text-light)' }}
                  title="대분류 추가"
                >
                  <FolderPlus size={14} />대분류 추가
                </button>
              )}
              {hoveredCategory !== 'add-main' && (
                <div className="h-8 flex items-center justify-center">
                  <div className="w-8 h-0.5 rounded" style={{ backgroundColor: 'var(--orchid)' }} />
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* 메인 컨텐츠 */}
        <main
          className="flex-1 overflow-y-auto p-4"
          style={{ backgroundColor: 'var(--cloud)' }}
        >
          {randomQuestion && (
            <div className="mb-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--orchid)', border: '1px solid var(--orchid-dark)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} style={{ color: 'var(--orchid-accent)' }} />
                <span className="font-semibold text-sm" style={{ color: 'var(--orchid-deep)' }}>랜덤 선택</span>
              </div>
              <QuestionCard question={randomQuestion} category={randomQuestion.category} isExpanded={expandedQuestions[randomQuestion.id]} onToggle={() => toggleQuestion(randomQuestion.id)} isCompleted={completedQuestions[randomQuestion.id]} onComplete={() => toggleComplete(randomQuestion.id)} recordings={recordings} setRecordings={setRecordings} showAnswer={visibleAnswers[randomQuestion.id] !== false} onToggleAnswer={() => toggleAnswer(randomQuestion.id)} onEdit={() => { setEditingQuestion(randomQuestion); setShowQuestionModal(true); }} onDelete={() => deleteQuestion(randomQuestion.category, randomQuestion.question)} isEditMode={true} isFollowup={randomQuestion.isFollowup} onToggleFollowup={() => toggleFollowup(randomQuestion.category, randomQuestion.question)} onUpdateKeywords={updateKeywords} />
            </div>
          )}

          <div className="mb-3">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-dark)' }}>{selectedSubCategory || selectedMainCategory}</h2>
            <p className="text-xs" style={{ color: 'var(--text-light)' }}>{currentQuestions.length}개 질문</p>
          </div>

          <div className="space-y-2">
            {currentQuestions.map((question) => (
              <div key={question.id} className={question.isFollowup ? 'ml-5' : ''}>
                <QuestionCard question={question} category={question.category} isExpanded={expandedQuestions[question.id]} onToggle={() => toggleQuestion(question.id)} isCompleted={completedQuestions[question.id]} onComplete={() => toggleComplete(question.id)} recordings={recordings} setRecordings={setRecordings} showAnswer={visibleAnswers[question.id] !== false} onToggleAnswer={() => toggleAnswer(question.id)} onEdit={() => { setEditingQuestion(question); setShowQuestionModal(true); }} onDelete={() => deleteQuestion(question.category, question.question)} isEditMode={true} isFollowup={question.isFollowup} onToggleFollowup={() => toggleFollowup(question.category, question.question)} onUpdateKeywords={updateKeywords} />
              </div>
            ))}
            {currentQuestions.length === 0 && (
              <div className="text-center py-12" style={{ color: 'var(--text-light)' }}>
                <Folder size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">질문이 없습니다</p>
                <p className="text-xs mt-1">우클릭하여 질문을 추가하세요</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y, border: '1px solid var(--orchid)', minWidth: '140px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'main' && (
            <>
              <button
                onClick={() => openCategoryModal('sub', 'add', contextMenu.mainName)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                style={{ color: 'var(--text-dark)' }}
              >
                <FolderPlus size={14} style={{ color: 'var(--ice-accent)' }} />
                중분류 추가
              </button>
              <button
                onClick={() => openCategoryModal('main', 'edit', contextMenu.mainName)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                style={{ color: 'var(--text-dark)' }}
              >
                <Pencil size={14} style={{ color: 'var(--text-mid)' }} />
                대분류 수정
              </button>
              <button
                onClick={() => { deleteMainCategory(contextMenu.mainName); setContextMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                style={{ color: 'var(--orchid-accent)' }}
              >
                <Trash2 size={14} />
                대분류 삭제
              </button>
            </>
          )}
          {contextMenu.type === 'sub' && (
            <>
              <button
                onClick={() => { setSelectedSubCategory(contextMenu.subName); setEditingQuestion(null); setShowQuestionModal(true); setContextMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                style={{ color: 'var(--text-dark)' }}
              >
                <FilePlus size={14} style={{ color: 'var(--orchid-accent)' }} />
                질문 추가
              </button>
              <button
                onClick={() => openCategoryModal('sub', 'edit', contextMenu.mainName, contextMenu.subName)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                style={{ color: 'var(--text-dark)' }}
              >
                <Pencil size={14} style={{ color: 'var(--text-mid)' }} />
                중분류 수정
              </button>
              <button
                onClick={() => { deleteSubCategory(contextMenu.mainName, contextMenu.subName); setContextMenu(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 text-left"
                style={{ color: 'var(--orchid-accent)' }}
              >
                <Trash2 size={14} />
                중분류 삭제
              </button>
            </>
          )}
        </div>
      )}

      <CompanyModal isOpen={showCompanyModal} onClose={() => setShowCompanyModal(false)} companies={companies} onSelect={setCurrentCompanyId} onAdd={addCompany} onDelete={deleteCompany} onExport={exportCompany} onImport={importCompany} />
      <QuestionModal isOpen={showQuestionModal} onClose={() => { setShowQuestionModal(false); setEditingQuestion(null); }} onSave={(formData) => { if (editingQuestion) updateQuestion(editingQuestion.category, editingQuestion.question, formData); else addQuestion(formData); }} question={editingQuestion} categories={data.categories} customCategories={categoriesStructure} />
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => { setShowCategoryModal(false); setEditingMainCategory(null); setEditingSubCategory(null); }}
        onSave={(name) => {
          if (categoryModalType === 'main') {
            if (categoryModalMode === 'edit') editMainCategory(editingMainCategory, name);
            else addMainCategory(name);
          } else {
            if (categoryModalMode === 'edit') editSubCategory(editingMainCategory, editingSubCategory, name);
            else addSubCategory(editingMainCategory, name);
          }
        }}
        isMainCategory={categoryModalType === 'main'}
        categoryName={categoryModalMode === 'edit' ? (categoryModalType === 'main' ? editingMainCategory : editingSubCategory) : ''}
        mode={categoryModalMode}
      />
    </div>
  );
}
