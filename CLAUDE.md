# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

This is a React 19 single-page application for interview practice simulation, built with Vite and styled with Tailwind CSS v4.

### Key Files

- `src/InterviewSimulator.jsx` - The entire application logic (1000+ lines single-file component)
- `vite.config.js` - Configured with base path `/lonnie-interview-simulator-app/` for GitHub Pages deployment

### Application Structure

The app is a self-contained interview simulator with:
- Multi-company support with localStorage persistence
- Question/answer management with categories
- Audio recording capability for practice answers
- Progress tracking (completion state per question)

### State Management

All state is managed via React hooks (useState, useMemo, useCallback) within the `InterviewSimulator` component. Data persists to localStorage under keys:
- `interview_companies` - Array of company objects with their interview data
- `interview_current_company` - Current selected company ID

### Deployment

Automatic GitHub Pages deployment via `.github/workflows/deploy.yml` on push to main branch. Build output goes to `dist/`.
