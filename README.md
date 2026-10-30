# MedSentinel CPS: Cybersecurity Framework for Connected Medical Devices

![MedSentinel Banner](https://img.shields.io/badge/System-Cyber--Physical-0284c7?style=for-the-badge)
![Status](https://img.shields.io/badge/Compliance-FDA%20IoMT%20Zero--Trust-10b981?style=for-the-badge)
![Framework](https://img.shields.io/badge/Stack-FastAPI%20%2B%20React%20%2B%20Tailwind-8b5cf6?style=for-the-badge)

MedSentinel CPS is a full-stack Cyber-Physical System (CPS) and hospital cybersecurity platform designed to protect connected medical devices (ventilators, infusion pumps, cardiac monitors, insulin pumps, wearables, defibrillators) while strictly guaranteeing **patient safety and treatment continuity**.

---

## Key Features

1. **Patient Safety Risk Engine**:
   $$\text{Safety Risk Score} = (\text{Device Criticality} \times \text{Cyber Threat} \times \text{Patient Condition}) + \text{Vulnerability Severity} + \text{Network Trust Risk} - \text{Treatment Continuity Protection}$$
   - **Crucial Safety Rule**: Life-support equipment (mechanical ventilators, inotropic pumps) is **never automatically powered off or severed** during active treatment. Automated actions enforce local ICU micro-VLAN isolation while preserving vital therapy.

2. **Synchronized Clinical Monitor Output View (Reference System)**:
   - **Cardiac Monitor**: 60 FPS real-time animated Canvas waveforms (Green ECG Lead II, White NIBP, Amber SpO2 Plethysmograph, Cyan Capnography).
   - **External Fetal Monitor**: Dual-trace continuous Fetal Heart Rate (bpm 60–240) and Tocodynamometer contraction curves on calibrated red medical millimeter grid paper.
   - **12-Lead Diagnostic ECG Strip**: Standard 12-lead layout (I, II, III, aVR, aVL, aVF, V1–V6) on clinical pink grid.
   - **Medication Administration Record (MAR)**: Hourly schedule, infusion pump delivery tracking, and cyber-tampering anomaly blocks.

3. **Hospital Digital Twin**:
   - Interactive spatial 2.5D floor plan across ICU, Cardiology, NICU, Operating Room, and General Ward with real-time status nodes (Green, Yellow, Red, Gray).

4. **Threat Detection & Incident Response**:
   - Hybrid anomaly detection combining scikit-learn Isolation Forest with deterministic clinical heuristics.
   - Interactive Kanban Incident lifecycle board with **Dual-Key Clinician Authorization**.

5. **SBOM & Vulnerability Management**:
   - Software Bill of Materials (SBOM) component tracker mapped to simulated CVEs and patient-impact-weighted patch prioritization.

6. **Interactive Telemetry & Scenario Simulator**:
   - 8 one-click presets: Normal Baseline, Infusion Pump Outdated Firmware, Ventilator Network Threat, Wearable Brute Force, Expired Certificate, Network Traffic Spike, Arrhythmia / Desaturation, Device Offline.

---

## Quick Start (Local Run)

### Prerequisites:
- Python 3.10+
- Node.js 18+ & npm

### Method 1: One-Click Launch (Windows)
Double-click `run_dev.bat` or run in PowerShell:
```powershell
.\run_dev.ps1
```

### Method 2: Manual Step-by-Step

#### Step 1: Start Python Backend
```bash
cd backend
python -m pip install -r requirements.txt
python seed.py
python -m uvicorn app.main:app --port 8000 --reload
```
- API Documentation & Swagger UI: `http://127.0.0.1:8000/docs`
- WebSocket Telemetry Stream: `ws://127.0.0.1:8000/ws/telemetry`

#### Step 2: Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
- Access the platform at: `http://localhost:5173`

---

## Docker Compose Launch

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/docs`
- PostgreSQL Database: `localhost:5432`

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator (CISO)** | `admin@medsentinel.hospital` | `Admin@123` |
| **Security Analyst (SOC)** | `analyst@medsentinel.hospital` | `Analyst@123` |
| **Clinician (ICU Attending)** | `clinician@medsentinel.hospital` | `Clinician@123` |

*Note: You can switch roles instantly at any time using the "Active Role" switcher in the top navigation bar.*

---

## Simulated Seed Data Overview
- **25 Medical Devices**: Dräger Evita ventilators, Alaris Medley infusion pumps, Philips IntelliVue cardiac monitors, Medtronic insulin pumps, ZOLL defibrillators, and BioIntelliSense wearables.
- **15 Clinical Patients**: Detailed diagnoses, departments, rooms, and acute condition states (Stable, Warning, Critical).
- **20 SBOM Components**: FreeRTOS, OpenSSL, lwIP, mbedTLS, Nordic BLE, BusyBox, etc.
- **15 Simulated Vulnerabilities**: Realistic CVE records with CVSS scores and clinical patch priorities.
- **12 Sample Incidents**: Distributed across Open, Investigating, Contained, Resolved, and False Positive stages.

---

## Academic Documentation & Defense
Detailed architecture, ER diagrams, 12-slide presentation outline, and viva questions are available in:
[`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md)

