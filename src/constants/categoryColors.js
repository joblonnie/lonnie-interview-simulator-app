// 대분류 카테고리
export const MAIN_CATEGORIES = {
  '소개': {
    color: 'purple',
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-800',
    badge: 'bg-purple-200',
    subcategories: ['자기소개', '문화-성향']
  },
  '이력 기반': {
    color: 'emerald',
    bg: 'bg-emerald-100',
    border: 'border-emerald-400',
    text: 'text-emerald-800',
    badge: 'bg-emerald-200',
    subcategories: ['프로젝트-경험', '협업']
  },
  '기술': {
    color: 'blue',
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-800',
    badge: 'bg-blue-200',
    subcategories: ['JavaScript', 'React', 'TypeScript', '브라우저-렌더링', '메모리-성능', '네트워크', '빌드-배포', '아키텍처-기술판단']
  },
  '마무리': {
    color: 'amber',
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    text: 'text-amber-800',
    badge: 'bg-amber-200',
    subcategories: ['역질문']
  }
};

// 소분류 → 대분류 매핑
export const getMainCategory = (subcategory) => {
  for (const [main, data] of Object.entries(MAIN_CATEGORIES)) {
    if (data.subcategories.includes(subcategory)) {
      return main;
    }
  }
  return '기술'; // 기본값
};

// 소분류 카테고리 색상 (기존 호환)
export const CATEGORY_COLORS = {
  // 소개
  '자기소개': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100' },
  '문화-성향': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100' },

  // 이력 기반
  '프로젝트-경험': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100' },
  '협업': { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100' },

  // 기술
  'JavaScript': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100' },
  'React': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100' },
  'TypeScript': { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100' },
  '브라우저-렌더링': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' },
  '메모리-성능': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' },
  '네트워크': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100' },
  '빌드-배포': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' },
  '아키텍처-기술판단': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', badge: 'bg-pink-100' },

  // 마무리
  '역질문': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100' },
};

export const defaultColor = { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100' };

// 모든 소분류 목록
export const ALL_SUBCATEGORIES = Object.values(MAIN_CATEGORIES).flatMap(m => m.subcategories);
