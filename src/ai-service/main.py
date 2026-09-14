from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

from services.mentor_service import get_personalized_recommendation
from services.insight_service import get_class_insights

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

class TopicPerformance(BaseModel):
    topic: str
    avg_score: float

class PendingVerification(BaseModel):
    student_name: str
    mission_title: str

class ParticipationEntry(BaseModel):
    name: str
    points: int

class ClassInsightsRequest(BaseModel):
    topic_performance: List[TopicPerformance]
    pending_verifications: List[PendingVerification]
    participation_top3: List[ParticipationEntry]

class ClassInsightsResponse(BaseModel):
    class_id: str
    actions: List[str]
    insufficient_data: bool

# --- Routes ---

@app.get("/")
def root():
    return {"service": "GenGreen AI Service", "status": "running", "version": "1.0.0"}

@app.post("/verify-image", response_model=VerifyImageResponse)
def verify_image(req: VerifyImageRequest):
    """
    Mock YOLO/Vision model verification.
    In production: receives image URL -> runs through YOLO -> returns detection results.
    """
    mission_responses = {
        "tree_plantation": {
            "detected_objects": ["Tree sapling", "Soil", "Gardening tools"],
            "message": "Tree plantation activity detected",
            "confidence": 0.94,
        },
        "waste_segregation": {
            "detected_objects": ["Paper → Dry Waste", "Plastic → Dry Waste", "Organic Waste → Wet Waste"],
            "message": "Waste segregation detected with proper categorization",
            "confidence": 0.91,
            "segregation": {
                "dry_waste": ["Paper", "Plastic", "Cardboard"],
                "wet_waste": ["Food waste", "Organic matter"],
                "quality_score": 91,
            },
        },
        "water_conservation": {
            "detected_objects": ["Water meter", "Low-flow faucet", "Collection system"],
            "message": "Water conservation setup detected",
            "confidence": 0.87,
        },
        "clean_campus": {
            "detected_objects": ["Group activity", "Cleaning supplies", "Campus area"],
            "message": "Campus cleaning activity detected",
            "confidence": 0.96,
        },
        "green_transport": {
            "detected_objects": ["Bicycle", "Walking path"],
            "message": "Green transport activity detected",
            "confidence": 0.89,
        },
    }

    response_data = mission_responses.get(req.mission_type, {
        "detected_objects": ["Environmental activity"],
        "message": "Environmental activity detected",
        "confidence": round(random.uniform(0.75, 0.98), 2),
    })

    return VerifyImageResponse(
        verified=response_data["confidence"] > 0.7,
        confidence=response_data["confidence"],
        detected_objects=response_data["detected_objects"],
        message=response_data["message"],
        segregation=response_data.get("segregation"),
    )

@app.post("/class-insights/{class_id}", response_model=ClassInsightsResponse)
def class_insights(class_id: str, req: ClassInsightsRequest):
    """
    Calls IBM Bob to generate a prioritised action list for a teacher, scoped to one class.
    If Bob is unavailable or returns unparseable output, returns a clear
    'insights unavailable' response — never fabricates actions.
    """
    from types import SimpleNamespace
    scoped = SimpleNamespace(
        class_id=class_id,
        topic_performance=req.topic_performance,
        pending_verifications=req.pending_verifications,
        participation_top3=req.participation_top3,
    )
    return ClassInsightsResponse(**get_class_insights(scoped))


@app.post("/personalize-learning", response_model=PersonalizeLearningResponse)
def personalize_learning(req: PersonalizeLearningRequest):
    """
    Calls IBM Bob (watsonx.ai) to generate personalised learning recommendations.
    If Bob is unavailable or returns unparseable output, returns a clear
    'unable to personalise right now' response — never fabricates a recommendation.
    """
    return PersonalizeLearningResponse(**get_personalized_recommendation(req))

@app.get("/health")
def health():
    return {"status": "healthy", "model": "YOLO-mock-v1", "ready": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
