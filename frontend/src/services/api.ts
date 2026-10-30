const API_BASE = '/api/v1';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('medsentinel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<any>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  // Devices
  async getDevices(params?: { device_type?: string; status?: string; criticality?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/devices${query ? `?${query}` : ''}`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  async getSummaryStats() {
    const res = await fetch(`${API_BASE}/devices/summary/stats`, {
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  async getDeviceDetail(deviceId: number) {
    const res = await fetch(`${API_BASE}/devices/${deviceId}`, {
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  async getDeviceTelemetry(deviceId: number, limit = 50) {
    const res = await fetch(`${API_BASE}/devices/${deviceId}/telemetry?limit=${limit}`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  async isolateDevice(deviceId: number, reason: string) {
    const res = await fetch(`${API_BASE}/devices/${deviceId}/isolate?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  async reconnectDevice(deviceId: number) {
    const res = await fetch(`${API_BASE}/devices/${deviceId}/reconnect`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  // Patients
  async getPatients() {
    const res = await fetch(`${API_BASE}/patients`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  async getPatientDetail(patientId: number) {
    const res = await fetch(`${API_BASE}/patients/${patientId}`, {
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  async acknowledgePatientAlert(patientId: number) {
    const res = await fetch(`${API_BASE}/patients/${patientId}/acknowledge-alert`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  // Threats
  async getAnomalies(severity?: string) {
    const query = severity ? `?severity=${severity}` : '';
    const res = await fetch(`${API_BASE}/threats${query}`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  async getSafetyAssessments() {
    const res = await fetch(`${API_BASE}/threats/safety-assessments`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  async calculateRisk(params: any) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/threats/calculate?${query}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  // Incidents
  async getIncidents(params?: { status?: string; severity?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/incidents${query ? `?${query}` : ''}`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  async getIncidentDetail(id: number) {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  async updateIncident(id: number, data: any) {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  async approveIncident(id: number) {
    const res = await fetch(`${API_BASE}/incidents/${id}/clinician-approve`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  // SBOM
  async getSbom() {
    const res = await fetch(`${API_BASE}/sbom`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  async getVulnerabilities() {
    const res = await fetch(`${API_BASE}/sbom/vulnerabilities`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  // Simulation
  async triggerScenario(scenarioId: string, deviceId?: number) {
    const res = await fetch(`${API_BASE}/simulation/trigger`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ scenario_id: scenarioId, device_id: deviceId })
    });
    return handleResponse<any>(res);
  },

  async resetSimulation() {
    const res = await fetch(`${API_BASE}/simulation/reset`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  async getSimulationStatus() {
    const res = await fetch(`${API_BASE}/simulation/status`, {
      headers: getAuthHeader()
    });
    return handleResponse<any>(res);
  },

  async getAuditLogs(limit = 50) {
    const res = await fetch(`${API_BASE}/simulation/audit-logs?limit=${limit}`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  },

  async getPolicies() {
    const res = await fetch(`${API_BASE}/simulation/policies`, {
      headers: getAuthHeader()
    });
    return handleResponse<any[]>(res);
  }
};
