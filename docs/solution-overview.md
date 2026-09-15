# Solution Overview

## Core Mechanism

GenGreen works by chaining three steps — learn, act, verify — and placing IBM Bob at
each of the three points where a deterministic rule alone is insufficient.

### Student Journey

A student opens
the platform and lands on a dashboard showing their Green Score, streak, and badges. From
there they can visit the **Learn** page (topic-based lessons covering, for example, Climate
Change, Waste Management, and Water Conservation), play a scenario-based **Quiz** or the
**Eco Crossword** game, and then navigate to **Missions** to complete a real-world task.

### Evidence Verification

Every mission (tree plantation, waste segregation, water
conservation, clean campus, or
green transport) requires photographic evidence. When the student submits a photo, the
client first converts the file to a base64 data-URL and sends it — along with the file
name, size, and mission type — to the FastAPI AI service's `/verify-image` endpoint.
The AI service validates the image format, penalises suspiciously small files (under 5 KB),
and computes a mission-matched confidence score using per-mission bands (e.g. 0.88–0.97
for tree plantation). That deterministic result — the `verified` boolean, detected objects,
and confidence score — is then passed unchanged to `bob_service.explain_verification`,
which calls IBM Bob (`ibm/granite-3-8b-instruct` via direct HTTP POST to the
watsonx.ai inference endpoint) to produce two separate plain-English explanations: a 1–2
sentence student-facing message and a 2–3 sentence technical note for the teacher review
panel. Critically, the `verified` boolean is computed before Bob is invoked and is
explicitly never modified by Bob's response — Bob is the language layer, not the decision
layer. Submissions whose confidence falls in the borderline band 0.70–0.80 have
`needs_teacher_review` set to `true`, routing them to the teacher's **Verification** page
for manual approval or rejection alongside the AI-generated technical note.

### Teacher Insights

The teacher can visit the **Insights** page, which calls `/class-insights/{class_id}`.
The endpoint fetches aggregate class data from the Express server (topic average scores, pending
verification count, participation trend — never individual student names), evaluates
whether the data is usable, and if so sends a compact JSON context to IBM Bob, asking it to
return up to three prioritised action objects (`priority`, `title`, `reason`,
`recommended_action`). A structural constraint is enforced in code: if
`pending_verification_count > 0` but Bob returns no high-priority action, the response is
rejected and the endpoint returns `data_status="unavailable"` rather than silently surfacing
misleading output.

### Personalisation and Support

A third Bob call, `/personalize-learning`, accepts a student's topic
scores, completed lessons, and mission activity and asks Bob to recommend the next topic,
an associated mission, and a learning style. The AI Eco Mentor chat page (`/chat`) also
calls Bob to answer free-form student questions, with a keyword-based fallback covering
waste, water, energy, and climate topics when Bob is unavailable. The organizer role has
its own **Competitions** and **Analytics** pages for managing and monitoring inter-school
events, but these pages do not call Bob.

## What Makes It Different from a Naive Alternative

A naive alternative — a quiz app that awards points for correct answers — cannot detect
that a student submitted a screenshot of their notes instead of a photo of a planted tree,
and it gives no teacher any prioritised next step derived from real class performance data.
GenGreen's verification pipeline is layered: the client runs Canvas API colour-sampling as
a local fallback (classifying green/brown/blue/outdoor pixel ratios against per-mission
rules) if the AI service is unreachable, the AI service applies file-level heuristics and
per-mission confidence bands as a deterministic layer, and Bob adds the human-readable
explanation that lets both the student and the teacher act on the result. The
student-teacher-organizer role split is structural: three separate page trees under
`pages/student/`, `pages/teacher/`, and `pages/organizer/` mean each actor sees only the
interface relevant to them. The teacher's insight list is not a generic dashboard — it is
Bob's prioritised action list constrained by the actual class numbers, with a hard code
check that forces at least one `high` priority action whenever pending submissions exist.

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Deterministic `verified` computed before calling Bob | Prevents the language model from being the source of truth on pass/fail; Bob cannot accidentally inflate confidence or change an outcome. Stated explicitly in `bob_service.py` docstring: "The deterministic `verified` bool is passed IN and must never be altered here." |
| Per-mission confidence bands rather than a single threshold | Each mission type has a realistic range (e.g. clean campus 0.90–0.98 vs. green transport 0.83–0.94), making the system feel appropriately calibrated per activity. The rationale for the specific widths is not documented — this is an inference from the `_confidence_bands` dict in `main.py`. |
| Canvas colour-sampling as client-side fallback | Ensures the verification flow still works when the AI service is down, without requiring any server round-trip. Screenshot detection (`dark > 45%` and `outdoor < 15%`) provides a meaningful signal to reject obvious gaming attempts. |
| `insight_service` fetches only aggregate data, never individual student names | Stated in `insight_service.py`: "Never fetches individual student records." This limits what is sent to Bob and avoids sending personally identifiable student data to the model. |
| Every Bob call has a rule-based fallback that never fabricates output | All three services (`bob_service`, `mentor_service`, `insight_service`) return a deterministic fallback — not an error — when `BOB_API_KEY` is absent or the call fails, so the frontend always receives a structurally valid response. |

## IBM Technologies Used

- **IBM Bob (`ibm/granite-3-8b-instruct`):** Used across three endpoints via direct HTTP
  POST to the watsonx.ai text generation API (`/ml/v1/text/generation?version=2023-05-29`).
  Each call sends a structured prompt and parses the JSON object in Bob's reply:
  - `bob_service.explain_verification` — produces student and teacher explanation text
    for every mission evidence submission.
  - `mentor_service.get_personalized_recommendation` — recommends the next topic, matched
    mission, and learning style for an individual student based on their score profile.
  - `insight_service.get_class_insights` — turns aggregate class data into a
    prioritised action list for the teacher.
  - `chat_service.get_chat_reply` — answers free-form student questions about
    environmental topics within the AI Eco Mentor interface.
