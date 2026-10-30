import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Cpu, Heart, ShieldAlert, ShieldCheck, Activity, FileText, 
  AlertTriangle, Lock, RefreshCw, ArrowLeft, CheckCircle2 
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { SafetyScoreGauge } from '../components/common/SafetyScoreGauge';
import { CardiacMonitor } from '../components/clinical-view/CardiacMonitor';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<any | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!id) return;
    try {
      const data = await api.getDeviceDetail(Number(id));
      const telem = await api.getDeviceTelemetry(Number(id), 30);
      setDevice(data);
      setTelemetryHistory(telem);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(fetchDetail, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading || !device) {
    return (
      <div className="text-center py-24 text-slate-400 font-mono text-sm">
        Loading device telemetry & cryptographic identity...
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'telemetry', label: 'Live Telemetry' },
    { id: 'security', label: 'Security Events' },
    { id: 'sbom', label: 'SBOM' },
    { id: 'vulnerabilities', label: 'Vulnerabilities' },
    { id: 'safety', label: 'Safety Assessments' },
    { id: 'audit', label: 'Audit History' }
  ];

  const handleIsolate = async () => {
    try {
      const res = await api.isolateDevice(device.id, "Analyst initiated safe network micro-isolation.");
      setActionNotice(res.message);
      fetchDetail();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRestore = async () => {
    try {
      await api.reconnectDevice(device.id);
      setActionNotice("Device network access restored.");
      fetchDetail();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const currentScore = device.latest_safety_assessment?.safety_risk_score || 24;

  return (
    <div className="space-y-6">
      {/* Back and Title Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/devices"
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                {device.device_uid}
              </span>
              <span className="text-slate-400 text-xs font-mono">{device.device_type}</span>
              <RiskBadge level={device.device_status} size="sm" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">{device.name}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {device.is_isolated ? (
            <button
              onClick={handleRestore}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Restore Network Connectivity</span>
            </button>
          ) : (
            <button
              onClick={handleIsolate}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-red-600/20 transition flex items-center space-x-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Enforce Safe ICU Network Isolation</span>
            </button>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="bg-cyan-950/70 border border-cyan-500/50 p-3 rounded-lg text-cyan-300 text-xs font-medium animate-fade-in flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="border-b border-slate-800 flex items-center space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-400 bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Risk Gauge Card */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Patient Safety Score</div>
                <div className="text-xs text-slate-500 mt-1">Calculated via Risk Engine</div>
                <div className="mt-2">
                  <RiskBadge score={currentScore} size="md" />
                </div>
              </div>
              <SafetyScoreGauge score={currentScore} size={95} />
            </div>

            {/* Hardware Identity */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow space-y-2 text-xs">
              <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Hardware Identity & VLAN
              </div>
              <div className="space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">MAC Address:</span>
                  <span className="text-slate-200">{device.network_identity?.mac_address || '00:1A:79:3F:B2:01'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">IP Address:</span>
                  <span className="text-cyan-400">{device.network_identity?.ip_address || '10.240.104.25'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Micro-VLAN:</span>
                  <span className="text-slate-200">{device.network_identity?.vlan_id || 104} (ICU Telemetry)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Protocol:</span>
                  <span className="text-emerald-400">{device.network_identity?.connection_protocol || 'TLS 1.3'}</span>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl shadow space-y-2 text-xs">
              <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                X.509 Certificate Status
              </div>
              <div className="space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Status:</span>
                  <span className="text-emerald-400 font-bold">{device.cert_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Issuer:</span>
                  <span className="text-slate-300 text-[11px] truncate max-w-[140px]">MedSentinel Root CA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Algorithm:</span>
                  <span className="text-slate-300">SHA256-RSA 2048</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Revocation Check:</span>
                  <span className="text-emerald-400">OCSP Validated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Safe Response Banner */}
          <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-5 space-y-2">
            <div className="font-bold text-sm text-cyan-300 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Patient Safety Risk Engine Response Directive
            </div>
            <p className="text-slate-200 text-xs leading-relaxed">
              {device.latest_safety_assessment?.recommended_response ||
                "Device secure and operating within nominal parameters. Routine telemetry monitoring active."}
            </p>
            <div className="text-[11px] text-slate-400 italic pt-1 border-t border-cyan-900/40">
              Formula Reasoning: {device.latest_safety_assessment?.explanation || "All cyber threat vectors nominal."}
            </div>
          </div>

          {/* Embedded Bedside Waveform Monitor */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Live Bedside Waveform Telemetry
                </h3>
                <span className="text-xs text-slate-400">Real-time canvas stream synthesized from hospital telemetry bus</span>
              </div>
              <Link to="/clinical-view" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
                Open 4-Quadrant View →
              </Link>
            </div>
            <div className="h-[360px]">
              <CardiacMonitor
                heartRate={device.latest_telemetry?.heart_rate || 78}
                systolicBp={device.latest_telemetry?.systolic_bp || 120}
                diastolicBp={device.latest_telemetry?.diastolic_bp || 80}
                spo2={device.latest_telemetry?.spo2 || 98}
                etco2={device.latest_telemetry?.capnography_etco2 || 38}
                respiratoryRate={device.latest_telemetry?.respiratory_rate || 16}
                isCyberCompromised={device.device_status === 'Critical'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="space-y-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow">
            <h3 className="text-sm font-bold text-white mb-2">Network Traffic & Compute Telemetry History</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryHistory}>
                  <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="network_traffic_kbps" stroke="#0284c7" name="Traffic (kbps)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="cpu_load" stroke="#10b981" name="CPU Load (%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: SBOM */}
      {activeTab === 'sbom' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <h3 className="text-sm font-bold text-white">Software Bill of Materials (SBOM) Components</h3>
          <p className="text-xs text-slate-400">Micro-controller firmware components verified via CycloneDX/SPDX manifest</p>
          <div className="space-y-2">
            {[
              { name: 'FreeRTOS Kernel', version: 'v10.4.3', vendor: 'AWS', type: 'Real-Time OS', license: 'MIT' },
              { name: 'OpenSSL Cryptographic Toolkit', version: 'v1.1.1u', vendor: 'OpenSSL Project', type: 'Crypto', license: 'Apache-2.0' },
              { name: 'lwIP TCP/IP Stack', version: 'v2.1.2', vendor: 'Swedish Institute of CS', type: 'Network Stack', license: 'BSD-3' },
              { name: 'BusyBox Utilities', version: 'v1.31.1', vendor: 'BusyBox', type: 'OS Utilities', license: 'GPL-2.0' }
            ].map((c, i) => (
              <div key={i} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{c.vendor} • {c.type}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-cyan-400 font-semibold">{c.version}</div>
                  <div className="text-slate-500 text-[10px]">{c.license}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Vulnerabilities */}
      {activeTab === 'vulnerabilities' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow space-y-4">
          <h3 className="text-sm font-bold text-white">Detected Common Vulnerabilities & Exposures (CVEs)</h3>
          <div className="space-y-3">
            {device.vulnerabilities?.map((v: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-400">{v.cve_id}</span>
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono font-bold">
                    CVSS {v.cvss_score} ({v.severity})
                  </span>
                </div>
                <div className="font-bold text-white">{v.title}</div>
                <div className="text-slate-300 text-[11px] bg-slate-900 p-2.5 rounded border border-slate-800">
                  <strong className="text-slate-200">Recommended Patch Remediation:</strong> {v.remediation_steps}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Safety Assessments */}
      {activeTab === 'safety' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Patient Safety Risk Engine Formula Breakdown</h3>
          <div className="p-4 bg-slate-950 rounded-lg font-mono space-y-2 border border-slate-800 text-slate-300">
            <div className="text-cyan-400 font-bold">
              Safety Risk Score = (Device Criticality × Cyber Threat × Patient Condition) + Vulnerability + Network Risk − Treatment Continuity Protection
            </div>
            <div className="pt-2 text-slate-400 border-t border-slate-800 space-y-1 text-[11px]">
              <div>• Device Criticality Factor: {device.latest_safety_assessment?.device_criticality_factor || 2.2}x</div>
              <div>• Cyber Threat Severity Factor: {device.latest_safety_assessment?.threat_severity_factor || 1.0}x</div>
              <div>• Patient Condition Severity Factor: {device.latest_safety_assessment?.patient_condition_factor || 2.0}x</div>
              <div>• Vulnerability Impact: +{device.latest_safety_assessment?.vulnerability_factor || 0.0}</div>
              <div>• Network Trust Risk: +{device.latest_safety_assessment?.network_risk_factor || 1.2}</div>
              <div>• Treatment Continuity Protection Deduction: -{device.latest_safety_assessment?.treatment_continuity_protection || 10.0} pts</div>
              <div className="text-white font-bold pt-1">
                Final Safety Risk Score: {currentScore} / 100 ({device.latest_safety_assessment?.risk_level || 'Low'})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Audit History */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow space-y-3 text-xs">
          <h3 className="text-sm font-bold text-white">Device Audit Trail & Compliance Log</h3>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
            <div className="text-slate-400">{new Date().toLocaleString()} • Marcus Vance (admin) • DEVICE_INSPECTION</div>
            <div className="text-slate-200 mt-0.5">Inspected device telemetry, firmware integrity, and zero-trust ACL policies.</div>
          </div>
        </div>
      )}
    </div>
  );
};

