from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

import bob_service
from services.mentor_service import get_personalized_recommendation
from services.insight_service import get_class_insights
from services.chat_service import get_chat_reply

app = FastAPI(title="GenGreen AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class VerifyImageRequest(BaseModel):
    image_url: str
    mission_type: str

class VerifyImageResponse(BaseModel):
    verified: bool
    confidence: float
    detected_objects: List[str]
    message: str
    segregation: Optional[dict] = None
    # Bob-generated explanation fields (None when Bob is unavailable)
    student_explanation: Optional[str] = None
    teacher_explanation: Optional[str] = None
    needs_teacher_review: bool = False

class TopicScore(BaseModel):
    topic: str
    score: float

class PersonalizeLearningRequest(BaseModel):
    student_id: str
    topic_scores: List[TopicScore]
    completed_lessons: List[str]
    mission_activity: List[str]

class PersonalizeLearningResponse(BaseModel):
    recommended_topic: str
    reason: str
    recommended_mission: str
    learning_style: str

class ActionItem(BaseModel):
    priority: str
    title: str
    reason: str
    recommended_action: str

class ClassInsightsResponse(BaseModel):
    class_id: str
    actions: List[ActionItem]
    data_status: str  # "sufficient" | "insufficient" | "unavailable"

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# --- Routes ---

@app.get("/")
def root():
    return {"service": "GenGreen AI Service", "status": "running", "version": "1.0.0"}

@app.post("/verify-image", response_model=VerifyImageResponse)
def verify_image(req: VerifyImageRequest):
    """
    Deterministic mission verification with IBM Bob explanation layer.

    Step 1 — deterministic: map mission_type to expected objects + confidence.
              The verified/confidence result is authoritative and is NOT changed
              by Bob.
    Step 2 — Bob: send the structured result to IBM Bob and ask for human-
              readable explanations for the student and the teacher.
              message is populated from the Bob student_explanation (or fallback).
              needs_teacher_review is set for borderline confidence (0.70–0.80).
    """
    mission_responses = {
        "tree_plantation": {
            "detected_objects": ["Tree sapling", "Soil", "Gardening tools"],
            "confidence": 0.94,
        },
        "waste_segregation": {
            "detected_objects": ["Paper → Dry Waste", "Plastic → Dry Waste", "Organic Waste → Wet Waste"],
            "confidence": 0.91,
            "segregation": {
                "dry_waste": ["Paper", "Plastic", "Cardboard"],
                "wet_waste": ["Food waste", "Organic matter"],
                "quality_score": 91,
            },
        },
        "water_conservation": {
            "detected_objects": ["Water meter", "Low-flow faucet", "Collection system"],
            "confidence": 0.87,
        },
        "clean_campus": {
            "detected_objects": ["Group activity", "Cleaning supplies", "Campus area"],
            "confidence": 0.96,
        },
        "green_transport": {
            "detected_objects": ["Bicycle", "Walking path"],
            "confidence": 0.89,
        },
    }

    response_data = mission_responses.get(req.mission_type, {
        "detected_objects": ["Environmental activity"],
        "confidence": round(random.uniform(0.75, 0.98), 2),
    })

    # --- Step 1: deterministic result ---
    confidence = response_data["confidence"]
    detected_objects = response_data["detected_objects"]
    verified = confidence > 0.7
    segregation = response_data.get("segregation")

    # --- Step 2: Bob explanation layer ---
    bob_result = bob_service.explain_verification(
        mission_type=req.mission_type,
        detected_objects=detected_objects,
        confidence=confidence,
        verified=verified,
        segregation=segregation,
    )

    # message now comes from Bob (student_explanation); fallback kept in bob_service
    message = bob_result["student_explanation"]

    return VerifyImageResponse(
        verified=verified,
        confidence=confidence,
        detected_objects=detected_objects,
        message=message,
        segregation=segregation,
        student_explanation=bob_result["student_explanation"],
        teacher_explanation=bob_result["teacher_explanation"],
        needs_teacher_review=bob_result["needs_teacher_review"],
    )

@app.get("/class-insights/{class_id}", response_model=ClassInsightsResponse)
def class_insights(class_id: str):
    """
    Fetches aggregate class data from the Express server, calls IBM Bob, and
    returns up to 3 prioritised structured actions for the teacher.
    The frontend sends only a class_id — never raw student data.
    data_status is "sufficient", "insufficient" (unknown class / sparse data),
    or "unavailable" (Bob credentials missing / network error).
    """
    return ClassInsightsResponse(**get_class_insights(class_id))


@app.post("/personalize-learning", response_model=PersonalizeLearningResponse)
def personalize_learning(req: PersonalizeLearningRequest):
    """
    Calls IBM Bob (watsonx.ai) to generate personalised learning recommendations.
    If Bob is unavailable or returns unparseable output, returns a clear
    'unable to personalise right now' response — never fabricates a recommendation.
    """
    return PersonalizeLearningResponse(**get_personalized_recommendation(req))

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """
    Calls IBM Bob to answer student questions in real-time.
    """
    return ChatResponse(reply=get_chat_reply(req.message))

@app.get("/health")
def health():
    return {"status": "healthy", "model": "YOLO-mock-v1", "ready": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
