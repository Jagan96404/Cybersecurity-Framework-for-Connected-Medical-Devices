from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Incident, IncidentAction, AuditLog, User
from app.schemas import IncidentResponse, IncidentUpdate, IncidentActionCreate
from app.api.auth import get_current_user

router = APIRouter(prefix="/incidents", tags=["Incidents & Response"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if severity:
        query = query.filter(Incident.severity == severity)
    return query.order_by(Incident.created_at.desc()).all()

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_detail(incident_id: int, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int,
    payload: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    actor = current_user.full_name if current_user else "Security Analyst (Demo)"
    role = current_user.role if current_user else "security_analyst"

    if payload.status:
        old_status = inc.status
        inc.status = payload.status
        if payload.status == "Resolved":
            inc.resolved_at = datetime.utcnow()
        
        # Add action
        act = IncidentAction(
            incident_id=inc.id,
            action_type="STATUS_CHANGE",
            description=f"Status transitioned from '{old_status}' to '{payload.status}'.",
            performed_by=actor
        )
        db.add(act)

    if payload.assigned_to:
        inc.assigned_to = payload.assigned_to
        act = IncidentAction(
            incident_id=inc.id,
            action_type="ASSIGNMENT",
            description=f"Assigned incident to {payload.assigned_to}.",
            performed_by=actor
        )
        db.add(act)

    if payload.resolution_notes:
        inc.resolution_notes = payload.resolution_notes

    audit = AuditLog(
        actor_name=actor,
        actor_role=role,
        action="UPDATE_INCIDENT",
        entity_type="Incident",
        entity_id=inc.incident_number,
        details=f"Updated incident {inc.incident_number}. Status: {inc.status}."
    )
    db.add(audit)
    db.commit()
    db.refresh(inc)
    return inc

@router.post("/{incident_id}/actions", response_model=IncidentResponse)
def add_incident_action(
    incident_id: int,
    payload: IncidentActionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    actor = current_user.full_name if current_user else "Security Analyst (Demo)"
    action = IncidentAction(
        incident_id=inc.id,
        action_type=payload.action_type,
        description=payload.description,
        performed_by=actor
    )
    db.add(action)
    db.commit()
    db.refresh(inc)
    return inc

@router.post("/{incident_id}/clinician-approve", response_model=IncidentResponse)
def approve_incident_action(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    actor = current_user.full_name if current_user else "Dr. Sarah Chen (Attending Clinician)"
    inc.clinician_approved = True
    inc.clinician_approved_by = actor
    inc.clinician_approved_at = datetime.utcnow()

    # Log action
    act = IncidentAction(
        incident_id=inc.id,
        action_type="CLINICIAN_APPROVAL_GRANTED",
        description=f"Dual-key clinical authorization granted by {actor}. Patient vitals verified stable for safe remediation.",
        performed_by=actor
    )
    db.add(act)

    audit = AuditLog(
        actor_name=actor,
        actor_role="clinician",
        action="GRANT_CLINICAL_APPROVAL",
        entity_type="Incident",
        entity_id=inc.incident_number,
        details=f"Clinician approval recorded for incident {inc.incident_number}."
    )
    db.add(audit)
    db.commit()
    db.refresh(inc)
    return inc
