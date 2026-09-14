# GenGreen — Gamified Environmental Education Platform

## Project Goal
Turn passive environmental education into a gamified learn → play → do → verify → earn loop,
with IBM Bob as the reasoning/explanation layer across mentoring, evidence verification, and
teacher insights.

## Core Features (already built, frontend + mock backend)
1. Student: topic learning, scenario quizzes, eco crossword, missions, badges, leaderboard.
2. Teacher: task allocation, verification review, performance & insights.
3. Organizer: competitions, analytics.

## What This Hackathon Pass Adds
1. Real IBM Bob call in the AI Mentor recommendation flow (replaces canned logic).
2. Real IBM Bob explanation layer on top of the deterministic mission-verification check.
3. Real IBM Bob-generated teacher class insights/action list.

## Technology
Frontend: React, Vite, Tailwind, shadcn/ui, Framer Motion, Recharts
Backend: Node.js + Express (in-memory mock data — do not add a real DB for this MVP)
AI layer: Python FastAPI + IBM Bob

## Architecture
client -> server (Express, mock data) -> ai-service (FastAPI) -> IBM Bob
                                                              -> deterministic rules stay in ai-service

## Development Rules
- Keep implementation simple and readable.
- Prefer existing dependencies; do not introduce a real database or auth provider.
- Deterministic rules (mission match, scoring) must NOT be replaced by Bob — Bob explains/prioritizes.
- If Bob lacks data to answer, say so explicitly — never invent facts.
- Keep each Bob prompt/context small and scoped to the entity in question (one student, one
  submission, one class) — never dump the whole mock dataset into a prompt.
- Add focused tests for the new ai-service endpoints.
- Preserve existing API contracts (`/api/...` routes) unless the team agrees otherwise.

## Core Services (ai-service)
mentor_service        — personalize-learning, now calls Bob
verification_service   — verify-image, deterministic match + Bob explanation
insight_service         — NEW: class-level Bob-generated teacher insights
