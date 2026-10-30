export type UserRole = 'administrator' | 'security_analyst' | 'clinician';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  department?: string;
}

export type PatientCondition = 'Stable' | 'Warning' | 'Critical';

export interface Patient {
  id: number;
  patient_uid: string;
  full_name: string;
  age: number;
  gender: string;
  condition_status: PatientCondition;
  department: string;
  room: string;
  bed: string;
  diagnosis: string;
  treatment_dependency: string;
  admission_date: string;
}

export type DeviceType = 'Ventilator' | 'Infusion Pump' | 'Cardiac Monitor' | 'Insulin Pump' | 'Wearable' | 'Defibrillator';
export type DeviceCriticality = 'Low' | 'Moderate' | 'High' | 'Life-Critical';
export type DeviceStatus = 'Normal' | 'Warning' | 'High Risk' | 'Critical' | 'Offline';

export interface MedicalDevice {
  id: number;
  device_uid: string;
  name: string;
  device_type: DeviceType;
  floor: string;
  room: string;
  firmware_version: string;
  battery_level: number;
  cpu_usage: number;
  network_traffic_kbps: number;
  auth_attempts: number;
  cert_status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Revoked';
  command_frequency: number;
  device_status: DeviceStatus;
  network_trust_score: number;
  device_criticality: DeviceCriticality;
  is_isolated: boolean;
  isolation_reason?: string;
  last_seen: string;
  patient_id?: number;
  patient?: Patient;
}

export interface DeviceTelemetry {
  id: number;
  device_id: number;
  timestamp: string;
  heart_rate?: number;
  spo2?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  mean_arterial_pressure?: number;
  respiratory_rate?: number;
  temperature?: number;
  ecg_lead_ii_sample?: number;
  capnography_etco2?: number;
  infusion_rate_ml_hr?: number;
  ventilator_fio2?: number;
  ventilator_peep?: number;
  ventilator_tidal_vol?: number;
  cpu_load: number;
  network_traffic_kbps: number;
  packet_rate_sec: number;
  failed_auth_count: number;
  untrusted_endpoint_detected: boolean;
}

export interface AnomalyEvent {
  id: number;
  device_id: number;
  timestamp: string;
  anomaly_type: string;
  anomaly_score: number;
  confidence_score: number;
  threat_severity: 'Low' | 'Medium' | 'High' | 'Critical';
  explanation: string;
  patient_safety_impact: string;
  recommended_action: string;
  is_resolved: boolean;
  device_uid?: string;
  device_name?: string;
  device_type?: string;
}

export interface SafetyRiskAssessment {
  id: number;
  device_id: number;
  patient_id?: number;
  calculated_at: string;
  safety_risk_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  device_criticality_factor: number;
  threat_severity_factor: number;
  patient_condition_factor: number;
  vulnerability_factor: number;
  network_risk_factor: number;
  treatment_continuity_protection: number;
  explanation: string;
  recommended_response: string;
}

export interface IncidentAction {
  id: number;
  action_type: string;
  description: string;
  performed_by: string;
  timestamp: string;
}

export interface Incident {
  id: number;
  incident_number: string;
  title: string;
  description: string;
  device_id: number;
  patient_id?: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Contained' | 'Resolved' | 'False Positive';
  assigned_to?: string;
  clinician_approval_required: boolean;
  clinician_approved: boolean;
  clinician_approved_by?: string;
  clinician_approved_at?: string;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  device?: MedicalDevice;
  patient?: Patient;
  actions: IncidentAction[];
}

export interface Vulnerability {
  id: number;
  cve_id: string;
  title: string;
  description: string;
  cvss_score: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  published_date: string;
  patch_status: 'Available' | 'In Testing' | 'Deployed' | 'Unpatched';
  remediation_steps?: string;
}

export interface SbomComponent {
  id: number;
  component_name: string;
  vendor: string;
  version: string;
  latest_version: string;
  component_type: string;
  license: string;
  vulnerabilities: Vulnerability[];
}

export interface AuditLog {
  id: number;
  timestamp: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: string;
  ip_address: string;
}
