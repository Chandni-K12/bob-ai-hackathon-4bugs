"""
main.py — FastAPI application entry point for CargoShield AI.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import disruptions, shipments

app = FastAPI(
    title="CargoShield AI",
    description="Supply-chain disruption and fleet-utilisation assistant",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api prefix
app.include_router(shipments.router, prefix="/api")
app.include_router(disruptions.router, prefix="/api")


@app.get("/health", tags=["health"])
def health():
    """Health check endpoint."""
    return {"status": "ok"}
