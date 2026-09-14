# verify-image Bob-explanation Layer — Implementation Plan

## Overview

**Goal:** The `/verify-image` FastAPI endpoint already makes a deterministic
pass/fail decision (confidence threshold + expected-objects match per
`mission_type`). This plan layers IBM Bob on top of that decision to:

1. Produce a human-readable explanation of *why* the image passed or failed,
   targeted separately at students and teachers.
2. Flag borderline/ambiguous cases (`needs_review: true`) so the teacher queue
   can highlight them for manual inspection instead of hard auto-approving.
3. Return all of this as new fields on the existing `VerifyImageResponse`,
   keeping the existing API shape and existing frontend untouched.

**What stays the same:**
- The deterministic `verified` bool and `confidence` float are computed exactly
  as today and are NOT changed by Bob.
- The frontend (`VerificationPage.jsx`, `MissionsPage.jsx`) is not modified.
- The existing `VerifyImageResponse` fields are not removed or renamed.

**What changes:**
- `VerifyImageResponse` gains three new *optional* fields:
  `student_explanation`, `teacher_explanation`, `needs_review`.
- A new `bob_service.py` module in `ai-service/` encapsulates all IBM Bob calls.
- `requirements.txt` gains the IBM Bob client library.
- Focused tests are added for the new behaviour.

---

## Sub-Task 1 — Add IBM Bob client to ai-service

**Status:** `[ ] pending`

**Intent:**
Install and configure the IBM Bob Python client so the rest of the ai-service
can call Bob. Keep credentials in environment variables (consistent with
`.env.example` patterns already in the project).

**Expected Outcomes:**
- `ibm-generative-ai` (or equivalent Bob client package) added to
  `src/ai-service/requirements.txt`.
- A `.env.example` entry for `BOB_API_KEY` (and `BOB_API_ENDPOINT` if needed).
- No functional change to any existing endpoint.

**Todo List:**
1. Confirm the exact PyPI package name for the IBM Bob Python client by checking
   `requirements.txt` patterns in the project and IBM documentation.
2. Add the package (pinned version) to `src/ai-service/requirements.txt`.
3. Add `BOB_API_KEY` (and optionally `BOB_API_ENDPOINT`) to `src/.env.example`.

**Relevant Context:**
- `src/ai-service/requirements.txt` — currently: `fastapi`, `uvicorn`, `pydantic`.
- `src/.env.example` — credential pattern to follow.

---

## Sub-Task 2 — Create `bob_service.py` with `explain_verification` function

**Status:** `[ ] pending`

**Intent:**
Encapsulate the IBM Bob call in a dedicated module so `main.py` stays clean.
The function receives the structured deterministic result and returns the two
explanations plus the `needs_review` flag. It must never replace or override
the `verified` decision.

**Expected Outcomes:**
- `src/ai-service/bob_service.py` exists with a single public async function
  `explain_verification(mission_type, detected_objects, confidence, verified,
  segregation)` that returns a `dict` with keys
  `student_explanation`, `teacher_explanation`, `needs_review`.
- If Bob is unavailable or the call fails, the function returns safe fallback
  strings (never raises to the caller).
- The prompt sent to Bob is small and scoped: only mission type, detected
  objects, confidence score, and pass/fail result — never any other student or
  class data.
- Borderline rule: `needs_review` is set `True` when `0.70 <= confidence <=
  0.80` (ambiguous zone just above the pass threshold), regardless of what Bob
  says — Bob's explanation acknowledges the ambiguity in that case.

**Todo List:**
1. Create `src/ai-service/bob_service.py`.
2. Import and initialise the Bob client using `BOB_API_KEY` from env
   (gracefully handle missing key: log a warning, return fallback strings).
3. Write a compact prompt template that includes:
   - Mission type and expected objects for that mission.
   - Detected objects and confidence score from the deterministic step.
   - The pass/fail verdict.
   - Instruction to generate: (a) a 1-2 sentence student-friendly explanation,
     (b) a 2-3 sentence teacher-facing technical note, (c) whether the case is
     ambiguous.
4. Parse Bob's response into the three fields.
5. Add a fallback that constructs plain-English strings from the deterministic
   data alone, used whenever Bob is unavailable.

**Relevant Context:**
- Deterministic logic lives at `src/ai-service/main.py` lines 58-103.
- The `mission_responses` dict defines expected objects per `mission_type` —
  the prompt should reference these to explain what was expected vs. found.
- `AGENTS.md` rule: "If Bob lacks data to answer, say so explicitly — never
  invent facts."

---

## Sub-Task 3 — Wire `bob_service` into the `/verify-image` endpoint

**Status:** `[ ] pending`

**Intent:**
Call `explain_verification` from `verify_image()` after the deterministic
result is computed, and surface the three new fields in the response.

**Expected Outcomes:**
- `VerifyImageResponse` has three new *optional* fields:
  `student_explanation: Optional[str]`, `teacher_explanation: Optional[str]`,
  `needs_review: Optional[bool]` (default `False`).
- The existing `verified`, `confidence`, `detected_objects`, `message`,
  `segregation` fields are untouched.
- The endpoint remains synchronous or is converted to `async def` if required
  by the Bob client — no other behaviour changes.
- When Bob is unavailable the endpoint still returns a valid response (with
  fallback explanations).

**Todo List:**
1. Extend `VerifyImageResponse` in `main.py` with the three new optional fields.
2. After the existing deterministic block, `await explain_verification(...)`
   (or call synchronously if the Bob client is sync).
3. Pass `bob_result` values into the `VerifyImageResponse` constructor.
4. Ensure `verify_image` is declared `async def` if Bob calls are async.

**Relevant Context:**
- `src/ai-service/main.py` lines 52-103 — the endpoint to modify.
- `VerifyImageResponse` Pydantic model at line 23 — extend here.

---

## Sub-Task 4 — Add focused tests for the new behaviour

**Status:** `[ ] pending`

**Intent:**
Verify that (a) the deterministic verdict is unaffected by Bob, (b) the three
new fields are present in the response, and (c) the borderline flag logic is
correct — all without requiring a live Bob connection.

**Expected Outcomes:**
- `src/ai-service/tests/test_verify_image.py` exists and passes with
  `pytest` (or the project's existing test runner).
- Tests use a mock/patch for `bob_service.explain_verification` so they run
  offline.
- At minimum, three test cases:
  1. High-confidence known mission → `verified=True`, `needs_review=False`,
     explanations populated.
  2. Borderline confidence (0.75) → `verified=True`, `needs_review=True`,
     teacher explanation flags ambiguity.
  3. Bob call raises an exception → response still returns valid fallback
     explanations, `verified` unchanged.

**Todo List:**
1. Create `src/ai-service/tests/__init__.py` and
   `src/ai-service/tests/test_verify_image.py`.
2. Use `pytest` + `unittest.mock.patch` to mock `bob_service.explain_verification`.
3. Use FastAPI `TestClient` to POST to `/verify-image` and assert response shape.
4. Add `pytest` and `httpx` to `requirements.txt` under a `[test]` comment
   (or a separate `requirements-test.txt`).

**Relevant Context:**
- `src/ai-service/main.py` — the app instance to test.
- `src/ai-service/requirements.txt` — add test deps here.

---

## Constraints & Non-Goals

- **Do not modify** `client/src/pages/teacher/VerificationPage.jsx` or
  `client/src/pages/student/MissionsPage.jsx`.
- **Do not modify** `src/server/server.js` — the Express mock layer is
  unchanged; the new fields flow directly from the ai-service.
- **Do not add a real database** — all data remains in-memory mock.
- The deterministic `verified` bool must be computed before Bob is called and
  must not be altered by Bob's response.
- Keep each Bob prompt small and scoped (per `AGENTS.md`).
- If `BOB_API_KEY` is absent from the environment, the service must still start
  and respond (fallback mode).
