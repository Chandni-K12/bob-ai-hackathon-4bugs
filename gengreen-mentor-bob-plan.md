# GenGreen — Real IBM Bob Call for `/personalize-learning`

## Overview

Replace the deterministic mock inside `POST /personalize-learning` in
[`src/ai-service/main.py`](src/ai-service/main.py) with a real IBM Bob (watsonx.ai)
call. The response schema stays identical so the frontend does not change.
All other endpoints (`/verify-image`, `/health`) are untouched.

**Scope:** One function in one file (`main.py`) plus a new helper module
(`services/mentor_service.py`) and two tests.

**Tech stack (from AGENTS.md):** Python · FastAPI · IBM Bob (watsonx.ai text API)

---

## What the Current Mock Does

```
/personalize-learning
  1. Find the topic with the lowest score (deterministic)
  2. Look up a hard-coded mission_map
  3. Return { recommended_topic, reason, recommended_mission, learning_style }
     where learning_style is always "scenario-based"
```

## What the Real Implementation Does

```
/personalize-learning
  1. Build a compact context dict from the request (topic scores, completed
     lessons, mission activity) — never the entire dataset
  2. Call IBM Bob via the watsonx.ai text generation API with a focused prompt
  3. Parse Bob's JSON reply into the same four-field schema
  4. If Bob is unavailable OR returns unparseable output, fall back to the
     existing deterministic logic (not an error to the caller)
```

---

## Directory Layout (target state)

```
src/ai-service/
  main.py                        ← thin route; delegates to mentor_service
  requirements.txt               ← add ibm-watsonx-ai (and python-dotenv)
  services/
    mentor_service.py            ← Bob call + fallback logic
  tests/
    test_mentor_service.py       ← two focused unit tests
```

---

## Sub-Tasks

---

### Sub-Task 1 — Add Dependencies

**Intent**
Make the IBM watsonx.ai SDK and dotenv available without introducing any
unneeded packages.

**Expected Outcomes**
- `requirements.txt` adds `ibm-watsonx-ai` and `python-dotenv`
- All existing entries (`fastapi`, `uvicorn`, `pydantic`) are preserved

**Todo List**
1. Append `ibm-watsonx-ai` and `python-dotenv` to
   `src/ai-service/requirements.txt`.

**Relevant Context**
- [`src/ai-service/requirements.txt`](src/ai-service/requirements.txt) — current:
  `fastapi==0.104.1`, `uvicorn==0.24.0`, `pydantic==2.5.2`
- AGENTS.md: "Prefer existing dependencies; do not introduce a real database
  or auth provider."

**Status:** [ ] pending

---

### Sub-Task 2 — Environment Variables

**Intent**
Document the three IBM Bob credentials the service needs, so any team member
can run it locally without hunting for key names.

**Expected Outcomes**
- `src/.env.example` gains three new commented variables:
  `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_URL`
- No `.env` file is committed

**Todo List**
1. Append the three variables (with placeholder values and a comment) to
   `src/.env.example`.

**Relevant Context**
- [`src/.env.example`](src/.env.example) — currently only has `VITE_API_URL`,
  `VITE_AI_URL`, backend/Cloudinary vars; no watsonx block yet
- AGENTS.md: "NEVER commit `.env`"

**Status:** [ ] pending

---

### Sub-Task 3 — `mentor_service.py`

**Intent**
Isolate all Bob interaction in one dedicated module so `main.py` stays thin
and the service is independently testable.

**Expected Outcomes**- `src/ai-service/services/mentor_service.py` exists and exports one function:
  `get_personalized_recommendation(req: PersonalizeLearningRequest) -> PersonalizeLearningResponse`
- The function builds the Bob prompt, calls the API, parses the response
- On any failure (network error, JSON parse error, missing fields) it silently
  falls back to the deterministic logic that currently lives in `main.py`
- The fallback path is identical to the current mock (find weakest topic,
  look up `mission_map`) — code is moved, not rewritten

**Context to send to Bob (compact, scoped to one student)**
```json
{
  "topic_scores": [{"topic": "Water Conservation", "score": 58}, ...],
  "completed_lessons": ["Introduction to Climate", ...],
  "recent_mission_activity": ["tree_plantation", ...]
}
```
Only the fields in `PersonalizeLearningRequest` — no extra data injected.

**Prompt Bob receives**
```
You are an environmental education mentor for school students.
Given the student context below, return a JSON object with exactly these keys:
  recommended_topic   — the topic the student should study next (string)
  reason              — one sentence explaining why (string)
  recommended_mission — the hands-on mission best matched to that topic (string)
  learning_style      — one of: scenario-based, mission-based, reading (string)

Student context:
{context_json}

Return only valid JSON. No explanation outside the JSON object.
```

**Response parsing rule**
- Extract the first `{...}` block from Bob's text output with `json.loads`
- Validate that all four keys are present strings
- If any check fails → use fallback

**Todo List**
1. Create `src/ai-service/services/__init__.py` (empty).
2. Write `src/ai-service/services/mentor_service.py`:
   a. Read `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `WATSONX_URL` from env
      (via `os.environ.get`; missing keys → fallback, not crash)
   b. Build the compact context dict from `req`
   c. Build the prompt string
   d. Call `ModelInference` from `ibm_watsonx_ai` with
      `model_id = os.environ.get("WATSONX_MODEL_ID", "ibm/granite-3-8b-instruct")`
      (default confirmed; overrideable via env var); wrap in try/except
   e. Parse the response text with a regex to extract the first `{...}` block,
      then `json.loads`
   f. Validate all four keys exist and are non-empty strings
   g. On any exception or validation failure: run fallback, log a warning
3. Move the existing `mission_map` and fallback logic from `main.py` into
   this module as a private `_fallback(req)` function

**Relevant Context**
- Current mock in [`src/ai-service/main.py`](src/ai-service/main.py) lines 111–128
- `PersonalizeLearningRequest` and `PersonalizeLearningResponse` Pydantic models
  are already defined in `main.py` (lines 34–44) — import them from there,
  or move them to a shared `models.py` if preferred
- AGENTS.md: "Keep each Bob prompt/context small and scoped to the entity in
  question — never dump the whole mock dataset into a prompt"
- AGENTS.md: "If Bob lacks data to answer, say so explicitly — never invent facts"
  (the fallback satisfies this for the MVP: we say deterministic logic was used)

**Status:** [ ] pending

---

### Sub-Task 4 — Wire into `main.py`

**Intent**
Replace the mock function body with a single delegation call to
`mentor_service`, keeping the route signature and response model unchanged.

**Expected Outcomes**
- `POST /personalize-learning` in `main.py` now calls
  `mentor_service.get_personalized_recommendation(req)` and returns its result
- The `import random` and mission-map logic is removed from `main.py`
  (moved to the service in Sub-Task 3)
- The route docstring is updated to reflect the real Bob call
- No other routes in `main.py` are touched

**Todo List**
1. Add `from services.mentor_service import get_personalized_recommendation`
   at the top of `main.py`.
2. Replace the body of `personalize_learning()` with:
   `return get_personalized_recommendation(req)`
3. Remove `import random` if it is no longer used elsewhere.
4. Update the route docstring from "Mock AI personalization engine" to
   "Calls IBM Bob to generate personalized learning recommendations.
    Falls back to deterministic logic if Bob is unavailable."

**Relevant Context**
- [`src/ai-service/main.py`](src/ai-service/main.py) lines 105–128
- The `response_model=PersonalizeLearningResponse` decorator stays unchanged

**Status:** [ ] pending

---

### Sub-Task 5 — Tests

**Intent**
Verify the two critical paths — successful Bob response and graceful fallback —
without requiring real IBM credentials in CI.

**Expected Outcomes**
- `src/ai-service/tests/test_mentor_service.py` contains two tests:
  1. **`test_bob_success`** — patches `ModelInference` to return a well-formed
     JSON string; asserts the four fields are correctly parsed into the response
  2. **`test_bob_fallback_on_bad_json`** — patches `ModelInference` to raise
     an exception; asserts the fallback returns a valid `PersonalizeLearningResponse`
     with the weakest-topic logic (deterministic result, not an error)
- Tests run with `pytest` and no live network calls

**Todo List**
1. Create `src/ai-service/tests/__init__.py` (empty).
2. Write `src/ai-service/tests/test_mentor_service.py`:
   - Use `unittest.mock.patch` to stub `ibm_watsonx_ai.ModelInference`
   - Build a minimal `PersonalizeLearningRequest` fixture with two topic scores
   - Assert test 1: returned object has `recommended_topic == "Water Conservation"`
     (or whatever the mock JSON says)
   - Assert test 2: returned object is a `PersonalizeLearningResponse` instance
     with `recommended_topic` equal to the topic with the lower score in the fixture

**Relevant Context**
- AGENTS.md: "Add focused tests for the new ai-service endpoints"
- Do NOT write an integration test that calls the real Bob API

**Status:** [ ] pending

---

## Execution Order

```
Sub-Task 1 (deps) → Sub-Task 2 (env vars) → Sub-Task 3 (mentor_service)
  → Sub-Task 4 (wire main.py) → Sub-Task 5 (tests)
```

Sub-Tasks 1 and 2 are independent and can be done in the same commit.
Sub-Task 3 must finish before Sub-Task 4.
Sub-Task 5 can be written in parallel with Sub-Task 4 but must pass after both.

## Non-Goals (explicitly out of scope)

- `/verify-image` — not touched
- `/health` — not touched
- Any frontend file
- Adding a real database or auth
- Changing the JSON field names visible to the frontend
