// MedSentinel CPS API Service with automatic fallback for static deployments (GitHub Pages)

const API_BASE = '/api/v1';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('medsentinel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fallback seed data for static GitHub Pages deployment
const FALLBACK_PATIENTS = [
  { id: 1, patient_uid: "PAT-101", full_name: "Arthur Pendelton", age: 68, gender: "Male", condition_status: "Critical", department: "ICU", room: "ICU Room 08", bed: "Bed 1", diagnosis: "Acute Respiratory Distress Syndrome (ARDS)", treatment_dependency: "Active Mechanical Ventilation", admission_date: new Date().toISOString() },
  { id: 2, patient_uid: "PAT-102", full_name: "Beatrice Montgomery", age: 74, gender: "Female", condition_status: "Critical", department: "ICU", room: "ICU Room 12", bed: "Bed 2", diagnosis: "Septic Shock / Sepsis", treatment_dependency: "High-Alert Norepinephrine Infusion", admission_date: new Date().toISOString() },
  { id: 3, patient_uid: "PAT-103", full_name: "Julian Alcantara", age: 55, gender: "Male", condition_status: "Warning", department: "Cardiology", room: "Cardiology Room 03", bed: "Bed 1", diagnosis: "Unstable Angina & Arrhythmia", treatment_dependency: "Continuous Telemetry Monitoring", admission_date: new Date().toISOString() },
  { id: 4, patient_uid: "PAT-104", full_name: "Clara Oswald", age: 29, gender: "Female", condition_status: "Stable", department: "NICU", room: "NICU Room 02", bed: "Bed A", diagnosis: "34-Week Preterm Observation", treatment_dependency: "External Fetal & Toco Monitoring", admission_date: new Date().toISOString() },
  { id: 5, patient_uid: "PAT-105", full_name: "Derrick Vance", age: 62, gender: "Male", condition_status: "Warning", department: "Endocrinology", room: "Room 206", bed: "Bed 1", diagnosis: "Brittle Type 1 Diabetes Mellitus", treatment_dependency: "Closed-Loop Insulin Pump", admission_date: new Date().toISOString() },
  { id: 6, patient_uid: "PAT-106", full_name: "Sophia Lin", age: 45, gender: "Female", condition_status: "Stable", department: "Ward B", room: "Ward B Room 14", bed: "Bed 1", diagnosis: "Post-Op Knee Arthroplasty Recovery", treatment_dependency: "Continuous Wearable Vitals Monitor", admission_date: new Date().toISOString() }
];

const FALLBACK_DEVICES = [
  { id: 1, device_uid: "VENT-016", name: "Dräger Evita V800 Ventilator", device_type: "Ventilator", floor: "Floor 3 - ICU", room: "ICU Room 08", firmware_version: "v4.1.2", battery_level: 98, cpu_usage: 78.5, network_traffic_kbps: 312.0, auth_attempts: 3, cert_status: "Valid", command_frequency: 1.0, device_status: "Critical", network_trust_score: 38.0, device_criticality: "Life-Critical", is_isolated: false, last_seen: new Date().toISOString(), patient: FALLBACK_PATIENTS[0] },
  { id: 2, device_uid: "INF-204", name: "Alaris Medley 8015 Infusion Pump", device_type: "Infusion Pump", floor: "Floor 3 - ICU", room: "ICU Room 12", firmware_version: "v3.2.0", battery_level: 92, cpu_usage: 42.0, network_traffic_kbps: 85.0, auth_attempts: 0, cert_status: "Valid", command_frequency: 1.0, device_status: "Warning", network_trust_score: 82.0, device_criticality: "Life-Critical", is_isolated: false, last_seen: new Date().toISOString(), patient: FALLBACK_PATIENTS[1] },
  { id: 3, device_uid: "CARD-042", name: "Philips IntelliVue MX800 ECG Monitor", device_type: "Cardiac Monitor", floor: "Floor 2 - Cardiology", room: "Cardiology Room 03", firmware_version: "v5.0.1", battery_level: 100, cpu_usage: 18.0, network_traffic_kbps: 45.0, auth_attempts: 0, cert_status: "Valid", command_frequency: 1.0, device_status: "Normal", network_trust_score: 96.0, device_criticality: "High", is_isolated: false, last_seen: new Date().toISOString(), patient: FALLBACK_PATIENTS[2] },
  { id: 4, device_uid: "FETAL-008", name: "GE Corometrics 259cx Fetal Monitor", device_type: "Wearable", floor: "Floor 4 - NICU", room: "NICU Room 02", firmware_version: "v2.8.4", battery_level: 95, cpu_usage: 15.0, network_traffic_kbps: 40.0, auth_attempts: 0, cert_status: "Valid", command_frequency: 1.0, device_status: "Normal", network_trust_score: 95.0, device_criticality: "High", is_isolated: false, last_seen: new Date().toISOString(), patient: FALLBACK_PATIENTS[3] },
  { id: 5, device_uid: "GLU-071", name: "Medtronic MiniMed 780G Insulin Pump", device_type: "Insulin Pump", floor: "Floor 2 - Endocrinology", room: "Room 206", firmware_version: "v1.9.0", battery_level: 89, cpu_usage: 22.0, network_traffic_kbps: 60.0, auth_attempts: 0, cert_status: "Expired", command_frequency: 1.0, device_status: "Warning", network_trust_score: 74.0, device_criticality: "High", is_isolated: false, last_seen: new Date().toISOString(), patient: FALLBACK_PATIENTS[4] },
  { id: 6, device_uid: "WEAR-115", name: "BioIntelliSense BioButton Wearable", device_type: "Wearable", floor: "Floor 1 - Ward B", room: "Ward B Room 14", firmware_version: "v2.1.0", battery_level: 94, cpu_usage: 14.0, network_traffic_kbps: 35.0, auth_attempts: 0, cert_status: "Valid", command_frequency: 1.0, device_status: "Normal", network_trust_score: 94.0, device_criticality: "Moderate", is_isolated: false, last_seen: new Date().toISOString(), patient: FALLBACK_PATIENTS[5] }
];

const FALLBACK_INCIDENTS = [
  { id: 1, incident_number: "INC-2026-001", title: "Untrusted External Socket Attempt on Active ICU Ventilator", description: "Ventilator VENT-016 in ICU Room 08 initiated persistent outbound SYN packets. Automatic shutdown prohibited.", device_id: 1, patient_id: 1, severity: "Critical", status: "Open", assigned_to: "elena.rostova@hospital.internal", clinician_approval_required: true, clinician_approved: false, created_at: new Date().toISOString() },
  { id: 2, incident_number: "INC-2026-002", title: "Unpatched FreeRTOS TCP Vulnerability (CVE-2026-1049)", description: "Infusion Pump INF-204 buffer overflow hazard.", device_id: 2, patient_id: 2, severity: "High", status: "Investigating", assigned_to: "marcus.vance@hospital.internal", clinician_approval_required: true, clinician_approved: false, created_at: new Date().toISOString() },
  { id: 3, incident_number: "INC-2026-003", title: "Cryptographic Certificate Expiry on Insulin Pump", description: "Insulin Pump GLU-071 expired mutual TLS validation.", device_id: 5, patient_id: 5, severity: "Medium", status: "Contained", assigned_to: "elena.rostova@hospital.internal", clinician_approval_required: false, clinician_approved: true, created_at: new Date().toISOString() }
];

const FALLBACK_ANOMALIES = [
  { id: 1, device_id: 1, device_uid: "VENT-016", anomaly_type: "Untrusted Endpoint Connection", anomaly_score: 0.96, confidence_score: 0.98, threat_severity: "Critical", explanation: "Ventilator attempted connection to unauthorized host 198.51.100.74:4444.", patient_safety_impact: "Patient Arthur Pendelton requires mechanical ventilation (ARDS). Automated device shutdown prohibited.", recommended_action: "Do not power off. Restrict egress to local ICU telemetry VLAN.", is_resolved: false, timestamp: new Date().toISOString() },
  { id: 2, device_id: 2, device_uid: "INF-204", anomaly_type: "Outdated Firmware Vulnerability", anomaly_score: 0.82, confidence_score: 0.94, threat_severity: "High", explanation: "FreeRTOS TCP stack unpatched vulnerability CVE-2026-1049.", patient_safety_impact: "Infusion rate tampering hazard.", recommended_action: "Schedule maintenance during handoff.", is_resolved: false, timestamp: new Date().toISOString() }
];

export const api = {
  // Auth
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // Fallback
    }
    const role = email.includes('admin') ? 'administrator' : email.includes('analyst') ? 'security_analyst' : 'clinician';
    return {
      access_token: 'demo-jwt-token-2026',
      token_type: 'bearer',
      user: {
        id: 1,
        username: email.split('@')[0],
        email: email,
        full_name: role === 'administrator' ? 'Marcus Vance, CISSP' : role === 'security_analyst' ? 'Elena Rostova, GCIH' : 'Dr. Sarah Chen, MD',
        role: role,
        department: 'Biomedical Cyber-Physical Security'
      }
    };
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      id: 1,
      username: 'admin',
      email: 'admin@medsentinel.hospital',
      full_name: 'Marcus Vance, CISSP',
      role: 'administrator',
      department: 'Hospital Security'
    };
  },

  // Devices
  async getDevices(params?: any) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/devices${query ? `?${query}` : ''}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return FALLBACK_DEVICES;
  },

  async getSummaryStats() {
    try {
      const res = await fetch(`${API_BASE}/devices/summary/stats`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      total_devices: 25,
      secure_devices: 21,
      attention_devices: 4,
      critical_alerts: 1,
      average_safety_risk_score: 28.4
    };
  },

  async getDeviceDetail(deviceId: number) {
    try {
      const res = await fetch(`${API_BASE}/devices/${deviceId}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    const dev = FALLBACK_DEVICES.find(d => d.id === deviceId) || FALLBACK_DEVICES[0];
    return {
      ...dev,
      latest_telemetry: {
        heart_rate: 120,
        spo2: 94,
        systolic_bp: 100,
        diastolic_bp: 70,
        capnography_etco2: 39,
        respiratory_rate: 10,
        cpu_load: dev.cpu_usage,
        network_traffic_kbps: dev.network_traffic_kbps
      },
      latest_safety_assessment: {
        safety_risk_score: dev.device_status === 'Critical' ? 91.0 : dev.device_status === 'Warning' ? 62.0 : 22.0,
        risk_level: dev.device_status === 'Critical' ? 'Critical' : dev.device_status === 'Warning' ? 'High' : 'Low',
        device_criticality_factor: 3.0,
        threat_severity_factor: 4.5,
        patient_condition_factor: 3.5,
        vulnerability_factor: 15.0,
        network_risk_factor: 12.0,
        treatment_continuity_protection: 10.0,
        explanation: "Critical patient on mechanical ventilation. Device criticality 3.0x, Threat severity 4.5x, Patient condition 3.5x.",
        recommended_response: "DO NOT SHUT DOWN DEVICE. Restrict network egress to local ICU telemetry VLAN. Require clinician dual-key approval."
      },
      vulnerabilities: [
        { cve_id: "CVE-2026-1049", title: "FreeRTOS TCP Stack Buffer Overflow", cvss_score: 8.8, severity: "High", remediation_steps: "Apply security patch v10.4.3-p2" }
      ]
    };
  },

  async getDeviceTelemetry(deviceId: number, limit = 50) {
    try {
      const res = await fetch(`${API_BASE}/devices/${deviceId}/telemetry?limit=${limit}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(Date.now() - (20 - i) * 2000).toISOString(),
      network_traffic_kbps: 45 + Math.sin(i) * 15,
      cpu_load: 18 + Math.cos(i) * 5
    }));
  },

  async isolateDevice(deviceId: number, reason: string) {
    try {
      const res = await fetch(`${API_BASE}/devices/${deviceId}/isolate?reason=${encodeURIComponent(reason)}`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { message: "Safe ICU VLAN Network Isolation Applied (Power and ventilation maintained)." };
  },

  async reconnectDevice(deviceId: number) {
    try {
      const res = await fetch(`${API_BASE}/devices/${deviceId}/reconnect`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { message: "Device network access restored." };
  },

  // Patients
  async getPatients() {
    try {
      const res = await fetch(`${API_BASE}/patients`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return FALLBACK_PATIENTS;
  },

  async getPatientDetail(patientId: number) {
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return FALLBACK_PATIENTS.find(p => p.id === patientId) || FALLBACK_PATIENTS[0];
  },

  async acknowledgePatientAlert(patientId: number) {
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/acknowledge-alert`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { message: "Patient alert acknowledged by clinician." };
  },

  // Threats & Risk Engine
  async getAnomalies(severity?: string) {
    try {
      const query = severity ? `?severity=${severity}` : '';
      const res = await fetch(`${API_BASE}/threats${query}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return FALLBACK_ANOMALIES;
  },

  async getSafetyAssessments() {
    try {
      const res = await fetch(`${API_BASE}/threats/safety-assessments`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return [];
  },

  async calculateRisk(params: any) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/threats/calculate?${query}`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch (e) {}

    // Client-side formula calculation
    const critMap: any = { 'Low': 1.0, 'Moderate': 1.5, 'High': 2.2, 'Life-Critical': 3.0 };
    const threatMap: any = { 'None': 0.5, 'Low': 1.0, 'Medium': 2.0, 'High': 3.2, 'Critical': 4.5 };
    const condMap: any = { 'Stable': 1.0, 'Warning': 2.0, 'Critical': 3.5 };

    const dc = critMap[params.device_criticality] || 2.2;
    const ts = threatMap[params.threat_severity] || 3.2;
    const pc = condMap[params.patient_condition] || 2.0;

    let base = Math.min(50, dc * ts * pc * 1.05);
    let vuln = ((params.max_cvss_score || 7.0) / 10.0) * 20.0;
    let net = (100 - (params.network_trust_score || 50)) * 0.20;
    let prot = 10.0;

    let score = Math.round(Math.max(5.0, Math.min(100.0, (base + vuln + net) - prot)));
    let lvl = score >= 80 ? 'Critical' : score >= 60 ? 'High' : score >= 30 ? 'Moderate' : 'Low';

    return {
      safety_risk_score: score,
      risk_level: lvl,
      device_criticality_factor: dc,
      threat_severity_factor: ts,
      patient_condition_factor: pc,
      vulnerability_factor: vuln,
      network_risk_factor: net,
      treatment_continuity_protection: prot,
      explanation: `Device Criticality: ${params.device_criticality} (${dc}x), Threat: ${params.threat_severity} (${ts}x), Patient Condition: ${params.patient_condition} (${pc}x).`,
      recommended_response: dc >= 2.2 && lvl === 'Critical'
        ? "DO NOT SHUT DOWN DEVICE. Restrict network egress to local ICU telemetry VLAN. Require clinician dual-key approval."
        : "Apply micro-segmentation rules and schedule patch review."
    };
  },

  // Incidents
  async getIncidents(params?: any) {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/incidents${query ? `?${query}` : ''}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return FALLBACK_INCIDENTS;
  },

  async getIncidentDetail(id: number) {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return FALLBACK_INCIDENTS.find(i => i.id === id) || FALLBACK_INCIDENTS[0];
  },

  async updateIncident(id: number, data: any) {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}`, {
        method: 'PATCH',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const inc = FALLBACK_INCIDENTS.find(i => i.id === id);
    if (inc) Object.assign(inc, data);
    return inc;
  },

  async approveIncident(id: number) {
    try {
      const res = await fetch(`${API_BASE}/incidents/${id}/clinician-approve`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const inc = FALLBACK_INCIDENTS.find(i => i.id === id);
    if (inc) inc.clinician_approved = true;
    return { message: "Clinician dual-key authorization granted." };
  },

  // SBOM
  async getSbom() {
    try {
      const res = await fetch(`${API_BASE}/sbom`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { id: 1, component_name: "FreeRTOS Kernel", vendor: "AWS / FreeRTOS", version: "v10.4.3", latest_version: "v10.6.1", component_type: "Real-Time OS", license: "MIT" },
      { id: 2, component_name: "OpenSSL Cryptographic Toolkit", vendor: "OpenSSL Project", version: "v1.1.1u", latest_version: "v3.2.1", component_type: "Cryptographic Library", license: "Apache-2.0" },
      { id: 3, component_name: "lwIP Lightweight TCP/IP Stack", vendor: "Swedish Institute of CS", version: "v2.1.2", latest_version: "v2.2.0", component_type: "Network Stack", license: "BSD-3-Clause" },
      { id: 4, component_name: "mbedTLS", vendor: "TrustedFirmware.org", version: "v2.28.1", latest_version: "v3.5.0", component_type: "TLS Library", license: "Apache-2.0" },
      { id: 5, component_name: "Nordic SoftDevice BLE Stack", vendor: "Nordic Semiconductor", version: "v7.2.0", latest_version: "v8.0.0", component_type: "BLE Wireless Driver", license: "Proprietary" }
    ];
  },

  async getVulnerabilities() {
    try {
      const res = await fetch(`${API_BASE}/sbom/vulnerabilities`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { id: 1, cve_id: "CVE-2026-1049", title: "FreeRTOS Buffer Overflow in TCP Packet Parsing", cvss_score: 8.8, severity: "High", patch_status: "Available", remediation_steps: "Apply security patch v10.4.3-p2; restrict inbound medical VLAN packets." },
      { id: 2, cve_id: "CVE-2025-4128", title: "OpenSSL Weak Cipher Negotiation & Timing Attack", cvss_score: 6.5, severity: "Medium", patch_status: "Available", remediation_steps: "Disable RSA key exchanges; enforce TLS 1.3 ECDHE cipher suites." },
      { id: 3, cve_id: "CVE-2026-3022", title: "lwIP DNS Cache Poisoning Flaw", cvss_score: 7.5, severity: "High", patch_status: "Available", remediation_steps: "Deploy DNS transaction ID randomization hotfix." }
    ];
  },

  // Simulator
  async triggerScenario(scenarioId: string, deviceId?: number) {
    try {
      const res = await fetch(`${API_BASE}/simulation/trigger`, {
        method: 'POST',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenarioId, device_id: deviceId })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { scenario_id: scenarioId, status: "Active" };
  },

  async resetSimulation() {
    try {
      const res = await fetch(`${API_BASE}/simulation/reset`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { message: "Simulation reset to baseline." };
  },

  async getSimulationStatus() {
    try {
      const res = await fetch(`${API_BASE}/simulation/status`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      active_scenario: "scenario_1",
      available_scenarios: [
        { id: "scenario_1", title: "Scenario 1: Stable Patient Normal", target_uid: "CARD-042", threat_severity: "None", description: "ECG monitor operates normally." },
        { id: "scenario_2", title: "Scenario 2: Infusion Pump Vulnerability", target_uid: "INF-204", threat_severity: "High", description: "Outdated FreeRTOS component detected." },
        { id: "scenario_3", title: "Scenario 3: Ventilator Network Threat", target_uid: "VENT-016", threat_severity: "Critical", description: "Ventilator detects untrusted socket. Patient safety protection active." },
        { id: "scenario_4", title: "Scenario 4: Wearable Auth Brute Force", target_uid: "WEAR-115", threat_severity: "High", description: "8 failed TLS handshakes detected." },
        { id: "scenario_7", title: "Scenario 7: Critical Arrhythmia Event", target_uid: "VENT-016", threat_severity: "Critical", description: "SpO2 drop and tachycardia." }
      ]
    };
  },

  async getAuditLogs(limit = 50) {
    try {
      const res = await fetch(`${API_BASE}/simulation/audit-logs?limit=${limit}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { id: 1, timestamp: new Date().toISOString(), actor_name: "MedSentinel Safety Engine", actor_role: "system", action: "CONTINUITY_ENFORCEMENT", details: "Treatment continuity protection applied to Ventilator VENT-016. Power preserved.", ip_address: "10.240.104.1" },
      { id: 2, timestamp: new Date().toISOString(), actor_name: "Marcus Vance, CISSP", actor_role: "administrator", action: "SYSTEM_INITIALIZATION", details: "MedSentinel CPS platform initialized.", ip_address: "10.240.10.1" }
    ];
  },

  async getPolicies() {
    try {
      const res = await fetch(`${API_BASE}/simulation/policies`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      { id: 1, policy_code: "POL-CPS-01", title: "Patient Safety Treatment Continuity Exception", description: "Life-support devices must NEVER be automatically disconnected from power during cyber events." },
      { id: 2, policy_code: "POL-CPS-02", title: "Zero-Trust Medical VLAN Ingress Enforcement", description: "All connected devices must communicate exclusively through micro-VLANs with mutual TLS." },
      { id: 3, policy_code: "POL-CPS-03", title: "Dual-Key Authorization for Firmware Changes", description: "Applying changes to devices on Critical patients requires sign-off from engineer and clinician." }
    ];
  }
};
