import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AlertTriangle, ShieldAlert, Cpu, Calculator, Info, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { SafetyScoreGauge } from '../components/common/SafetyScoreGauge';

export const ThreatCenterPage: React.FC = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState('');
  
  // Interactive Calculator State
  const [calcCrit, setCalcCrit] = useState('Life-Critical');
  const [calcThreat, setCalcThreat] = useState('Critical');
  const [calcCond, setCalcCond] = useState('Critical');
  const [calcCvss, setCalcCvss] = useState(8.8);
  const [calcTrust, setCalcTrust] = useState(38);
  const [calcResult, setCalcResult] = useState<any | null>(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const data = await api.getAnomalies(severityFilter || undefined);
        setAnomalies(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAnomalies();
    const interval = setInterval(fetchAnomalies, 3000);
    return () => clearInterval(interval);
  }, [severityFilter]);

  // Recalculate interactive risk
  useEffect(() => {
    const calc = async () => {
      try {
        const res = await api.calculateRisk({
          device_criticality: calcCrit,
          threat_severity: calcThreat,
          patient_condition: calcCond,
          max_cvss_score: calcCvss,
          network_trust_score: calcTrust,
          is_treatment_dependent: true
        });
        setCalcResult(res);
      } catch (e) {
        console.error(e);
      }
    };
    calc();
  }, [calcCrit, calcThreat, calcCond, calcCvss, calcTrust]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1">
            <AlertTriangle className="w-4 h-4 text-cyan-400" />
            <span>Telemetry Intelligence & Anomaly Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Threat Detection & Safety Engine Center
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl mt-1">
            Continuous anomaly correlation utilizing scikit-learn Isolation Forest and explainable Patient Safety Risk Engine formulas.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs">
          {['', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded transition font-medium ${
                severityFilter === sev
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev || 'All Events'}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Risk Calculator (Interactive Core Innovation Sandbox) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#122238] border border-cyan-500/30 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              Interactive Patient Safety Risk Engine Sandbox (Formula Evaluator)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            REAL-TIME FORMULA ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
          {/* Device Criticality */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Device Criticality</label>
            <select
              value={calcCrit}
              onChange={(e) => setCalcCrit(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Life-Critical">Life-Critical (3.0x)</option>
              <option value="High">High (2.2x)</option>
              <option value="Moderate">Moderate (1.5x)</option>
              <option value="Low">Low (1.0x)</option>
            </select>
          </div>

          {/* Threat Severity */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Threat Severity</label>
            <select
              value={calcThreat}
              onChange={(e) => setCalcThreat(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Critical">Critical (4.5x)</option>
              <option value="High">High (3.2x)</option>
              <option value="Medium">Medium (2.0x)</option>
              <option value="Low">Low (1.0x)</option>
              <option value="None">None (0.5x)</option>
            </select>
          </div>

          {/* Patient Condition */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Patient Condition</label>
            <select
              value={calcCond}
              onChange={(e) => setCalcCond(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Critical">Critical (3.5x)</option>
              <option value="Warning">Warning (2.0x)</option>
              <option value="Stable">Stable (1.0x)</option>
            </select>
          </div>

          {/* Max CVSS */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Max CVSS Score: {calcCvss}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={calcCvss}
              onChange={(e) => setCalcCvss(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Network Trust Score */}
          <div>
            <label className="text-slate-400 block mb-1 font-medium">Network Trust: {calcTrust}%</label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={calcTrust}
              onChange={(e) => setCalcTrust(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Calculated Output Result */}
        {calcResult && (
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-semibold uppercase">Engine Directive:</span>
                <RiskBadge score={calcResult.safety_risk_score} level={calcResult.risk_level} size="sm" />
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                {calcResult.recommended_response}
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                {calcResult.explanation}
              </div>
            </div>
            <SafetyScoreGauge score={calcResult.safety_risk_score} size={80} />
          </div>
        )}
      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Active Telemetry Anomalies & Threat Events Feed ({anomalies.length})
        </h2>

        {anomalies.map((anom) => (
          <div
            key={anom.id}
            className={`p-4 rounded-xl border transition space-y-2.5 ${
              anom.threat_severity === 'Critical'
                ? 'bg-red-950/20 border-red-500/40 text-red-100'
                : anom.threat_severity === 'High'
                ? 'bg-amber-950/15 border-amber-500/30 text-amber-100'
                : 'bg-slate-900/90 border-slate-800 text-slate-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-cyan-400">{anom.device_uid}</span>
                <span className="text-xs font-semibold text-white">{anom.anomaly_type}</span>
                <RiskBadge level={anom.threat_severity} size="sm" />
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Confidence: {(anom.confidence_score * 100).toFixed(0)}% • {new Date(anom.timestamp).toLocaleTimeString()}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Root Cause:</strong> {anom.explanation}
            </p>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1">
              <div>
                <span className="text-rose-400 font-bold">Patient Safety Impact: </span>
                <span className="text-slate-300">{anom.patient_safety_impact}</span>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">Recommended Response: </span>
                <span className="text-slate-200">{anom.recommended_action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

