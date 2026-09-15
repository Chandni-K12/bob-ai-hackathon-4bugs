# Setup Guide — GenGreen

> **This file is read by the automated evaluation pipeline. Be precise and complete.**

## Prerequisites

Before you begin, ensure you have the following installed:

- [ ] [Node.js 18+](https://nodejs.org/) — for the React client and Express server
- [ ] [Python 3.11+](https://www.python.org/) — for the FastAPI AI service
- [ ] [MongoDB](https://www.mongodb.com/try/download/community) — local instance **or** a MongoDB Atlas connection string
- [ ] An IBM Bob API key — create one at [bob.ibm.com](https://bob.ibm.com) → API Keys → Inference
- [ ] A watsonx.ai Project ID — find it at bob.ibm.com → Subscription → Settings

---

## Repository Structure

```
bob-ai-hackathon-4bugs/
├── src/
│   ├── client/          # React + Vite + TypeScript frontend (port 5173)
│   ├── server/          # Node.js + Express REST API (port 5000)
│   └── ai-service/      # FastAPI AI service powered by IBM Bob (port 8000)
├── docs/
└── README.md
```

---

## Environment Variables

A single `.env.example` file lives at `src/.env.example`. Copy it and fill in the values:

```bash
cp src/.env.example src/.env
```

Each service reads from `src/.env` (or its own sub-directory `.env`). The relevant variables are:

| Variable | Description | Required |
|---|---|---|
| `VITE_API_URL` | Express API base URL seen by the browser (default `/api`) | Yes |
| `VITE_AI_URL` | AI-service base URL seen by the browser (default `http://localhost:8000`) | Yes |
| `PORT` | Express server port (default `5000`) | No |
| `MONGODB_URI` | MongoDB connection string (default `mongodb://localhost:27017/gengreen`) | Yes |
| `JWT_SECRET` | Secret used to sign JSON Web Tokens | Yes |
| `BOB_API_KEY` | IBM Bob inference API key | Yes |
| `BOB_API_ENDPOINT` | watsonx.ai endpoint (default `https://us-south.ml.cloud.ibm.com`) | Yes |
| `WATSONX_PROJECT_ID` | Your watsonx.ai project ID | Yes |
| `WATSONX_MODEL_ID` | Model override (default `ibm/granite-3-8b-instruct`) | No |
| `SERVER_BASE_URL` | Express server URL used by the AI service (default `http://localhost:5000`) | No |

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/bob-ai-hackathon-4bugs.git
cd bob-ai-hackathon-4bugs
```

### 2. Configure environment variables

```bash
cp src/.env.example src/.env
# Open src/.env and fill in MONGODB_URI, JWT_SECRET, BOB_API_KEY, WATSONX_PROJECT_ID
```

### 3. Install frontend dependencies

```bash
cd src/client
npm install
```

### 4. Install server dependencies

```bash
cd src/server
npm install
```

### 5. Install AI-service dependencies

```bash
cd src/ai-service
pip install -r requirements.txt
```

---

## Running the Application

Open **three separate terminals** from the repository root:

**Terminal 1 — AI service (FastAPI, port 8000)**
```bash
cd src/ai-service
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Express server (Node.js, port 5000)**
```bash
cd src/server
node server.js
```

**Terminal 3 — React client (Vite, port 5173)**
```bash
cd src/client
npm run dev
```

The application will be available at: `http://localhost:5173`

- Express REST API: `http://localhost:5000`
- FastAPI AI service docs (Swagger): `http://localhost:8000/docs`

---

## Running Tests

### AI-service tests (pytest)

```bash
cd src/ai-service
pytest tests/ -v
```

Tests mock the IBM Bob API so **no live API key is required** to run them.

### Backend tests (pytest)

```bash
cd src/backend
pytest tests/ -v
```

---

## Quick Demo

```bash
# After all three services are running, open the app
open http://localhost:5173        # macOS
start http://localhost:5173       # Windows
```

Demo materials:

- 📹 Video walkthrough: [`demo/demo-video-link.txt`](../demo/demo-video-link.txt)
- 🌐 Live deployment: [`demo/live-demo-url.txt`](../demo/live-demo-url.txt)
- 🖼️ Screenshots: [`demo/screenshots/`](../demo/screenshots/)

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `ModuleNotFoundError` in AI service | Run `pip install -r src/ai-service/requirements.txt` again |
| `Cannot connect to MongoDB` | Ensure MongoDB is running locally or update `MONGODB_URI` in `src/.env` |
| `401 Unauthorized` from watsonx.ai | Check `BOB_API_KEY` and `WATSONX_PROJECT_ID` in `src/.env` |
| Vite dev server CORS errors | Confirm `VITE_API_URL` points to the correct Express port |
| `uvicorn: command not found` | Activate your Python virtual environment or install with `pip install uvicorn` |
| Express server crashes on start | Confirm `MONGODB_URI` and `JWT_SECRET` are set in `src/.env` |
