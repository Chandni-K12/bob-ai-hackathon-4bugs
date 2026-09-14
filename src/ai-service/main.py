from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

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
