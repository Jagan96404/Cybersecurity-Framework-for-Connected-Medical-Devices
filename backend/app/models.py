import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(String(32), nullable=False)  # administrator, security_analyst, clinician
    department = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_uid = Column(String(32), unique=True, index=True, nullable=False)  # e.g., PAT-101
    full_name = Column(String(128), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(16), nullable=False)
    condition_status = Column(String(32), default="Stable")  # Stable, Warning, Critical
    department = Column(String(64), nullable=False)  # ICU, Cardiology, NICU, Surgery, General Ward
    room = Column(String(32), nullable=False)
    bed = Column(String(16), nullable=False)
    diagnosis = Column(String(256), nullable=False)
    treatment_dependency = Column(String(256), nullable=False)  # e.g., "Active Mechanical Ventilation", "Inotropic Infusion"
    admission_date = Column(DateTime, default=datetime.datetime.utcnow)
    
    devices = relationship("MedicalDevice", back_populates="patient")
    safety_assessments = relationship("SafetyRiskAssessment", back_populates="patient")
    incidents = relationship("Incident", back_populates="patient")

class MedicalDevice(Base):
    __tablename__ = "medical_devices"
    
    id = Column(Integer, primary_key=True, index=True)
    device_uid = Column(String(32), unique=True, index=True, nullable=False)  # e.g., VENT-016
    name = Column(String(128), nullable=False)
    device_type = Column(String(64), nullable=False)  # Ventilator, Infusion Pump, Cardiac Monitor, Insulin Pump, Wearable, Defibrillator
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    floor = Column(String(32), nullable=False)
    room = Column(String(32), nullable=False)
    firmware_version = Column(String(32), nullable=False)
    battery_level = Column(Integer, default=100)
    cpu_usage = Column(Float, default=12.5)
    network_traffic_kbps = Column(Float, default=45.0)
    auth_attempts = Column(Integer, default=0)
    cert_status = Column(String(32), default="Valid")  # Valid, Expiring Soon, Expired, Revoked
    command_frequency = Column(Float, default=1.0)
    device_status = Column(String(32), default="Normal")  # Normal, Warning, High Risk, Critical, Offline
    network_trust_score = Column(Float, default=95.0)  # 0-100
    device_criticality = Column(String(32), default="High")  # Low, Moderate, High, Life-Critical
    is_isolated = Column(Boolean, default=False)
    isolation_reason = Column(String(256), nullable=True)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)
    
    patient = relationship("Patient", back_populates="devices")
    telemetry_logs = relationship("DeviceTelemetry", back_populates="device", cascade="all, delete-orphan")
    certificates = relationship("DeviceCertificate", back_populates="device", cascade="all, delete-orphan")
    network_identity = relationship("NetworkIdentity", back_populates="device", uselist=False, cascade="all, delete-orphan")
    vulnerabilities = relationship("DeviceVulnerability", back_populates="device", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyEvent", back_populates="device", cascade="all, delete-orphan")
    safety_assessments = relationship("SafetyRiskAssessment", back_populates="device", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="device")

class DeviceTelemetry(Base):
    __tablename__ = "device_telemetry"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("medical_devices.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    heart_rate = Column(Float, nullable=True)
    spo2 = Column(Float, nullable=True)
    systolic_bp = Column(Float, nullable=True)
    diastolic_bp = Column(Float, nullable=True)
    mean_arterial_pressure = Column(Float, nullable=True)
    respiratory_rate = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    ecg_lead_ii_sample = Column(Float, nullable=True)
    capnography_etco2 = Column(Float, nullable=True)
    infusion_rate_ml_hr = Column(Float, nullable=True)
    ventilator_fio2 = Column(Float, nullable=True)
    ventilator_peep = Column(Float, nullable=True)
    ventilator_tidal_vol = Column(Float, nullable=True)
    cpu_load = Column(Float, default=15.0)
    network_traffic_kbps = Column(Float, default=40.0)
    packet_rate_sec = Column(Float, default=12.0)
    failed_auth_count = Column(Integer, default=0)
    untrusted_endpoint_detected = Column(Boolean, default=False)
    
    device = relationship("MedicalDevice", back_populates="telemetry_logs")

class DeviceCertificate(Base):
    __tablename__ = "device_certificates"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("medical_devices.id"), nullable=False)
    serial_number = Column(String(64), nullable=False)
    issuer = Column(String(128), default="MedSentinel Hospital Internal Root CA")
    valid_from = Column(DateTime, default=datetime.datetime.utcnow)
    valid_to = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    signature_algorithm = Column(String(32), default="SHA256-RSA")
    
    device = relationship("MedicalDevice", back_populates="certificates")

class NetworkIdentity(Base):
    __tablename__ = "network_identities"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("medical_devices.id"), nullable=False)
    mac_address = Column(String(32), nullable=False)
    ip_address = Column(String(45), nullable=False)
    vlan_id = Column(Integer, default=104)  # 104 = Medical Critical VLAN
    trusted_subnet = Column(String(64), default="10.240.10.0/24")
    egress_allowed = Column(Boolean, default=False)
    connection_protocol = Column(String(32), default="TLS / WPA3-Enterprise")
    
    device = relationship("MedicalDevice", back_populates="network_identity")

class SbomComponent(Base):
    __tablename__ = "sbom_components"
    
    id = Column(Integer, primary_key=True, index=True)
    component_name = Column(String(128), nullable=False)
    vendor = Column(String(128), nullable=False)
    version = Column(String(32), nullable=False)
    latest_version = Column(String(32), nullable=False)
    component_type = Column(String(64), nullable=False)  # RTOS, Cryptographic Library, Network Stack, BLE Driver
    license = Column(String(64), default="Apache-2.0 / MIT")
    
    vulnerabilities = relationship("Vulnerability", back_populates="component")

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    
    id = Column(Integer, primary_key=True, index=True)
    cve_id = Column(String(32), unique=True, index=True, nullable=False)  # e.g., CVE-2026-1049
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    cvss_score = Column(Float, nullable=False)
    severity = Column(String(16), nullable=False)  # Low, Medium, High, Critical
    affected_component_id = Column(Integer, ForeignKey("sbom_components.id"), nullable=False)
    published_date = Column(DateTime, default=datetime.datetime.utcnow)
    patch_status = Column(String(32), default="Available")  # Available, In Testing, Deployed, Unpatched
    remediation_steps = Column(Text, nullable=True)
    
    component = relationship("SbomComponent", back_populates="vulnerabilities")
    device_links = relationship("DeviceVulnerability", back_populates="vulnerability")

class DeviceVulnerability(Base):
    __tablename__ = "device_vulnerabilities"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("medical_devices.id"), nullable=False)
    vulnerability_id = Column(Integer, ForeignKey("vulnerabilities.id"), nullable=False)
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(32), default="Active")  # Active, Mitigated, Patched
    
    device = relationship("MedicalDevice", back_populates="vulnerabilities")
    vulnerability = relationship("Vulnerability", back_populates="device_links")

class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("medical_devices.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    anomaly_type = Column(String(64), nullable=False)  # Untrusted Endpoint, Repeated Auth Failure, Expired Cert, etc.
    anomaly_score = Column(Float, nullable=False)  # 0.0 - 1.0
    confidence_score = Column(Float, default=0.92)  # 0.0 - 1.0
    threat_severity = Column(String(16), nullable=False)  # Low, Medium, High, Critical
    explanation = Column(Text, nullable=False)
    patient_safety_impact = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    
    device = relationship("MedicalDevice", back_populates="anomalies")

class SafetyRiskAssessment(Base):
    __tablename__ = "safety_risk_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("medical_devices.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    safety_risk_score = Column(Float, nullable=False)  # 0 - 100
    risk_level = Column(String(16), nullable=False)  # Low, Moderate, High, Critical
    device_criticality_factor = Column(Float, nullable=False)
    threat_severity_factor = Column(Float, nullable=False)
    patient_condition_factor = Column(Float, nullable=False)
    vulnerability_factor = Column(Float, nullable=False)
    network_risk_factor = Column(Float, nullable=False)
    treatment_continuity_protection = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    recommended_response = Column(Text, nullable=False)
    
    device = relationship("MedicalDevice", back_populates="safety_assessments")
    patient = relationship("Patient", back_populates="safety_assessments")

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_number = Column(String(32), unique=True, index=True, nullable=False)  # e.g., INC-2026-001
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=False)
    device_id = Column(Integer, ForeignKey("medical_devices.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    severity = Column(String(16), nullable=False)  # Low, Medium, High, Critical
    status = Column(String(32), default="Open")  # Open, Investigating, Contained, Resolved, False Positive
    assigned_to = Column(String(64), nullable=True)
    clinician_approval_required = Column(Boolean, default=True)
    clinician_approved = Column(Boolean, default=False)
    clinician_approved_by = Column(String(64), nullable=True)
    clinician_approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    
    device = relationship("MedicalDevice", back_populates="incidents")
    patient = relationship("Patient", back_populates="incidents")
    actions = relationship("IncidentAction", back_populates="incident", cascade="all, delete-orphan")

class IncidentAction(Base):
    __tablename__ = "incident_actions"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    action_type = Column(String(64), nullable=False)  # Network Isolation, Alert Sent, Clinician Approved, etc.
    description = Column(Text, nullable=False)
    performed_by = Column(String(64), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    incident = relationship("Incident", back_populates="actions")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    actor_name = Column(String(128), nullable=False)
    actor_role = Column(String(32), nullable=False)
    action = Column(String(128), nullable=False)
    entity_type = Column(String(64), nullable=False)
    entity_id = Column(String(64), nullable=True)
    details = Column(Text, nullable=False)
    ip_address = Column(String(45), default="127.0.0.1")

class SecurityPolicy(Base):
    __tablename__ = "security_policies"
    
    id = Column(Integer, primary_key=True, index=True)
    policy_code = Column(String(32), unique=True, index=True, nullable=False)
    title = Column(String(256), nullable=False)
    category = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    is_enforced = Column(Boolean, default=True)
    treatment_continuity_exception = Column(Boolean, default=True)

