import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.scamshield import router as scamshield_router, model_service

app = FastAPI(
    title="TakaSafe ScamShield Real-Time ML Service",
    description="Low-latency pre-payment scam & fraud inference engine powered by XGBoost",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scamshield_router)

@app.on_event("startup")
def startup_event():
    print("=" * 60)
    print("🚀 Initializing TakaSafe ScamShield ML Backend...")
    print(f"📁 Expected Model Path: {model_service.model_path}")
    if model_service.is_loaded:
        print(f"✅ XGBoost model loaded successfully ({model_service.model_type})")
        print("⚡ In-memory inference engine ready for instant predictions")
    else:
        print(f"⚠️ Model NOT loaded: {model_service.load_error}")
        print("💡 Place your exported XGBoost model in ./ml/model/scamshield_xgb.json")
    print("=" * 60)

@app.get("/")
def root():
    return {
        "service": "TakaSafe ScamShield ML Backend",
        "status": "ONLINE",
        "docs": "/docs",
        "health": "/api/scamshield/health"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
