from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Patient, MedicalDevice, AuditLog, User
from app.schemas import PatientResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=List[PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    return db.query(Patient).all()

@router.get("/{patient_id}")
def get_patient_detail(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    devices = db.query(MedicalDevice).filter(MedicalDevice.patient_id == patient.id).all()
    
    return {
        "id": patient.id,
        "patient_uid": patient.patient_uid,
        "full_name": patient.full_name,
        "age": patient.age,
        "gender": patient.gender,
        "condition_status": patient.condition_status,
        "department": patient.department,
        "room": patient.room,
        "bed": patient.bed,
        "diagnosis": patient.diagnosis,
        "treatment_dependency": patient.treatment_dependency,
        "admission_date": patient.admission_date,
        "devices": devices,
        "safety_assessments": patient.safety_assessments
    }

@router.post("/{patient_id}/acknowledge-alert")
def acknowledge_patient_alert(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    actor_name = current_user.full_name if current_user else "Dr. Sarah Chen (Clinician)"
    actor_role = current_user.role if current_user else "clinician"

    audit = AuditLog(
        actor_name=actor_name,
        actor_role=actor_role,
        action="ACKNOWLEDGE_PATIENT_SAFETY_ALERT",
        entity_type="Patient",
        entity_id=patient.patient_uid,
        details=f"Clinician acknowledged active safety status for patient {patient.full_name} ({patient.treatment_dependency})."
    )
    db.add(audit)
    db.commit()
    return {"message": "Patient alert acknowledged by clinician", "patient_id": patient.id}
