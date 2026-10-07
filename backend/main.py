import os
import time
import uvicorn
from collections import defaultdict, deque
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.api.scamshield import router as scamshield_router, model_service
from backend.api.demo import router as demo_router
from backend.services.demo_state import demo_state

app = FastAPI(
    title="TakaSafe ScamShield Real-Time ML Service",
    description="Low-latency pre-payment scam & fraud inference engine powered by XGBoost",
    version="1.0.0"
)

# The deployed frontend is configured with VITE_API_BASE_URL.  Keep origins
# explicit: this demo does not use credentialed cross-origin browser requests.
default_origins = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,https://takasafe-diu.surge.sh"
allowed_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", default_origins).split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Last-Event-ID"],
)

app.state.demo_state = demo_state
app.state.model_service = model_service

# Small in-process limiter for the public demo. It deliberately has no Redis or
# external state; each process maintains a bounded, one-minute request window.
request_windows = defaultdict(deque)

@app.middleware("http")
async def add_security_controls(request: Request, call_next):
    client = request.client.host if request.client else "unknown"
    now = time.monotonic()
    window = request_windows[client]
    while window and now - window[0] > 60:
        window.popleft()
    if request.url.path.startswith("/api/") and request.url.path not in {"/api/health", "/api/events"}:
        if len(window) >= 120:
            return JSONResponse({"detail": "Demo API rate limit exceeded. Try again shortly."}, status_code=429)
        window.append(now)

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cache-Control"] = "no-store" if request.url.path.startswith("/api/") else response.headers.get("Cache-Control", "")
    return response

app.include_router(demo_router)
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
        "storage_mode": "Database-Free Demo",
        "data_source": "Synthetic JSON + Runtime Memory",
        "authentication": "Demo Authentication",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
