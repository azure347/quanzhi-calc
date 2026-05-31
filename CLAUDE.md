# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

"天坑劝退计算器" (Tiankeng劝退 Calculator) — a satirical single-page app that calculates a "劝退指数" (discouragement score) for university majors. The higher the score, the more you should reconsider. Built with Vue 3 + Vite.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run preview   # Preview production build
npm run test:e2e  # Run Playwright e2e tests
```

## Architecture

**Data-driven:** All major data lives in `src/data/majors.json` — dimensions (9 total), score segments, and per-major tiered data (bachelor/master/doctoral) with subfields and scores. No backend.

**Composables (logic):**
- `useCalculator.js` — `calculateIndex()` (weighted average), `getScoreSegment()` (score → tier label)
- `usePersistence.js` — syncs state to/from localStorage
- `useUrlSync.js` — encodes/decodes state into URL search params for shareable links

**State:** Single reactive `state` object in `App.vue` passed down via props/provide. State shape: `{ currentMajorId, currentTier, currentSubfield, weights[], compareList[], favorites[], recentMajors[], theme }`.

**Score calculation:** `Index = Σ(scores[i] × weights[i]) / Σ(weights[i])`. All-0 weights fallback to equal weight (3). Three newer dimensions (civil_exam, overseas_study, entrepreneurship) always use fixed weight 3. Scores 0–100, higher = more "天坑".

**URL sharing:** `useUrlSync` encodes major ID + tier in URL params. Base path configurable via `VITE_BASE` env var for GitHub Pages deployment.