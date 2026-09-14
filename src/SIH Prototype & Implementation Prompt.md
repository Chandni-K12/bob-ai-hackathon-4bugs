# SIH Prototype & Implementation Prompt
## Gamified Environmental Education Platform for Schools and Colleges

Build a **high-fidelity, responsive, production-oriented web application prototype** for a Smart India Hackathon project titled:

# “Gamified Environmental Education Platform for Schools and Colleges”

The platform transforms environmental education from passive textbook learning into an interactive experience based on:

**LEARN → PLAY → COMPLETE MISSIONS → AI VERIFY → EARN POINTS → COMPETE → IMPROVE**

The application must be designed so that the prototype architecture can directly evolve into the final SIH implementation.

---

# 1. FINAL TECHNOLOGY STACK — MUST FOLLOW

Use the following finalized technology stack.

### Frontend

- React
- Vite
- JavaScript/TypeScript as appropriate

### Styling

- Tailwind CSS

### UI Components

- shadcn/ui

Use reusable components from shadcn/ui wherever applicable.

### Animations

- Framer Motion

Use animations for:

- Gamification
- Badge unlocking
- Level-up
- Streaks
- Points
- Leaderboard changes
- Page transitions
- Achievement notifications

### Charts / Analytics

- Recharts

Use Recharts for:

- Student performance
- Class analytics
- School analytics
- Competition analytics
- Topic-wise performance
- Mission completion

### Maps

- Leaflet
- OpenStreetMap

Use maps for location-based environmental activities and evidence verification.

### Backend

- Node.js
- Express.js

The backend should expose REST APIs for the frontend.

### Database

- MongoDB
- Mongoose

Use MongoDB for:

- Users
- Schools
- Classes
- Topics
- Lessons
- Quizzes
- Missions
- Submissions
- Eco Points
- Streaks
- Badges
- Competitions
- Leaderboards
- Performance records

### Authentication

- JWT
- bcrypt

Implement role-based authentication for:

- Student
- Teacher
- Organizer

### Image Storage

- Cloudinary

Use Cloudinary for student-uploaded:

- Mission evidence
- Environmental activity photographs
- Verification images

### AI Service

- Python
- FastAPI

The Python FastAPI service will handle AI-related functionality.

### AI / Computer Vision

- YOLO or another appropriate pretrained computer vision model

Use it for AI-assisted verification of environmental activities.

Example:

- Tree plantation
- Waste segregation
- Clean-up activities
- Environmental evidence

### Real-Time Communication

- Socket.IO

Use Socket.IO for:

- Live leaderboards
- Real-time points updates
- Competition updates
- Notifications
- Achievement notifications

### Deployment

- Vercel for frontend
- Render or Railway for backend/services

### Version Control

- Git
- GitHub

Structure the project so it is GitHub-ready and suitable for team collaboration.

---

# 2. IMPORTANT ARCHITECTURE REQUIREMENT

Do NOT build the application as a static UI-only mockup.

Create a frontend architecture that is ready to communicate with:

```text
React + Vite
      ↓
Node.js + Express.js REST API
      ↓
MongoDB + Mongoose
      ↓
Python FastAPI AI Service
      ↓
YOLO / Pretrained Vision Model
```

For real-time functionality:

```text
Node.js + Socket.IO
        ↓
Live Leaderboards
Notifications
Competition Updates
Points Updates
```

For image evidence:

```text
Student
   ↓
React
   ↓
Express API
   ↓
Cloudinary
   ↓
Image URL
   ↓
FastAPI AI Service
   ↓
YOLO / Vision Model
   ↓
Verification Result
   ↓
MongoDB
```

The prototype may use realistic mock AI responses where a real model is not available, but maintain the same API structure that the actual implementation will use.

---

# 3. USER ROLES

Create three role-based experiences.

## Student

Students:

- Learn environmental topics
- Complete lessons
- Attempt scenario-based quizzes
- Play Eco Crossword
- Receive AI-personalized learning recommendations
- Complete environmental missions
- Upload evidence
- Receive AI-assisted verification
- Earn Eco Points
- Maintain weekly streaks
- Unlock badges
- Compete with classmates
- Compete with other schools

## Teacher

Teachers:

- Manage classes
- Allocate syllabus-wise tasks
- Monitor student performance
- Grade students
- Review mission submissions
- Approve/reject AI-assisted verification
- View AI-generated class insights
- Monitor class rankings

## Organizer

Organizers:

- Manage schools
- Manage competitions
- Create environmental missions
- Monitor participation
- View school/class analytics
- Manage leaderboards
- Monitor platform-wide environmental activity

---

# 4. AUTHENTICATION

Create a role-selection login screen.

Options:

**Student Login**

**Teacher Login**

**Organizer Login**

Use JWT-based authentication.

Passwords should be represented as bcrypt-hashed credentials in the backend architecture.

After authentication:

```text
Student → Student Dashboard
Teacher → Teacher Dashboard
Organizer → Organizer Dashboard
```

Implement route protection and role-based access control.

---

# 5. STUDENT DASHBOARD

Create a visually engaging, mobile-first student dashboard.

The dashboard should feel like a combination of:

- Learning platform
- Environmental game
- Personal progress tracker
- Competition platform

Top navigation:

- Dashboard
- Learn
- Quizzes
- Eco Crossword
- Missions
- AI Eco Mentor
- Leaderboard
- Badges
- Profile

Dashboard header:

Student avatar

**Ananya Sharma**

Class: 8-A

School: Green Valley School

---

## Dashboard Metrics

Create attractive cards:

### Eco Points

**2,450**

+180 this week

### Weekly Streak

**🔥 5 Days**

Display:

Mon ✓  
Tue ✓  
Wed ✓  
Thu ✓  
Fri ✓  
Sat ○  
Sun ○

### Class Rank

**#7**

### School Rank

**#24**

---

# 6. STUDENT MISSION SECTION

Create mission cards.

Example:

## Plastic-Free Week

Progress:

**4 / 7 days**

Reward:

**+100 Eco Points**

Button:

**Continue Mission**

Other missions:

- Water Saver
- Waste Segregation Champion
- Green Transport
- Biodiversity Explorer
- Tree Plantation
- Clean Campus

Each mission should show:

- Difficulty
- Reward
- Progress
- Deadline
- Verification requirement

---

# 7. LEARNING MODULE

Create a dedicated **Learn** page.

Environmental topics:

- Climate Change
- Waste Management
- Water Conservation
- Biodiversity
- Renewable Energy
- Pollution
- Sustainable Lifestyle
- Forest & Wildlife
- Environmental Protection

Each topic card should show:

- Topic name
- Progress
- Difficulty
- Estimated learning time
- Completed lessons
- Quiz availability
- Eco Points

Example:

## Waste Management

Progress:

**72%**

Lessons:

**6 / 8**

Quiz:

**Unlocked**

Reward:

**+100 Points**

Button:

**Continue Learning**

---

# 8. SCENARIO-BASED QUIZ

The quiz must NOT feel like a traditional examination system.

Use realistic environmental situations.

Example:

### Scenario

“You are walking through your school campus during lunch break. You notice food waste, plastic bottles and paper being placed in the same bin.”

Question:

**What would be the most sustainable action?**

Provide four plausible options.

After selection:

- Show correctness
- Explain the answer
- Show points earned
- Update progress
- Show next scenario

Use scenarios involving:

- Water wastage
- Electricity usage
- Plastic waste
- Waste segregation
- Public transport
- Tree plantation
- Food waste
- Biodiversity
- Sustainable lifestyle

---

# 9. ECO CROSSWORD

Create a special quiz mode:

# Eco Crossword

Create an interactive crossword grid.

Environmental vocabulary:

- RECYCLING
- BIODIVERSITY
- ECOSYSTEM
- SOLAR
- COMPOST
- CLIMATE
- FOREST

Display:

- Crossword grid
- Clues
- Timer
- Score
- Correct answers
- Completion percentage
- Bonus points

Example clue:

“The variety of living organisms in an ecosystem.”

Answer:

**BIODIVERSITY**

Use Framer Motion for subtle completion animations.

---

# 10. AI PERSONALIZED LEARNING

Create:

# AI Eco Mentor

This is NOT a generic chatbot.

The AI recommendation engine should use student learning data:

- Quiz performance
- Topic accuracy
- Weak topics
- Strong topics
- Lesson completion
- Mission activity
- Learning frequency

Example:

### Your Personalized Learning Path

**Needs Improvement**

Water Conservation

**Good**

Waste Management

**Strong**

Renewable Energy

Recommended next lesson:

### “Water Conservation: Save Every Drop”

Reason:

“You scored 58% in recent Water Conservation scenarios.”

Button:

**Start Recommended Lesson**

Also show:

### AI Recommendation

“You learn best through scenario-based activities. Try the Water Guardian mission next.”

The frontend should be designed so recommendations can later come from the backend/AI service rather than being hardcoded.

---

# 11. AI VERIFICATION SYSTEM

Create a complete evidence verification flow.

Example mission:

# Plant a Tree

Student selects:

**Submit Evidence**

Upload interface:

- Upload photograph
- Capture photograph
- Location
- Date/time

Use Cloudinary for image storage.

After submission:

```text
Image
 ↓
Cloudinary
 ↓
FastAPI
 ↓
YOLO / Vision Model
 ↓
Verification
```

Display:

# AI Verification

✓ Activity detected

✓ Evidence received

✓ Image appears relevant

### Verification Confidence

**94%**

Status:

**AI Verified — Awaiting Teacher Approval**

Teacher can then:

**Approve**

or

**Reject**

---

# 12. WASTE SEGREGATION AI EXAMPLE

Create another AI verification demonstration.

Mission:

# Waste Segregation

Student uploads an image.

AI analysis displays:

**Detected Items**

Paper → Dry Waste

Plastic → Dry Waste

Organic Waste → Wet Waste

Display:

### Segregation Quality

**91%**

Then:

**+75 Eco Points**

Important:

The UI must describe this as:

**AI-Assisted Verification**

Teacher review remains available for required submissions.

---

# 13. MAP / LOCATION FEATURE

Use:

**Leaflet + OpenStreetMap**

Create a location interface for environmental missions.

Example:

### Mission Location

Show map with:

- Student activity location
- School location
- Mission location

For the prototype, use sample coordinates.

Show:

**Activity submitted from school campus**

Do not expose unnecessary precise student location information in public leaderboards.

---

# 14. GAMIFICATION

Create a complete gamification system.

## Eco Points

Points can be earned through:

- Lessons
- Scenario quizzes
- Crossword
- Missions
- Verified environmental activities
- Competitions

## Badges

Create:

🌱 Eco Starter

♻️ Waste Warrior

💧 Water Guardian

🌳 Green Champion

🌍 Climate Hero

🔥 7-Day Streak

🏆 Eco Master

Use animated badge unlocks with Framer Motion.

---

# 15. GREEN LEAGUE

Create the main competition system.

# Green League

Competition levels:

## Class

Example:

1. Aarav — 2,450
2. Priya — 2,210
3. Riya — 1,980

## School

Example:

1. Green Valley School — 82,450
2. Sunrise School — 78,320
3. ABC Public School — 71,900

## Competition

Example:

### Inter-School Green Challenge 2026

Show:

- Participating schools
- Rankings
- Eco Points
- Missions completed
- Students participating
- Competition progress

---

# 16. GREEN SCORE

Do not make competition based only on raw points.

Display:

### Green Score

Calculate conceptually from:

- Learning Score
- Mission Score
- Verified Action Score
- Participation Score

Display these components separately.

Example:

Learning Score: 84

Mission Score: 91

Verified Action Score: 88

Participation: 95

Overall Green Score:

**89.5**

---

# 17. REAL-TIME LEADERBOARD

Use:

**Socket.IO**

When points change:

```text
Student completes mission
        ↓
Points awarded
        ↓
MongoDB updated
        ↓
Socket.IO event
        ↓
Leaderboard updates live
```

Prototype behavior should simulate this.

Example:

“Ananya moved from #8 → #7”

Show a subtle leaderboard animation.

---

# 18. STUDENT PROFILE

Create:

# Eco Profile

Display:

Student Name

Level 12

Eco Points: 2,450

Class Rank: #7

School Rank: #24

Weekly Streak: 5 days

Badges: 12

Completed Missions: 28

Quiz Accuracy: 84%

Learning Progress: 76%

Create:

### Eco Journey

```text
Lessons
   ↓
Quizzes
   ↓
Missions
   ↓
AI Verification
   ↓
Rewards
   ↓
Competition
```

---

# 19. TEACHER DASHBOARD

Create a professional teacher dashboard.

Top metrics:

### Total Students

120

### Active Students

94

### Average Performance

78%

### Pending Reviews

8

### Tasks Assigned

24

Use Recharts for analytics.

---

# 20. SYLLABUS-WISE TASK ALLOCATION

Create:

# Assign Environmental Task

Teacher selects:

- Class
- Subject/Syllabus Topic
- Environmental Topic
- Task Type
- Difficulty
- Deadline
- Points

Example:

Class:

**8-A**

Syllabus Topic:

**Water Resources**

Environmental Topic:

**Water Conservation**

Task:

**Water Conservation Scenario Quiz**

Deadline:

**25 August**

Reward:

**100 Eco Points**

Button:

**Assign Task**

Task states:

- Assigned
- In Progress
- Completed
- Overdue

---

# 21. TEACHER PERFORMANCE GRADING

Create a student performance table.

| Student | Quiz Score | Missions | Streak | Eco Points | Performance |
|---|---:|---:|---:|---:|---|
| Aarav | 92% | 12 | 7 days | 2450 | Excellent |
| Priya | 84% | 10 | 5 days | 2210 | Good |
| Riya | 61% | 6 | 2 days | 1450 | Needs Improvement |

Create Recharts visualizations for:

- Topic-wise performance
- Weekly participation
- Quiz accuracy
- Mission completion
- Class progress

Filters:

- Student
- Class
- Topic
- Performance

---

# 22. TEACHER VERIFICATION PANEL

Create:

# Pending AI Verifications

Example:

Student:

**Ananya Sharma**

Mission:

**Plant a Tree**

AI Confidence:

**94%**

Evidence:

Image preview

Location:

School Campus

Status:

**Awaiting Teacher Approval**

Buttons:

**Approve**

**Reject**

**View Evidence**

---

# 23. AI CLASS INSIGHTS

Create:

# AI Class Insights

Example:

“Students are performing well in Renewable Energy but struggling with Waste Management.”

“23% of students have not completed the Water Conservation task.”

“Scenario-based questions have a higher completion rate than standard questions.”

Recommended Action:

**Assign Waste Segregation Mission to Class 8-A**

The UI should clearly communicate that these are **AI-generated insights based on student performance data**.

---

# 24. ORGANIZER DASHBOARD

Create a high-level administrative dashboard.

Metrics:

- Total Schools
- Total Students
- Total Teachers
- Active Competitions
- Missions Completed
- Eco Points Generated
- Verified Actions

Example:

**128 Schools**

**42,850 Students**

**2,340 Teachers**

**16 Active Competitions**

Use Recharts for platform analytics.

---

# 25. ORGANIZER COMPETITION MANAGEMENT

Create:

# Competition Management

Organizer can:

- Create competition
- Select participating schools
- Set start date
- Set end date
- Define rules
- Define scoring
- Create missions
- View leaderboard
- Monitor participation

Example:

### National Green Campus Challenge 2026

Start:

01 September

End:

30 September

Participants:

84 Schools

Status:

Active

---

# 26. ORGANIZER ANALYTICS

Create charts for:

- School-wise participation
- Class-wise performance
- Topic-wise learning
- Competition rankings
- Mission completion
- Weekly active users
- Verified environmental activities

Filters:

- State
- District
- School
- Class
- Topic
- Competition

Use Recharts.

---

# 27. NOTIFICATION SYSTEM

Use Socket.IO for real-time notifications.

Examples:

### Student

“🎉 You earned 100 Eco Points!”

“🏆 You moved to #7 in your class!”

“🔥 Your 5-day streak is active!”

### Teacher

“8 new submissions require review.”

### Organizer

“Green Valley School moved to #2.”

---

# 28. FRONTEND COMPONENT ARCHITECTURE

Use reusable React components.

Suggested structure:

```text
src/
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── gamification/
│   ├── quiz/
│   ├── crossword/
│   ├── missions/
│   ├── verification/
│   ├── leaderboard/
│   ├── analytics/
│   └── maps/
│
├── pages/
│   ├── student/
│   ├── teacher/
│   └── organizer/
│
├── layouts/
├── hooks/
├── services/
├── api/
├── utils/
└── routes/
```

Use shadcn/ui components wherever possible.

---

# 29. BACKEND ARCHITECTURE

Use:

**Node.js + Express.js**

Suggested structure:

```text
server/
├── controllers/
├── routes/
├── models/
├── middleware/
├── services/
├── sockets/
├── utils/
└── config/
```

Create REST API concepts for:

```text
/auth
/users
/schools
/classes
/topics
/lessons
/quizzes
/missions
/submissions
/verification
/points
/streaks
/badges
/leaderboards
/competitions
/analytics
```

Use Mongoose models for MongoDB.

---

# 30. DATABASE ENTITIES

Design MongoDB schemas for:

### User

```text
name
email
password
role
schoolId
classId
points
streak
badges
```

### School

```text
name
location
district
state
students
teachers
greenScore
```

### Topic

```text
name
description
syllabusMapping
difficulty
```

### Quiz

```text
topicId
questions
difficulty
points
```

### Mission

```text
title
description
topic
difficulty
points
deadline
verificationRequired
```

### Submission

```text
studentId
missionId
imageUrl
location
timestamp
aiVerification
teacherApproval
status
pointsAwarded
```

### Competition

```text
name
startDate
endDate
participatingSchools
rules
scoring
status
```

---

# 31. AI SERVICE ARCHITECTURE

Create a separate Python FastAPI service.

Suggested structure:

```text
ai-service/
├── main.py
├── routes/
├── models/
├── services/
│   ├── verification.py
│   └── personalization.py
├── vision/
└── utils/
```

Expose conceptual endpoints:

```text
POST /verify-image

POST /personalize-learning
```

### /verify-image

Input:

- Image URL
- Mission type

Output:

```json
{
  "verified": true,
  "confidence": 0.94,
  "detectedObjects": [],
  "message": "Environmental activity detected"
}
```

### /personalize-learning

Input:

- Student performance
- Topic scores
- Completed lessons
- Mission activity

Output:

```json
{
  "recommendedTopic": "Water Conservation",
  "reason": "Low performance in recent scenarios",
  "recommendedMission": "Water Guardian"
}
```

For the prototype, mocked AI responses are acceptable, but preserve these API boundaries.

---

# 32. CLOUDINARY IMAGE FLOW

For environmental evidence:

```text
Student
 ↓
React upload
 ↓
Express API
 ↓
Cloudinary
 ↓
Cloudinary image URL
 ↓
FastAPI verification
 ↓
YOLO model
 ↓
Verification result
 ↓
MongoDB
```

Show upload progress and verification status in the UI.

---

# 33. REAL-TIME SOCKET FLOW

Use Socket.IO.

Example:

```text
Mission Completed
       ↓
Eco Points Updated
       ↓
MongoDB
       ↓
Socket.IO
       ↓
Leaderboard
       ↓
Student UI updates
```

Also use it for:

- Competition updates
- Notifications
- Badge unlocks
- Rank changes

---

# 34. RESPONSIVE DESIGN

Student:

**Mobile-first**

Teacher:

**Desktop/tablet optimized**

Organizer:

**Desktop dashboard optimized**

The application must remain usable on:

- Mobile
- Tablet
- Laptop
- Desktop

---

# 35. VISUAL DESIGN

Use a modern environmental visual identity.

Primary feeling:

**Nature + Technology + Gamification + Education**

Use:

- Nature-inspired colors
- Green as the primary accent
- Neutral backgrounds
- Rounded cards
- Clean typography
- Soft gradients
- Subtle shadows
- Progress indicators
- Badge illustrations
- Charts
- Friendly icons

Do not make every element green.

Avoid making the platform look like a generic school LMS.

The student interface should feel energetic and game-like.

The teacher interface should feel professional.

The organizer interface should feel analytical and administrative.

---

# 36. ANIMATIONS

Use Framer Motion.

Animations should include:

### Points

When points increase:

**+100 Eco Points**

with a small animated counter.

### Badge

When unlocked:

Badge reveal animation.

### Streak

Animated streak indicator.

### Leaderboard

Smooth rank movement.

### Mission

Progress animation.

### Level Up

A polished level-up modal.

Animations must remain subtle and performant.

---

# 37. DEMO DATA

Use realistic mock data.

Create at least:

- 10 students
- 3 classes
- 3 schools
- 8 environmental topics
- 10 missions
- 5 competitions
- Multiple quiz questions
- Multiple mission submissions

Example student:

**Ananya Sharma**

Class:

8-A

School:

Green Valley School

Eco Points:

2,450

Weekly Streak:

5 days

Rank:

#7

Quiz Accuracy:

84%

Missions:

28 completed

Badges:

12

---

# 38. CRITICAL SIH DEMO FLOW

The prototype MUST make this flow possible:

```text
Student Login
      ↓
Student Dashboard
      ↓
AI Personalized Recommendation
      ↓
Open Environmental Topic
      ↓
Learn
      ↓
Scenario-Based Quiz
      ↓
Earn Eco Points
      ↓
Eco Crossword
      ↓
Mission
      ↓
Upload Evidence
      ↓
Cloudinary
      ↓
AI Verification
      ↓
Teacher Approval
      ↓
Points Added
      ↓
Badge Unlocked
      ↓
Streak Updated
      ↓
Class Leaderboard Updated
      ↓
School Leaderboard Updated
```

Then demonstrate:

```text
Teacher Login
      ↓
Teacher Dashboard
      ↓
View Student Performance
      ↓
Assign Syllabus-Wise Task
      ↓
Review AI Verification
      ↓
Approve Submission
      ↓
Grade Student
      ↓
View AI Class Insights
```

Then:

```text
Organizer Login
      ↓
Organizer Dashboard
      ↓
View Schools
      ↓
Create Competition
      ↓
Monitor Participation
      ↓
View Leaderboard
      ↓
View Analytics
```

---

# 39. CORE PRODUCT IDENTITY

The entire application should communicate:

# “Learn it. Play it. Do it. Prove it. Earn it.”

The product should NOT feel like:

**Education + Quiz + Leaderboard**

Instead it must communicate:

**Environmental Learning**

+

**Scenario-Based Assessment**

+

**AI Personalization**

+

**Real-World Missions**

+

**AI-Assisted Verification**

+

**Gamification**

+

**Class & School Competition**

---

# 40. FINAL PROTOTYPE REQUIREMENT

Build this as a **SIH-ready, production-oriented prototype**, not a collection of disconnected static screens.

All major interactions should work within the prototype.

Where backend/AI infrastructure is not yet connected, use realistic mock data while keeping the frontend interfaces and API boundaries compatible with:

**React + Vite → Express → MongoDB**

and

**Express → FastAPI → YOLO**

Use:

**Cloudinary** for evidence images,

**Socket.IO** for real-time updates,

**Leaflet + OpenStreetMap** for maps,

**Recharts** for analytics,

**shadcn/ui + Tailwind CSS** for UI,

and

**Framer Motion** for gamification animations.

The final prototype should look like a product that can realistically be implemented using the finalized SIH technology stack.