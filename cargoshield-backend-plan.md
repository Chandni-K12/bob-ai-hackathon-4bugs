# CargoShield AI — Backend Foundation & Disruption Engine Plan

## Overview

Build the FastAPI backend MVP for CargoShield AI covering:
- Application bootstrap and CORS wiring
- CSV data loading via Pandas (shipments and disruptions)
- Pydantic response models for Shipment and Disruption
- A `disruption_service` that detects which shipments are affected by active disruptions
- REST API endpoints consumed by the React frontend
- Focused pytest suite for the service layer

**Scope boundary:** Only the backend foundation and disruption impact engine.
No authentication, no database, no microservices.
Do not touch any frontend files.

**Tech stack (from AGENTS.md):** Python · FastAPI · Pandas · CSV data

---

## Directory Layout (target state)

```
src/backend/
  requirements.txt
  app/
    main.py                  ← FastAPI app, CORS, router registration
    models/
      shipment.py            ← Pydantic Shipment model
      disruption.py          ← Pydantic Disruption model
    services/
      data_loader.py         ← CSV loading helpers (Pandas)
      disruption_service.py  ← Affected-shipment detection logic
    routers/
      shipments.py           ← /api/shipments endpoints
      disruptions.py         ← /api/disruptions endpoints
    data/
      shipments.csv          ← Sample shipment data
      disruptions.csv        ← Sample disruption data
  tests/
    test_disruption_service.py
    test_data_loader.py
```

---

## Sub-Tasks

---

### Sub-Task 1 — Project Bootstrap

**Intent**
Establish the runnable FastAPI application with all top-level wiring so every
subsequent sub-task has a working shell to plug into.

**Expected Outcomes**
- `requirements.txt` lists `fastapi`, `uvicorn[standard]`, `pandas`, `pytest`, `httpx`
- `app/main.py` creates the FastAPI app, registers CORS (allow all origins for dev),
  and mounts the two routers under `/api`
- Running `uvicorn app.main:app --reload` from `src/backend/` starts without errors
  and `GET /` returns `{"status": "ok"}`

**Todo List**
1. Populate `requirements.txt` with the five dependencies above (no version pins needed for MVP).
2. Write `app/main.py`:
   - Create `app = FastAPI(title="CargoShield AI")`
   - Add `CORSMiddleware` with `allow_origins=["*"]`
   - Add a `GET /` health-check route returning `{"status": "ok"}`
   - Import and include the two routers (stubs are fine at this stage)

**Relevant Context**
- [`src/backend/app/main.py`](src/backend/app/main.py) — currently empty
- [`src/backend/requirements.txt`](src/backend/requirements.txt) — currently empty
- AGENTS.md: "Do not add authentication unless required"

**Status:** [ ] pending

---

### Sub-Task 2 — CSV Sample Data

**Intent**
Provide realistic sample CSV files so the data-loading and service layers have
concrete data to work with during development and tests.

**Expected Outcomes**
- `app/data/shipments.csv` exists with ≥ 8 rows covering columns:
  `shipment_id, origin, destination, carrier, route, status, eta`
- `app/data/disruptions.csv` exists with ≥ 4 rows covering columns:
  `disruption_id, type, affected_region, severity, active, description`
- At least two shipments share a route/region that overlaps with an active disruption
  so the detection logic has something to find
- Region values (e.g. "Rotterdam") must match exactly — string-equality approach confirmed

**Todo List**
1. Create `app/data/shipments.csv` with the columns listed above.
   Use statuses: `in_transit`, `delayed`, `delivered`.
2. Create `app/data/disruptions.csv` with the columns listed above.
   Use types: `port_closure`, `weather`, `strike`, `customs_hold`.
   Mark at least two rows `active=true`, at least one `active=false`.

**Relevant Context**
- AGENTS.md: "CSV files for MVP"
- The `affected_region` field in disruptions must match the string values used
  in shipment `origin` or `destination` so the detection join works simply.

**Status:** [ ] pending

---

### Sub-Task 3 — Pydantic Models

**Intent**
Define the response-model schema that both the service layer and API routers
use for serialisation and documentation.

**Expected Outcomes**
- `app/models/shipment.py` exports a `Shipment` Pydantic BaseModel with fields
  matching the CSV columns: `shipment_id`, `origin`, `destination`, `carrier`,
  `route`, `status`, `eta`
- `app/models/disruption.py` exports a `Disruption` Pydantic BaseModel with
  fields: `disruption_id`, `type`, `affected_region`, `severity`, `active`,
  `description`
- Both models use only standard Python types (str, bool); no optional complexity

**Todo List**
1. Create `app/models/__init__.py` (empty).
2. Write `app/models/shipment.py` — `class Shipment(BaseModel)` with the seven fields.
3. Write `app/models/disruption.py` — `class Disruption(BaseModel)` with the six fields.

**Relevant Context**
- Keep models flat — no nested objects needed for MVP
- `active` in `Disruption` is `bool`; Pandas will read it as a string from CSV,
  so the loader must coerce it

**Status:** [ ] pending

---

### Sub-Task 4 — Data Loader

**Intent**
Centralise all CSV I/O in one module so every service reads data the same way
and tests can easily swap paths.

**Expected Outcomes**
- `app/services/data_loader.py` exports:
  - `load_shipments(path: str | None) -> list[Shipment]`
  - `load_disruptions(path: str | None) -> list[Disruption]`
- Both functions default to the bundled `app/data/*.csv` paths when `path` is `None`
- `active` column is coerced from string `"true"/"false"` to Python `bool`
- Tests in `tests/test_data_loader.py` verify that the bundled CSVs load without
  error and return the correct types

**Todo List**
1. Create `app/services/__init__.py` (empty).
2. Write `app/services/data_loader.py`:
   - Use `pandas.read_csv`; convert each row to the Pydantic model via `model(**row)`
   - Resolve default paths relative to `__file__` so the app works from any cwd
   - Coerce `active` with `.map({"true": True, "false": False})`
3. Write `tests/test_data_loader.py`:
   - Test `load_shipments()` returns a non-empty list of `Shipment` instances
   - Test `load_disruptions()` returns a non-empty list of `Disruption` instances

**Relevant Context**
- `app/data/` created in Sub-Task 2
- `app/models/` created in Sub-Task 3
- Data is loaded **once at module level** via a module-level variable (e.g.
  `_shipments = None`). A private `_load()` helper populates it on first call.
  No extra dependencies needed.

**Status:** [ ] pending

---

### Sub-Task 5 — Disruption Service

**Intent**
Implement the deterministic business rule that answers: "which shipments are
currently affected by an active disruption?"

**Expected Outcomes**
- `app/services/disruption_service.py` exports:
  - `get_active_disruptions() -> list[Disruption]`
  - `get_affected_shipments() -> list[dict]`  
    Each dict contains the shipment fields plus `disruption_id` and `disruption_type`
    showing which disruption is affecting it
- The matching rule is: a shipment is affected when its `origin` OR `destination`
  equals the `affected_region` of any active disruption
- Tests in `tests/test_disruption_service.py` verify:
  - A shipment whose origin matches an active disruption's region appears in results
  - A shipment with no matching region does not appear
  - Inactive disruptions do not cause matches

**Todo List**
1. Write `app/services/disruption_service.py`:
   - Call `load_shipments()` and `load_disruptions()` from `data_loader`
   - Filter disruptions to `active == True`
   - For each active disruption, collect shipments where `origin == affected_region`
     or `destination == affected_region`
   - Return enriched dicts (shipment fields + disruption metadata)
2. Write `tests/test_disruption_service.py`:
   - Build in-memory fixture data (do not rely on CSV files)
   - Patch `load_shipments` and `load_disruptions` with `unittest.mock.patch`
   - Assert the three test conditions listed above

**Relevant Context**
- Matching is string equality (case-sensitive); normalise to lowercase on load if needed
- Keep logic free of Pandas — work with lists of Pydantic model instances
- AGENTS.md: "Use deterministic algorithms for calculations"

**Status:** [ ] pending

---

### Sub-Task 6 — API Routers

**Intent**
Expose the service layer through HTTP endpoints that the React frontend will call.

**Expected Outcomes**
- `GET /api/shipments` — returns all shipments as JSON array
- `GET /api/disruptions` — returns all disruptions as JSON array
- `GET /api/disruptions/active` — returns only active disruptions
- `GET /api/disruptions/affected-shipments` — returns affected-shipment list
  from `disruption_service.get_affected_shipments()`
- All routes return proper HTTP 200 with `application/json`
- FastAPI auto-docs at `/docs` shows all four routes

**Todo List**
1. Create `app/routers/__init__.py` (empty).
2. Write `app/routers/shipments.py`:
   - `router = APIRouter(prefix="/shipments", tags=["shipments"])`
   - `GET /` → `load_shipments()`
3. Write `app/routers/disruptions.py`:
   - `router = APIRouter(prefix="/disruptions", tags=["disruptions"])`
   - `GET /` → `load_disruptions()`
   - `GET /active` → `get_active_disruptions()`
   - `GET /affected-shipments` → `get_affected_shipments()`
4. Register both routers in `app/main.py` under prefix `/api`

**Relevant Context**
- Import from `services.data_loader` and `services.disruption_service`
- Response models: use `list[Shipment]` or `list[dict]` as return type annotations
- No query-param filtering needed for MVP

**Status:** [ ] pending

---

### Sub-Task 7 — Integration Smoke Tests

**Intent**
Verify the full request path (router → service → loader → CSV) works end-to-end
using FastAPI's TestClient so no live server is needed.

**Expected Outcomes**
- `tests/test_api.py` contains smoke tests for all four endpoints
- Each test asserts HTTP 200 and that the response body is a JSON array
- All tests pass with `pytest tests/` from `src/backend/`

**Todo List**
1. Create `tests/__init__.py` (empty) and `tests/conftest.py` with a `client`
   fixture using `from fastapi.testclient import TestClient`.
2. Write `tests/test_api.py`:
   - `test_get_shipments` — GET `/api/shipments` → 200, list
   - `test_get_disruptions` — GET `/api/disruptions` → 200, list
   - `test_get_active_disruptions` — GET `/api/disruptions/active` → 200, list
   - `test_get_affected_shipments` — GET `/api/disruptions/affected-shipments` → 200, list

**Relevant Context**
- `httpx` is already in `requirements.txt` (required by TestClient async mode)
- Tests read the real bundled CSV files — no mocking needed here
- AGENTS.md: "Add focused tests for important backend services"

**Status:** [ ] pending

---

## Execution Order

```
Sub-Task 1 (bootstrap) → Sub-Task 2 (CSV data) → Sub-Task 3 (models)
  → Sub-Task 4 (data loader) → Sub-Task 5 (disruption service)
  → Sub-Task 6 (routers) → Sub-Task 7 (smoke tests)
```

Each sub-task depends on the one before it. Process them one at a time and
update the Status field to `[x] done` before starting the next.
