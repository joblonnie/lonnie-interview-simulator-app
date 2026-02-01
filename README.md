# 면접 시뮬레이터

면접 준비를 위한 질문/답변 관리 및 연습 앱입니다.

## 시작하기

```bash
npm install
npm run dev
```

## 주요 기능

### 회사별 질문 관리
- 여러 회사의 면접 질문을 별도로 관리
- 회사 추가/삭제/전환
- JSON 파일로 템플릿 내보내기/가져오기

### 질문 관리
- 카테고리별 질문 분류
- 질문/모범답안/키워드 저장
- 꼬리질문 지원 (메인 질문 하위에 들여쓰기 표시)
- 드래그 앤 드롭으로 순서 변경
- 질문 사이에 새 질문 삽입

### 음성 녹음 및 분석
- 질문별 답변 녹음
- Web Speech API 음성 인식 (Chrome/Edge)
- 모범 답안과 비교 분석
  - 내용 유사도 점수
  - 키워드 매칭 체크

### 학습 관리
- 질문별 완료 체크
- 진행률 표시
- 랜덤 질문 선택
- 카테고리 필터

## 기술 스택

- React 19 + Vite
- Tailwind CSS v4
- @dnd-kit (드래그 앤 드롭)
- Web Speech API
- localStorage

## 배포

GitHub Pages 자동 배포 (main 브랜치 push 시)

```bash
npm run build
```

## 브라우저 지원

- Chrome/Edge: 전체 기능 지원
- Firefox/Safari: 음성 인식 미지원
