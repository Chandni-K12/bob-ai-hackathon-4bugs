# 🚀 GenGreen — Gamified Environmental Education Platform

---

## 👥 Team

| Field | Value |
|---|---|
| **Team Name** | 4 Bugs |
| **Track** | Sustainability |
| **Team Lead** | Hima Mehta — mehtahima1510@gmail.com |
| **Members** | Kairavi Padhariya, Akshara Pandya, Chandni Kothari |

---

## 🎯 Problem Statement

>   Environmental education in Indian schools and higher-education institutions remains 
    largely theoretical and textbook-driven, creating a gap between environmental 
    awareness and the ability of students to apply this knowledge through sustainable, 
    real-world actions. Despite NEP 2020's emphasis on environmental awareness, 
    sustainability, and experiential learning, students lack engaging and practical 
    ways to understand local environmental challenges, recognize the impact of their 
    everyday choices, and develop lasting sustainable habits.

---

## 💡 Solution

>   GenGreen gamifies environmental learning through a learn -> play -> complete
    missions -> AI verify -> earn points -> compete loop, with IBM Bob as the
    reasoning layer across three touchpoints: personalizing each student's next
    topic/mission, explaining and sanity-checking mission evidence submissions
    alongside a deterministic match check, and turning a teacher's class data into
    a short prioritized action list.
---

## ✨ Key Features

- **Feature 1:** "IBM Bob-powered AI Eco Mentor that recommends a student's next topic and mission with a data-grounded reason"
- **Feature 2:** "Deterministic mission-evidence verification with an IBM Bob-generated plain-language explanation and a needs_teacher_review flag for borderline cases"
- **Feature 3:** "IBM Bob-generated teacher class insights: a short, honest, prioritized action list built from real class performance data"
- **Feature 4:** "Scenario-based quizzes and an Eco Crossword game for active learning, not passive reading"
- **Feature 5:** "Role-based dashboards (student/teacher/organizer) with real-time-style leaderboards, badges, streaks and Green Score"

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | JavaScript, Python |
| **Frontend** | React, Vite, Tailwind CSS, Radix UI, Framer Motion, Recharts, React Router, Axios, Leaflet |
| **Backend** | Express.js, Socket.io, JSON Web Tokens |
| **AI Layer** | FastAPI, IBM Bob |

---

## 📁 Repository Structure

```
bob-ai-hackathon-4bugs/
├── src/
│   ├── client/                  # React + Vite frontend application
│   │   ├── src/
│   │   │   ├── pages/           # Role-based dashboards & interactive learning pages
│   │   │   │   ├── student/     # Dashboard, Missions, Quizzes, Crossword, AI Mentor
│   │   │   │   ├── teacher/     # Class overview, Student progress, Bob AI Insights
│   │   │   │   └── organizer/   # School-wide metrics, campaign management
│   │   │   ├── services/        # Axios API clients (Express backend + AI service)
│   │   │   ├── context/         # Auth and global state management
│   │   │   ├── data/            # Curriculum datasets, quizzes, crosswords, missions
│   │   │   └── layouts/         # Responsive layout wrappers and navigation
│   │   ├── package.json
│   │   └── vite.config.js
│   ├── server/                  # Node.js + Express backend REST API
│   │   ├── server.js            # Auth, student progress, tasks, leaderboards
│   │   └── package.json
│   └── ai-service/              # FastAPI Python service powered by IBM Bob
│       ├── main.py              # REST endpoints for image verification & recommendations
│       ├── bob_service.py       # IBM Bob integration layer & prompt reasoning engine
│       ├── services/            # Supporting AI services & fallback logic
│       └── requirements.txt
├── docs/                        # Comprehensive documentation
│   ├── problem-statement.md     # Detailed background & problem definition
│   ├── solution-overview.md     # Solution narrative & feature breakdown
│   ├── architecture.md          # Component architecture, data flow & security
│   └── setup-guide.md           # Step-by-step local setup instructions
├── demo/                        # Demonstration materials
│   ├── screenshots/             # Application UI walkthrough screenshots
│   ├── demo-video-link.txt      # Video walkthrough link
│   └── live-demo-url.txt        # Deployment URL
├── presentation/                # Pitch deck and presentation slides
├── submission.yaml              # Hackathon evaluation metadata
└── README.md                    # Project overview & guide

```

---

## ⚡ How to Run

```bash
# 1. Clone the repo
git clone https://github.com/<your-org>/bob-ai-hackathon-gengreen.git
cd bob-ai-hackathon-gengreen/src

# 2. Install dependencies
cd client && npm install && cd ../server && npm install && cd ../ai-service && pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Fill in WATSONX_API_KEY, WATSONX_PROJECT_ID, BOB_API_KEY, BOB_API_ENDPOINT

# 4. Run the project
cd ai-service && uvicorn main:app --reload --port 8000
cd server && node server.js
cd client && npm run dev
```
---

## 🖥️ Demo

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | [See demo/live-demo-url.txt](demo/live-demo-url.txt) |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/slides.pdf](presentation/) |

---

## ⚠️ Known Limitations

- Gamification may not guarantee long-term behavioral change.
- Limited offline functionality.
- Different regional environmental challenges: Environmental priorities differ across India.
- Different student interests and motivation levels.
- Integration with existing school/college ERP systems, Learning Management Systems, student IDs, and institutional databases would be required for large-scale adoption.

---

## 🏅 What We're Most Proud Of

1. **Genuinely Load-Bearing IBM Bob AI Integration**:
   Rather than treating AI as a generic chatbot gimmick, IBM Bob acts as an intelligent reasoning engine across three core pillars:
   - **Personalized Eco Mentor**: Recommends the student's next mission or quiz with grounded, data-backed rationale tailored to their past progress.
   - **Evidence Verification & Explainability**: Pairs deterministic, auditable image heuristics with IBM Bob's natural language feedback for students and teachers, with automatic flagging (`needs_teacher_review`) for borderline cases.
   - **Teacher Class Insights**: Transforms raw student metrics into a concise, prioritized action list for educators to target learning gaps effectively.

2. **Closing the "Knowing vs. Doing" Gap (NEP 2020 Aligned)**:
   We built a complete experiential loop (**Learn → Play → Real-world Mission → AI Verification → Earn Points → Compete**) that takes students out of textbooks into active community sustainability.

3. **Robust Multi-Role Experience**:
   A unified, beautifully designed application serving students with gamified missions & interactive puzzles, teachers with class analytics & task management, and school organizers with campus-wide sustainability metrics.
   
---
