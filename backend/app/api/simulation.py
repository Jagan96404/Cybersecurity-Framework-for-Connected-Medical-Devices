from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MedicalDevice, AuditLog, SecurityPolicy, AnomalyEvent, SafetyRiskAssessment, Incident, Patient
from app.schemas import ScenarioTriggerRequest, AuditLogResponse
from app.simulator.device_simulator import device_simulator
from app.engine.safety_engine import calculate_patient_safety_risk

router = APIRouter(prefix="/simulation", tags=["Scenario Simulator"])

SCENARIO_CONFIGS = {
    "scenario_1": {
        "title": "Scenario 1: Stable Patient Normal",
        "description": "ECG monitor operates normally. Device secure with zero anomalies.",
        "device_type": "Cardiac Monitor",
        "target_uid": "CARD-042",
        "threat_severity": "None",
        "action": "Maintain normal baseline telemetry."
    },
    "scenario_2": {
        "title": "Scenario 2: Infusion Pump Outdated Firmware",
        "description": "Outdated FreeRTOS component detected on ICU Infusion Pump. Patient is stable.",
        "device_type": "Infusion Pump",
        "target_uid": "INF-204",
        "threat_severity": "High",
        "action": "Schedule patch maintenance during patient handoff; enable enhanced monitoring."
    },
    "scenario_3": {
        "title": "Scenario 3: Ventilator Network Threat (Critical Patient Protection)",
        "description": "Ventilator detects untrusted external IP communication. Patient is in Critical condition on mechanical ventilation.",
        "device_type": "Ventilator",
        "target_uid": "VENT-016",
        "threat_severity": "Critical",
        "action": "DO NOT SHUT DOWN. Restrict network access to ICU VLAN, alert ICU clinician & security team, open critical incident."
    },
    "scenario_4": {
        "title": "Scenario 4: Wearable Device Authentication Brute Force",
        "description": "8 consecutive failed TLS mutual-auth attempts on Ward B wearable.",
        "device_type": "Wearable",
        "target_uid": "WEAR-115",
        "threat_severity": "High",
        "action": "Require re-authentication and temporarily isolate wearable interface."
    },
    "scenario_5": {
        "title": "Scenario 5: Certificate Expiration Warning",
        "description": "Medical device X.509 certificate expired. TLS trust validation failed.",
        "device_type": "Insulin Pump",
        "target_uid": "GLU-071",
        "threat_severity": "Medium",
        "action": "Flag for CA certificate renewal."
    },
    "scenario_6": {
        "title": "Scenario 6: Unusual Network Traffic Spike",
        "description": "Network traffic surged past 500 kbps on operating room cardiac monitor.",
        "device_type": "Cardiac Monitor",
        "target_uid": "CARD-089",
        "threat_severity": "High",
        "action": "Apply bandwidth rate-limiting and trigger deep packet inspection."
    },
    "scenario_7": {
        "title": "Scenario 7: Critical Patient Event (Arrhythmia / Desaturation)",
        "description": "Patient heart rate spikes to 148 bpm with SpO2 drop to 86%.",
        "device_type": "Ventilator",
        "target_uid": "VENT-016",
        "threat_severity": "Critical",
        "action": "Immediate ICU clinical intervention required."
    },
    "scenario_8": {
        "title": "Scenario 8: Device Offline During Critical Event",
        "description": "Defibrillator telemetry dropped to 0 kbps unexpectedly.",
        "device_type": "Defibrillator",
        "target_uid": "DEFIB-003",
        "threat_severity": "Critical",
        "action": "Immediate clinical telemetry check & backup unit dispatch."
    }
}

@router.post("/trigger")
def trigger_scenario(payload: ScenarioTriggerRequest, db: Session = Depends(get_db)):
    scenario_id = payload.scenario_id
    config = SCENARIO_CONFIGS.get(scenario_id, SCENARIO_CONFIGS["scenario_1"])
    
    # Locate device
    device = None
    if payload.device_id:
        device = db.query(MedicalDevice).filter(MedicalDevice.id == payload.device_id).first()
    if not device:
        device = db.query(MedicalDevice).filter(MedicalDevice.device_uid == config["target_uid"]).first()
    if not device:
        device = db.query(MedicalDevice).filter(MedicalDevice.device_type == config["device_type"]).first()
    if not device:
        device = db.query(MedicalDevice).first()

    device_simulator.set_scenario(scenario_id, device.id if device else None)

    # Update device status in database
    if device:
        patient = device.patient
        patient_cond = patient.condition_status if patient else "Stable"
        
        # Calculate new risk
        risk_res = calculate_patient_safety_risk(
            device_criticality=device.device_criticality,
            threat_severity=config["threat_severity"],
            patient_condition=patient_cond,
            max_cvss_score=8.5 if config["threat_severity"] in ["High", "Critical"] else 2.0,
            network_trust_score=35.0 if config["threat_severity"] == "Critical" else 88.0,
            is_treatment_dependent=True
        )

        device.device_status = "Critical" if risk_res["risk_level"] == "Critical" else ("High Risk" if risk_res["risk_level"] == "High" else "Warning")
        if scenario_id == "scenario_1":
            device.device_status = "Normal"
            device.network_trust_score = 98.0
        elif scenario_id == "scenario_3":
            device.network_trust_score = 34.0
        elif scenario_id == "scenario_4":
            device.auth_attempts = 8
            device.network_trust_score = 52.0

        # Create Anomaly record
        if scenario_id != "scenario_1":
            anomaly = AnomalyEvent(
                device_id=device.id,
                anomaly_type=config["title"],
                anomaly_score=0.92,
                confidence_score=0.96,
                threat_severity=config["threat_severity"],
                explanation=config["description"],
                patient_safety_impact=f"Patient {patient.full_name if patient else 'Unknown'} condition is {patient_cond}. {risk_res['explanation']}",
                recommended_action=risk_res["recommended_response"]
            )
            db.add(anomaly)

            # Create assessment record
            assessment = SafetyRiskAssessment(
                device_id=device.id,
                patient_id=patient.id if patient else None,
                safety_risk_score=risk_res["safety_risk_score"],
                risk_level=risk_res["risk_level"],
                device_criticality_factor=risk_res["device_criticality_factor"],
                threat_severity_factor=risk_res["threat_severity_factor"],
                patient_condition_factor=risk_res["patient_condition_factor"],
                vulnerability_factor=risk_res["vulnerability_factor"],
                network_risk_factor=risk_res["network_risk_factor"],
                treatment_continuity_protection=risk_res["treatment_continuity_protection"],
                explanation=risk_res["explanation"],
                recommended_response=risk_res["recommended_response"]
            )
            db.add(assessment)

            # If scenario 3, create active critical incident
            if scenario_id == "scenario_3":
                incident = Incident(
                    incident_number=f"INC-2026-{100 + db.query(Incident).count() + 1}",
                    title="Critical Ventilator Network Threat Detected (Active Ventilation Treatment)",
                    description="Ventilator VENT-016 attempted connection to untrusted external IP host while patient is in Critical respiratory failure. Automated shutdown prohibited by Patient Safety Risk Engine.",
                    device_id=device.id,
                    patient_id=patient.id if patient else None,
                    severity="Critical",
                    status="Open",
                    assigned_to="lead.analyst@hospital.internal",
                    clinician_approval_required=True,
                    clinician_approved=False
                )
                db.add(incident)

        # Audit log
        audit = AuditLog(
            actor_name="Simulation Controller",
            actor_role="simulator",
            action="TRIGGER_SIMULATION_SCENARIO",
            entity_type="Simulation",
            entity_id=scenario_id,
            details=f"Injected {config['title']} targeting {device.device_uid} ({device.name})."
        )
        db.add(audit)
        db.commit()

    return {
        "scenario_id": scenario_id,
        "title": config["title"],
        "target_device": device.device_uid if device else None,
        "status": "Active"
    }

@router.post("/reset")
def reset_simulation(db: Session = Depends(get_db)):
    device_simulator.reset_scenario()
    
    # Restore device normal statuses
    devices = db.query(MedicalDevice).all()
    for d in devices:
        d.device_status = "Normal"
        d.network_trust_score = 96.0
        d.is_isolated = False
        d.auth_attempts = 0
    
    audit = AuditLog(
        actor_name="Simulation Controller",
        actor_role="simulator",
        action="RESET_SIMULATION_STATE",
        entity_type="Simulation",
        entity_id="ALL",
        details="Restored baseline simulation parameters across all devices."
    )
    db.add(audit)
    db.commit()
    return {"message": "Simulation reset to normal baseline", "active_scenario": "normal"}

@router.get("/status")
def get_simulation_status():
    return {
        "active_scenario": device_simulator.scenario_state,
        "target_device_id": device_simulator.target_device_id,
        "available_scenarios": [
            {"id": k, **v} for k, v in SCENARIO_CONFIGS.items()
        ]
    }

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()

@router.get("/policies")
def get_policies(db: Session = Depends(get_db)):
    return db.query(SecurityPolicy).all()
