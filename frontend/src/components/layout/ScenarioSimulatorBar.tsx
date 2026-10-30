import React, { useState } from 'react';
import { Play, RotateCcw, AlertOctagon, ShieldAlert, Cpu, HeartPulse, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

export const ScenarioSimulatorBar: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<string>('scenario_1');
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleTrigger = async (scId: string, label: string) => {
    setLoading(true);
    try {
      await api.triggerScenario(scId);
      setActiveScenario(scId);
      setNotification(`Scenario Triggered: ${label}`);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await api.resetSimulation();
      setActiveScenario('scenario_1');
      setNotification('CPS Simulation Reset to Baseline Normal.');
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-2">
      <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left Label */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold font-mono text-[11px]">
            <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
            <span>SCENARIO CONTROLLER:</span>
          </div>
          {notification && (
            <span className="text-[11px] text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded animate-fade-in font-medium">
              {notification}
            </span>
          )}
        </div>

        {/* Buttons for Scenarios */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleTrigger('scenario_1', 'Normal Baseline')}
            disabled={loading}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${
              activeScenario === 'scenario_1'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle className="w-3 h-3 text-emerald-300" />
            1. Normal Stable
          </button>

          <button
            onClick={() => handleTrigger('scenario_2', 'Infusion Pump Vulnerability')}
            disabled={loading}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${
              activeScenario === 'scenario_2'
                ? 'bg-amber-600 text-white font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Cpu className="w-3 h-3 text-amber-300" />
            2. Pump Firmware Vuln
          </button>

          <button
            onClick={() => handleTrigger('scenario_3', 'Ventilator Threat (Patient Protected)')}
            disabled={loading}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${
              activeScenario === 'scenario_3'
                ? 'bg-red-600 text-white font-bold shadow animate-pulse'
                : 'bg-red-950/50 text-red-200 border border-red-800/40 hover:bg-red-900/60'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-red-400" />
            3. Ventilator Threat (Protected)
          </button>

          <button
            onClick={() => handleTrigger('scenario_4', 'Wearable Brute Force')}
            disabled={loading}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${
              activeScenario === 'scenario_4'
                ? 'bg-amber-600 text-white font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <AlertOctagon className="w-3 h-3 text-amber-300" />
            4. Wearable Auth Fail
          </button>

          <button
            onClick={() => handleTrigger('scenario_7', 'Critical Arrhythmia Event')}
            disabled={loading}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition flex items-center gap-1 ${
              activeScenario === 'scenario_7'
                ? 'bg-purple-600 text-white font-bold shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <HeartPulse className="w-3 h-3 text-purple-300" />
            7. Vitals Desaturation
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            title="Reset to Baseline"
            className="px-2.5 py-1 rounded text-[11px] font-medium bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};
