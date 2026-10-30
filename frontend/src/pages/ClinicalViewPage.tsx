import React, { useState, useEffect } from 'react';
import { ClinicalMonitorView } from '../components/clinical-view/ClinicalMonitorView';
import { api } from '../services/api';
import { ShieldCheck, ShieldAlert, AlertTriangle, Monitor, Activity, User, Heart } from 'lucide-react';

export const ClinicalViewPage: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(1);
  const [isCyberThreatActive, setIsCyberThreatActive] = useState<boolean>(false);
  const [heartRate, setHeartRate] = useState<number>(120);
  const [spo2, setSpo2] = useState<number>(94);
  const [systolicBp, setSystolicBp] = useState<number>(100);
  const [diastolicBp, setDiastolicBp] = useState<number>(70);
  const [etco2, setEtco2] = useState<number>(39);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(10);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.getPatients();
        setPatients(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPatients();
  }, []);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || {
    full_name: "Arthur Pendelton",
    patient_uid: "PAT-101",
    room: "ICU Room 08",
    condition_status: "Critical",
    treatment_dependency: "Active Mechanical Ventilation"
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Infirmary Integrated • Clinical Telemetry System View</span>
          </div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Monitor className="w-5 h-5 text-rose-500" />
            Hospital Multi-Parameter Patient Monitor System
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Synchronized 4-quadrant bedside monitoring system with MedSentinel CPS Cyber-Physical telemetry guard.
          </p>
        </div>

        {/* Patient Bedside Selector & Cyber Attack Simulator Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Bedside:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(Number(e.target.value))}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.room} — {p.full_name} ({p.condition_status})
                </option>
              ))}
            </select>
          </div>

          {/* Cyber Tampering Toggle */}
          <button
            onClick={() => setIsCyberThreatActive(!isCyberThreatActive)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
              isCyberThreatActive
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {isCyberThreatActive ? (
              <>
                <ShieldAlert className="w-4 h-4 text-white" />
                <span>CYBER TAMPERING ACTIVE (JITTER INJECTED)</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Simulate Telemetry Cyber Attack</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cyber-Physical Safety Status Notification Banner */}
      {isCyberThreatActive ? (
        <div className="bg-red-950/40 border-2 border-red-500/60 rounded-xl p-4 shadow-xl flex items-start justify-between gap-4 text-red-200 text-xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-600 rounded-lg text-white mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-sm text-red-100 flex items-center gap-2">
                <span>MEDSENTINEL CPS ALERT: UNTRUSTED PACKET INJECTION DETECTED</span>
                <span className="px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-mono font-black">
                  RISK SCORE: 91 / 100 [CRITICAL]
                </span>
              </div>
              <p className="text-red-300">
                Patient <strong className="text-white">{selectedPatient.full_name}</strong> in {selectedPatient.room} requires active ventilation and medication continuity.
              </p>
              <div className="font-semibold text-white bg-red-900/60 px-3 py-1.5 rounded border border-red-700/50 mt-1 inline-block">
                PATIENT SAFETY ENGINE RULE: AUTOMATIC DEVICE SHUTDOWN IS PROHIBITED. NETWORK EGRESS RESTRICTED TO ICU LOCAL VLAN ONLY.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Zero-Trust Status: Normal.</strong> Bedside monitor telemetry streams cryptographically verified by MedSentinel Hospital Root CA.
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400 font-semibold">
            CONTINUITY PROTECTION: ACTIVE
          </span>
        </div>
      )}

      {/* The 4-Quadrant Clinical Monitor View (Matching Reference Screenshot) */}
      <ClinicalMonitorView
        deviceUid="VENT-016 / INF-204 / CARD-042"
        patientName={`${selectedPatient.full_name} (${selectedPatient.room})`}
        heartRate={isCyberThreatActive ? 142 : heartRate}
        spo2={isCyberThreatActive ? 88 : spo2}
        systolicBp={systolicBp}
        diastolicBp={diastolicBp}
        etco2={etco2}
        respiratoryRate={respiratoryRate}
        isCyberThreatActive={isCyberThreatActive}
      />
    </div>
  );
};

