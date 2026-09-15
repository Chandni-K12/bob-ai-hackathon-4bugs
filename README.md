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
├── src/                  # All source code
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt  # Link to demo video
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
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

[Tell the judges what part of your submission is strongest and worth paying close attention to.]

---
