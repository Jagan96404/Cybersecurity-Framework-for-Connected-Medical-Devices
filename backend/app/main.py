import asyncio
import os
import json
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api import auth, devices, patients, threats, incidents, sbom, simulation
from app.models import MedicalDevice, DeviceTelemetry
from app.simulator.device_simulator import device_simulator

# Create tables
Base.metadata.create_all(bind=engine)

# Connection Manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
        for dc in dead_connections:
            self.disconnect(dc)

manager = ConnectionManager()

# Background Telemetry Streamer
async def background_simulation_loop():
    while True:
        try:
            await asyncio.sleep(settings.SIMULATION_INTERVAL_SECONDS)
            if not manager.active_connections:
                continue

            # Query devices and generate current telemetry frame
            db: Session = SessionLocal()
            try:
                devices_list = db.query(MedicalDevice).all()
                telemetry_batch = []
                for dev in devices_list[:12]:  # Stream active batch
                    sample = device_simulator.generate_telemetry_for_device(dev, dev.patient)
                    telemetry_batch.append({
                        "device_id": dev.id,
                        "device_uid": dev.device_uid,
                        "name": dev.name,
                        "device_type": dev.device_type,
                        "floor": dev.floor,
                        "room": dev.room,
                        "patient_name": dev.patient.full_name if dev.patient else "Unassigned",
                        "patient_condition": dev.patient.condition_status if dev.patient else "Stable",
                        "telemetry": sample
                    })
                
                await manager.broadcast({
                    "type": "TELEMETRY_UPDATE",
                    "timestamp": asyncio.get_event_loop().time(),
                    "scenario": device_simulator.scenario_state,
                    "devices": telemetry_batch
                })
            finally:
                db.close()
        except Exception as e:
            await asyncio.sleep(2.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start simulation background task
    sim_task = asyncio.create_task(background_simulation_loop())
    yield
    # Shutdown
    sim_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Cybersecurity Framework & Patient Safety Risk Engine for Connected Medical Devices",
    lifespan=lifespan
)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(devices.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(threats.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(sbom.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

# Check for production frontend build
frontend_candidates = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend/dist")),
    os.path.abspath(os.path.join(os.getcwd(), "../frontend/dist"))
]

frontend_dist = None
for candidate in frontend_candidates:
    if os.path.exists(candidate) and os.path.exists(os.path.join(candidate, "index.html")):
        frontend_dist = candidate
        break

if frontend_dist and os.path.exists(os.path.join(frontend_dist, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not found"})
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "framework": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "Operational",
            "api_docs": "/docs",
            "websocket_endpoint": "/ws/telemetry"
        }
