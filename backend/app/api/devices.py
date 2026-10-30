from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MedicalDevice, DeviceTelemetry, SafetyRiskAssessment, AuditLog, Patient, User
from app.schemas import MedicalDeviceResponse, DeviceTelemetryResponse, SafetyRiskAssessmentResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/devices", tags=["Medical Devices"])

@router.get("", response_model=List[MedicalDeviceResponse])
def get_devices(
    device_type: Optional[str] = None,
    status: Optional[str] = None,
    criticality: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(MedicalDevice)
    if device_type:
        query = query.filter(MedicalDevice.device_type == device_type)
    if status:
        query = query.filter(MedicalDevice.device_status == status)
    if criticality:
        query = query.filter(MedicalDevice.device_criticality == criticality)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (MedicalDevice.name.ilike(search_fmt)) |
            (MedicalDevice.device_uid.ilike(search_fmt)) |
            (MedicalDevice.room.ilike(search_fmt))
        )
    return query.all()

@router.get("/summary/stats")
def get_summary_stats(db: Session = Depends(get_db)):
    total_devices = db.query(MedicalDevice).count()
    secure_devices = db.query(MedicalDevice).filter(MedicalDevice.device_status == "Normal").count()
    attention_devices = db.query(MedicalDevice).filter(MedicalDevice.device_status.in_(["Warning", "High Risk", "Critical"])).count()
    critical_alerts = db.query(MedicalDevice).filter(MedicalDevice.device_status == "Critical").count()
    
    # Calculate average safety risk score
    assessments = db.query(SafetyRiskAssessment).all()
    avg_score = 24.5
    if assessments:
        avg_score = round(sum(a.safety_risk_score for a in assessments) / len(assessments), 1)

    return {
        "total_devices": total_devices,
        "secure_devices": secure_devices,
        "attention_devices": attention_devices,
        "critical_alerts": critical_alerts,
        "average_safety_risk_score": avg_score
    }

@router.get("/{device_id}")
def get_device_detail(device_id: int, db: Session = Depends(get_db)):
    device = db.query(MedicalDevice).filter(MedicalDevice.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Latest telemetry
    latest_telemetry = (
        db.query(DeviceTelemetry)
        .filter(DeviceTelemetry.device_id == device.id)
        .order_by(DeviceTelemetry.timestamp.desc())
        .first()
    )
    
    # Latest safety risk assessment
    latest_assessment = (
        db.query(SafetyRiskAssessment)
        .filter(SafetyRiskAssessment.device_id == device.id)
        .order_by(SafetyRiskAssessment.calculated_at.desc())
        .first()
    )

    # Certificates & Network Identity
    cert = device.certificates[0] if device.certificates else None
    net = device.network_identity

    # Vulnerabilities
    vulns = []
    for dv in device.vulnerabilities:
        v = dv.vulnerability
        vulns.append({
            "cve_id": v.cve_id,
            "title": v.title,
            "cvss_score": v.cvss_score,
            "severity": v.severity,
            "status": dv.status,
            "patch_status": v.patch_status,
            "remediation_steps": v.remediation_steps
        })

    return {
        "id": device.id,
        "device_uid": device.device_uid,
        "name": device.name,
        "device_type": device.device_type,
        "floor": device.floor,
        "room": device.room,
        "firmware_version": device.firmware_version,
        "battery_level": device.battery_level,
        "cpu_usage": device.cpu_usage,
        "network_traffic_kbps": device.network_traffic_kbps,
        "auth_attempts": device.auth_attempts,
        "cert_status": device.cert_status,
        "command_frequency": device.command_frequency,
        "device_status": device.device_status,
        "network_trust_score": device.network_trust_score,
        "device_criticality": device.device_criticality,
        "is_isolated": device.is_isolated,
        "isolation_reason": device.isolation_reason,
        "last_seen": device.last_seen,
        "patient": device.patient,
        "certificate": cert,
        "network_identity": net,
        "latest_telemetry": latest_telemetry,
        "latest_safety_assessment": latest_assessment,
        "vulnerabilities": vulns
    }

@router.get("/{device_id}/telemetry", response_model=List[DeviceTelemetryResponse])
def get_device_telemetry_history(
    device_id: int,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    samples = (
        db.query(DeviceTelemetry)
        .filter(DeviceTelemetry.device_id == device_id)
        .order_by(DeviceTelemetry.timestamp.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(samples))

@router.post("/{device_id}/isolate")
def isolate_device(
    device_id: int,
    reason: str = "Suspected network compromise",
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    device = db.query(MedicalDevice).filter(MedicalDevice.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    actor_name = current_user.full_name if current_user else "Security Analyst (Demo)"
    actor_role = current_user.role if current_user else "security_analyst"

    # Enforce safe treatment continuity check
    if device.device_criticality in ["High", "Life-Critical"] and device.patient and device.patient.condition_status == "Critical":
        # Safe isolation: Network access restricted to approved ICU telemetry only, NOT powered off!
        device.is_isolated = True
        device.isolation_reason = f"Safe ICU VLAN Isolation Applied: {reason} (Device power & active ventilation/infusion maintained)"
        action_msg = "Safe Network Isolation (ICU Telemetry VLAN ACL Restricted - Power Intact)"
    else:
        device.is_isolated = True
        device.isolation_reason = reason
        action_msg = "Device Network Interface Isolated"

    # Log to audit trail
    audit = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action="ISOLATE_DEVICE",
        entity_type="MedicalDevice",
        entity_id=device.device_uid,
        details=f"{action_msg}. Reason: {reason}"
    )
    db.add(audit)
    db.commit()
    db.refresh(device)
    return {"message": action_msg, "device": device}

@router.post("/{device_id}/reconnect")
def reconnect_device(
    device_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    device = db.query(MedicalDevice).filter(MedicalDevice.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    actor_name = current_user.full_name if current_user else "Administrator (Demo)"
    actor_role = current_user.role if current_user else "administrator"

    device.is_isolated = False
    device.isolation_reason = None
    device.device_status = "Normal"
    device.network_trust_score = 98.0

    audit = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action="RESTORE_DEVICE_NETWORK",
        entity_type="MedicalDevice",
        entity_id=device.device_uid,
        details="Restored normal network communications after security verification."
    )
    db.add(audit)
    db.commit()
    return {"message": "Device network connectivity restored", "device": device}
