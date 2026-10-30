import React, { useState } from 'react';
import { CardiacMonitor } from './CardiacMonitor';
import { FetalMonitor } from './FetalMonitor';
import { DiagnosticECG12Lead } from './DiagnosticECG12Lead';
import { MedicationAdminRecord } from './MedicationAdminRecord';
import { Activity, ShieldCheck, AlertTriangle, Monitor, Maximize2, Minimize2 } from 'lucide-react';

interface ClinicalMonitorViewProps {
  deviceUid?: string;
  patientName?: string;
  heartRate?: number;
  spo2?: number;
  systolicBp?: number;
  diastolicBp?: number;
  etco2?: number;
  respiratoryRate?: number;
  isCyberThreatActive?: boolean;
}

export const ClinicalMonitorView: React.FC<ClinicalMonitorViewProps> = ({
  deviceUid = "VENT-016 / INF-204 / CARD-042",
  patientName = "Arthur Pendelton (ICU Room 08)",
  heartRate = 120,
  spo2 = 94,
  systolicBp = 100,
  diastolicBp = 70,
  etco2 = 39,
  respiratoryRate = 10,
  isCyberThreatActive = false
}) => {
  const [activePanel, setActivePanel] = useState<'all' | 'cardiac' | 'fetal' | 'ecg12' | 'mar'>('all');

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* View Mode Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
            <Monitor className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-100 flex items-center gap-2">
              <span>Hospital Clinical Telemetry & Output Monitor System</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                SIMULATED DATA ONLY
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Active Unit: {patientName} • Associated Hardware: {deviceUid}
            </div>
          </div>
        </div>

        {/* Mode selector buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded border border-slate-800">
          <button
            onClick={() => setActivePanel('all')}
            className={`px-2.5 py-1 rounded transition text-xs font-medium ${
              activePanel === 'all' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            4-Quadrant Grid (Reference View)
          </button>
          <button
            onClick={() => setActivePanel('cardiac')}
            className={`px-2.5 py-1 rounded transition text-xs font-medium ${
              activePanel === 'cardiac' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Cardiac Monitor
          </button>
          <button
            onClick={() => setActivePanel('fetal')}
            className={`px-2.5 py-1 rounded transition text-xs font-medium ${
              activePanel === 'fetal' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            External Fetal
          </button>
          <button
            onClick={() => setActivePanel('ecg12')}
            className={`px-2.5 py-1 rounded transition text-xs font-medium ${
              activePanel === 'ecg12' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            12-Lead ECG
          </button>
          <button
            onClick={() => setActivePanel('mar')}
            className={`px-2.5 py-1 rounded transition text-xs font-medium ${
              activePanel === 'mar' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Medication Record (MAR)
          </button>
        </div>
      </div>

      {/* Panels Layout matching reference image */}
      {activePanel === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1">
          {/* Top-Left: Infirmary Integrated: Cardiac Monitor */}
          <div className="min-h-[360px]">
            <CardiacMonitor
              heartRate={heartRate}
              systolicBp={systolicBp}
              diastolicBp={diastolicBp}
              spo2={spo2}
              etco2={etco2}
              respiratoryRate={respiratoryRate}
              isCyberCompromised={isCyberThreatActive}
            />
          </div>

          {/* Top-Right: Infirmary Integrated: External Fetal Monitor */}
          <div className="min-h-[360px]">
            <FetalMonitor baselineFhr={138} />
          </div>

          {/* Bottom-Left: Infirmary Integrated: Electrocardiogram (12-Lead) */}
          <div className="min-h-[360px]">
            <DiagnosticECG12Lead heartRate={heartRate} />
          </div>

          {/* Bottom-Right: Medication Administration Record (MAR) */}
          <div className="min-h-[360px]">
            <MedicationAdminRecord
              patientName={patientName.split('(')[0].trim()}
              patientMrn="MRN-842-1092-B"
            />
          </div>
        </div>
      )}

      {activePanel === 'cardiac' && (
        <div className="h-[650px]">
          <CardiacMonitor
            heartRate={heartRate}
            systolicBp={systolicBp}
            diastolicBp={diastolicBp}
            spo2={spo2}
            etco2={etco2}
            respiratoryRate={respiratoryRate}
            isCyberCompromised={isCyberThreatActive}
          />
        </div>
      )}

      {activePanel === 'fetal' && (
        <div className="h-[650px]">
          <FetalMonitor baselineFhr={138} />
        </div>
      )}

      {activePanel === 'ecg12' && (
        <div className="h-[650px]">
          <DiagnosticECG12Lead heartRate={heartRate} />
        </div>
      )}

      {activePanel === 'mar' && (
        <div className="h-[650px]">
          <MedicationAdminRecord
            patientName={patientName.split('(')[0].trim()}
            patientMrn="MRN-842-1092-B"
          />
        </div>
      )}
    </div>
  );
};
