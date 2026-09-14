from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

import bob_service

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

@app.post("/personalize-learning", response_model=PersonalizeLearningResponse)
def personalize_learning(req: PersonalizeLearningRequest):
    """
    Mock AI personalization engine.
    In production: analyzes student data -> generates personalized recommendations.
    """
    # Find weakest topic
    weakest = min(req.topic_scores, key=lambda x: x.score) if req.topic_scores else TopicScore(topic="Water Conservation", score=58)

    mission_map = {
        "Water Conservation": "Water Guardian",
        "Waste Management": "Waste Segregation Champion",
        "Climate Change": "Carbon Footprint Tracker",
        "Biodiversity": "Biodiversity Explorer",
        "Renewable Energy": "Energy Audit",
        "Pollution": "Clean Air Challenge",
    }

    return PersonalizeLearningResponse(
        recommended_topic=weakest.topic,
        reason=f"You scored {weakest.score}% in recent {weakest.topic} scenarios. Focus on this topic to improve your Green Score.",
        recommended_mission=mission_map.get(weakest.topic, "Eco Explorer"),
        learning_style="scenario-based",
    )

@app.get("/health")
def health():
    return {"status": "healthy", "model": "YOLO-mock-v1", "ready": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
