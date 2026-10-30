from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AnomalyEvent, SafetyRiskAssessment, MedicalDevice
from app.schemas import AnomalyEventResponse, SafetyRiskAssessmentResponse
from app.engine.safety_engine import calculate_patient_safety_risk

router = APIRouter(prefix="/threats", tags=["Threat Detection & Safety Engine"])

@router.get("", response_model=List[AnomalyEventResponse])
def get_anomalies(
    severity: Optional[str] = None,
    limit: int = Query(50, le=150),
    db: Session = Depends(get_db)
):
    query = db.query(AnomalyEvent)
    if severity:
        query = query.filter(AnomalyEvent.threat_severity == severity)
    anomalies = query.order_by(AnomalyEvent.timestamp.desc()).limit(limit).all()
    
    # Enrich with device UID and name
    results = []
    for a in anomalies:
        dev = a.device
        item = AnomalyEventResponse(
            id=a.id,
            device_id=a.device_id,
            timestamp=a.timestamp,
            anomaly_type=a.anomaly_type,
            anomaly_score=a.anomaly_score,
            confidence_score=a.confidence_score,
            threat_severity=a.threat_severity,
            explanation=a.explanation,
            patient_safety_impact=a.patient_safety_impact,
            recommended_action=a.recommended_action,
            is_resolved=a.is_resolved,
            device_uid=dev.device_uid if dev else "UNKNOWN",
            device_name=dev.name if dev else "Unknown Device",
            device_type=dev.device_type if dev else "Generic"
        )
        results.append(item)
    return results

@router.get("/safety-assessments", response_model=List[SafetyRiskAssessmentResponse])
def get_safety_assessments(
    limit: int = Query(30, le=100),
    db: Session = Depends(get_db)
):
    return (
        db.query(SafetyRiskAssessment)
        .order_by(SafetyRiskAssessment.calculated_at.desc())
        .limit(limit)
        .all()
    )

@router.post("/calculate")
def calculate_custom_risk(
    device_criticality: str = "Life-Critical",
    threat_severity: str = "High",
    patient_condition: str = "Critical",
    max_cvss_score: float = 7.5,
    network_trust_score: float = 40.0,
    is_treatment_dependent: bool = True
):
    return calculate_patient_safety_risk(
        device_criticality=device_criticality,
        threat_severity=threat_severity,
        patient_condition=patient_condition,
        max_cvss_score=max_cvss_score,
        network_trust_score=network_trust_score,
        is_treatment_dependent=is_treatment_dependent
    )
