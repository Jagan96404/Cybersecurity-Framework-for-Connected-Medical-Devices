import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Heart, ShieldAlert, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';

export const PatientSafetyPage: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ackNotice, setAckNotice] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAcknowledge = async (patientId: number, name: string) => {
    try {
      await api.acknowledgePatientAlert(patientId);
      setAckNotice(`Clinical acknowledgement logged for ${name}. Dual-key safety verification active.`);
      setTimeout(() => setAckNotice(null), 4000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Clinical Continuity & Life-Support Guard</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Patient Safety Center & Treatment Continuity
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl mt-1">
            MedSentinel enforces safety decisions that protect treatment continuity. Life-support devices are never automatically disconnected during cyber incidents.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Automatic Disconnect Block: <strong>ENFORCED</strong></span>
        </div>
      </div>

      {ackNotice && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-lg text-emerald-300 text-xs font-medium animate-fade-in flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{ackNotice}</span>
        </div>
      )}

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((pat) => {
          const isCrit = pat.condition_status === 'Critical';
          const isWarn = pat.condition_status === 'Warning';

          return (
            <div
              key={pat.id}
              className={`p-5 rounded-xl border transition flex flex-col justify-between ${
                isCrit
                  ? 'bg-red-950/20 border-red-500/40 shadow-red-900/10'
                  : isWarn
                  ? 'bg-amber-950/10 border-amber-500/30'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold">{pat.patient_uid}</span>
                    <h3 className="text-base font-black text-white">{pat.full_name}</h3>
                    <div className="text-xs text-slate-400 font-medium">
                      {pat.age} y/o {pat.gender} • {pat.room} ({pat.bed})
                    </div>
                  </div>
                  <RiskBadge level={pat.condition_status} size="sm" />
                </div>

                {/* Clinical Diagnosis & Treatment */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block">Diagnosis:</span>
                    <span className="font-semibold text-slate-200">{pat.diagnosis}</span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 text-[11px] block">Treatment Dependency:</span>
                    <span className="font-bold text-rose-300">{pat.treatment_dependency}</span>
                  </div>
                </div>
              </div>

              {/* Treatment Continuity Rule & Clinician Action */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2.5">
                <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Continuity Status: <strong className="text-white">Active Protection</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleAcknowledge(pat.id, pat.full_name)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Clinician Acknowledge Alert</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

