import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PlayCircle, RotateCcw, ShieldAlert, Cpu, HeartPulse, CheckCircle2, FileText, AlertOctagon } from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';

export const SimulatorPage: React.FC = () => {
  const [status, setStatus] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [activeNotice, setActiveNotice] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const [st, logs, pol] = await Promise.all([
        api.getSimulationStatus(),
        api.getAuditLogs(20),
        api.getPolicies()
      ]);
      setStatus(st);
      setAuditLogs(logs);
      setPolicies(pol);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = async (scId: string, title: string) => {
    try {
      await api.triggerScenario(scId);
      setActiveNotice(`Injected Scenario: ${title}`);
      fetchStatus();
      setTimeout(() => setActiveNotice(null), 4000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReset = async () => {
    try {
      await api.resetSimulation();
      setActiveNotice("Reset all telemetry and device states to baseline nominal.");
      fetchStatus();
      setTimeout(() => setActiveNotice(null), 4000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1">
            <PlayCircle className="w-4 h-4 text-cyan-400" />
            <span>Cyber-Physical Telemetry & Attack Injector</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Live Telemetry & Scenario Simulator
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl mt-1">
            Simulate realistic hardware compromises, brute-force attacks, untrusted network sockets, and patient physiological distress events.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-2 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Fleet to Nominal</span>
        </button>
      </div>

      {activeNotice && (
        <div className="bg-cyan-950/70 border border-cyan-500/50 p-3 rounded-lg text-cyan-300 text-xs font-medium animate-fade-in flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{activeNotice}</span>
        </div>
      )}

      {/* Preset Scenarios Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-cyan-400" />
          Available Demonstration Scenarios (Click to Inject into Live System)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {status?.available_scenarios?.map((sc: any) => {
            const isActive = status.active_scenario === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => handleTrigger(sc.id, sc.title)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/20 shadow-lg ring-2 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase">{sc.target_uid}</span>
                    <RiskBadge level={sc.threat_severity} size="sm" />
                  </div>
                  <h3 className="font-bold text-white text-xs leading-snug">{sc.title}</h3>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">{sc.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {isActive ? 'ACTIVE IN TELEMETRY' : 'READY TO TRIGGER'}
                  </span>
                  <button className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px]">
                    Inject →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Policies & Immutable Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Enforced Security Policies (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Enforced Cybersecurity Policies
          </h2>
          <div className="space-y-2 text-xs">
            {policies.map((p) => (
              <div key={p.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-400 font-bold">{p.policy_code}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40">
                    ENFORCED
                  </span>
                </div>
                <div className="font-bold text-white">{p.title}</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Audit Logs (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Immutable Audit Trail & Compliance Log
          </h2>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono space-y-0.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-cyan-400 font-semibold">{log.action}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-slate-300 font-sans text-xs">{log.details}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Actor: {log.actor_name} ({log.actor_role}) • IP: {log.ip_address}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

