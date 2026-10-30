from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SbomComponent, Vulnerability
from app.schemas import SbomComponentResponse, VulnerabilityResponse

router = APIRouter(prefix="/sbom", tags=["SBOM & Vulnerabilities"])

@router.get("", response_model=List[SbomComponentResponse])
def get_sbom_components(db: Session = Depends(get_db)):
    return db.query(SbomComponent).all()

@router.get("/vulnerabilities", response_model=List[VulnerabilityResponse])
def get_vulnerabilities(db: Session = Depends(get_db)):
    return db.query(Vulnerability).order_by(Vulnerability.cvss_score.desc()).all()
