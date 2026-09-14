# 🌿 GenGreen — Gamified Environmental Education Platform

> **"Learn it. Play it. Do it. Prove it. Earn it."**

A production-oriented prototype for Smart India Hackathon (SIH) 2026. GenGreen transforms environmental education from passive textbook learning into an interactive, gamified experience for schools and colleges across India.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| **Charts** | Recharts |
| **Maps** | Leaflet + OpenStreetMap |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **AI Service** | Python + FastAPI (YOLO/Vision mock) |
| **Real-Time** | Socket.IO |
| **Auth** | JWT + bcrypt |
| **Image Storage** | Cloudinary |

## 📦 Project Structure

```
SIH/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       │   ├── auth/       # Login with role selection
│       │   ├── student/    # 9 student pages
│       │   ├── teacher/    # 5 teacher pages
│       │   └── organizer/  # 3 organizer pages
│       ├── layouts/        # Role-based layouts
│       ├── context/        # Auth, Socket contexts
│       ├── services/       # API service layer
│       └── data/           # Mock data
├── server/          # Node.js + Express backend
│   └── server.js    # REST API + Socket.IO
└── ai-service/      # Python FastAPI AI service
    └── main.py      # /verify-image + /personalize-learning
```

## 👤 User Roles

### 🎓 Student
- Learn environmental topics (9 topics)
- Scenario-based quizzes
- Eco Crossword game
- Complete missions & upload evidence
- AI-assisted verification
- Earn Eco Points & maintain streaks
- Unlock badges & compete on leaderboards

### 👩‍🏫 Teacher
- Monitor student performance
- Assign syllabus-wise environmental tasks
- Review AI-verified submissions
- View AI-generated class insights
- Grade students

### 👩‍💼 Organizer
- Platform-wide analytics
- Create & manage competitions
- Monitor school participation
- View environmental impact data

## 🏃‍♂️ Quick Start

### Frontend
```bash
cd client
npm install
npm run dev        # → http://localhost:5173
```

### Backend
```bash
cd server
npm install
npm start          # → http://localhost:5000
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
python main.py     # → http://localhost:8000
```

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Student | `ananya@student.eco` | `demo123` |
| Teacher | `meera@teacher.eco` | `demo123` |
| Organizer | `lakshmi@organizer.eco` | `demo123` |

## 🎮 Key Features

- **Scenario-Based Quizzes** — Real-world environmental situations, not traditional MCQs
- **Eco Crossword** — Interactive vocabulary game with environmental terms
- **AI Eco Mentor** — Personalized learning recommendations based on student data
- **AI Verification** — YOLO-based evidence verification for environmental missions
- **Green League** — Class, school, and competition leaderboards
- **Green Score** — Holistic scoring beyond raw points (Learning + Missions + Verified Actions + Participation)
- **Real-Time Updates** — Socket.IO-powered live leaderboards and notifications
- **Gamification** — Eco Points, badges, streaks, level-ups with Framer Motion animations

## 📱 Responsive Design

- **Student** → Mobile-first
- **Teacher** → Desktop/tablet optimized
- **Organizer** → Desktop dashboard optimized

## 📄 License

Built for Smart India Hackathon 2026.
