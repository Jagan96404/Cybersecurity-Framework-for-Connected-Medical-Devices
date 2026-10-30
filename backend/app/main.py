import asyncio
import json
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
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

# Enable CORS for all local development origins
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
            # Keep connection alive & handle incoming client messages if any
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "framework": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "Operational",
        "api_docs": "/docs",
        "websocket_endpoint": "/ws/telemetry"
    }
