from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    department: Optional[str] = None

    class Config:
        from_attributes = True

# Patient Schemas
class PatientBase(BaseModel):
    patient_uid: str
    full_name: str
    age: int
    gender: str
    condition_status: str
    department: str
    room: str
    bed: str
    diagnosis: str
    treatment_dependency: str

class PatientResponse(PatientBase):
    id: int
    admission_date: datetime

    class Config:
        from_attributes = True

# Device Schemas
class CertificateSchema(BaseModel):
    serial_number: str
    issuer: str
    valid_from: datetime
    valid_to: datetime
    is_revoked: bool
    signature_algorithm: str

    class Config:
        from_attributes = True

class NetworkIdentitySchema(BaseModel):
    mac_address: str
    ip_address: str
    vlan_id: int
    trusted_subnet: str
    egress_allowed: bool
    connection_protocol: str

    class Config:
        from_attributes = True

class MedicalDeviceBase(BaseModel):
    device_uid: str
    name: str
    device_type: str
    floor: str
    room: str
    firmware_version: str
    battery_level: int
    cpu_usage: float
    network_traffic_kbps: float
    auth_attempts: int
    cert_status: str
    command_frequency: float
    device_status: str
    network_trust_score: float
    device_criticality: str
    is_isolated: bool
    isolation_reason: Optional[str] = None

class MedicalDeviceResponse(MedicalDeviceBase):
    id: int
    patient_id: Optional[int] = None
    last_seen: datetime
    patient: Optional[PatientResponse] = None

    class Config:
        from_attributes = True

# Telemetry
class DeviceTelemetryResponse(BaseModel):
    id: int
    device_id: int
    timestamp: datetime
    heart_rate: Optional[float] = None
    spo2: Optional[float] = None
    systolic_bp: Optional[float] = None
    diastolic_bp: Optional[float] = None
    mean_arterial_pressure: Optional[float] = None
    respiratory_rate: Optional[float] = None
    temperature: Optional[float] = None
    ecg_lead_ii_sample: Optional[float] = None
    capnography_etco2: Optional[float] = None
    infusion_rate_ml_hr: Optional[float] = None
    ventilator_fio2: Optional[float] = None
    ventilator_peep: Optional[float] = None
    ventilator_tidal_vol: Optional[float] = None
    cpu_load: float
    network_traffic_kbps: float
    packet_rate_sec: float
    failed_auth_count: int
    untrusted_endpoint_detected: bool

    class Config:
        from_attributes = True

# Anomaly & Safety Risk
class AnomalyEventResponse(BaseModel):
    id: int
    device_id: int
    timestamp: datetime
    anomaly_type: str
    anomaly_score: float
    confidence_score: float
    threat_severity: str
    explanation: str
    patient_safety_impact: str
    recommended_action: str
    is_resolved: bool
    device_uid: Optional[str] = None
    device_name: Optional[str] = None
    device_type: Optional[str] = None

    class Config:
        from_attributes = True

class SafetyRiskAssessmentResponse(BaseModel):
    id: int
    device_id: int
    patient_id: Optional[int] = None
    calculated_at: datetime
    safety_risk_score: float
    risk_level: str
    device_criticality_factor: float
    threat_severity_factor: float
    patient_condition_factor: float
    vulnerability_factor: float
    network_risk_factor: float
    treatment_continuity_protection: float
    explanation: str
    recommended_response: str

    class Config:
        from_attributes = True

# Incidents
class IncidentActionResponse(BaseModel):
    id: int
    action_type: str
    description: str
    performed_by: str
    timestamp: datetime

    class Config:
        from_attributes = True

class IncidentResponse(BaseModel):
    id: int
    incident_number: str
    title: str
    description: str
    device_id: int
    patient_id: Optional[int] = None
    severity: str
    status: str
    assigned_to: Optional[str] = None
    clinician_approval_required: bool
    clinician_approved: bool
    clinician_approved_by: Optional[str] = None
    clinician_approved_at: Optional[datetime] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    device: Optional[MedicalDeviceResponse] = None
    patient: Optional[PatientResponse] = None
    actions: List[IncidentActionResponse] = []

    class Config:
        from_attributes = True

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    clinician_approved: Optional[bool] = None

class IncidentActionCreate(BaseModel):
    action_type: str
    description: str

# SBOM & Vulnerabilities
class VulnerabilityResponse(BaseModel):
    id: int
    cve_id: str
    title: str
    description: str
    cvss_score: float
    severity: str
    published_date: datetime
    patch_status: str
    remediation_steps: Optional[str] = None

    class Config:
        from_attributes = True

class SbomComponentResponse(BaseModel):
    id: int
    component_name: str
    vendor: str
    version: str
    latest_version: str
    component_type: str
    license: str
    vulnerabilities: List[VulnerabilityResponse] = []

    class Config:
        from_attributes = True

# Simulation triggers
class ScenarioTriggerRequest(BaseModel):
    scenario_id: str  # scenario_1, scenario_2, scenario_3, scenario_4, etc.
    device_id: Optional[int] = None

class SimulationResetRequest(BaseModel):
    preserve_devices: bool = True

class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    actor_name: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: str
    ip_address: str

    class Config:
        from_attributes = True

