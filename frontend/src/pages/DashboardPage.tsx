import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, Activity, Cpu, AlertTriangle, Users, 
  ArrowUpRight, Heart, Zap, CheckCircle2, TrendingUp, Monitor
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { api } from '../services/api';
import { SafetyScoreGauge } from '../components/common/SafetyScoreGauge';
import { RiskBadge } from '../components/common/RiskBadge';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>({
    total_devices: 25,
    secure_devices: 21,
    attention_devices: 4,
    critical_alerts: 1,
    average_safety_risk_score: 28.4
  });
  const [devices, setDevices] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, d, inc, anom] = await Promise.all([
          api.getSummaryStats(),
          api.getDevices(),
          api.getIncidents(),
          api.getAnomalies()
        ]);
        setStats(s);
        setDevices(d);
        setIncidents(inc);
        setAnomalies(anom);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Risk Trend Data
  const trendData = [
    { time: '04:00', avgRisk: 22, networkThreats: 1 },
    { time: '05:00', avgRisk: 24, networkThreats: 2 },
    { time: '06:00', avgRisk: 23, networkThreats: 1 },
    { time: '07:00', avgRisk: 27, networkThreats: 3 },
    { time: '08:00', avgRisk: 34, networkThreats: 5 },
    { time: '09:00', avgRisk: stats.average_safety_risk_score || 38, networkThreats: 6 },
  ];

  // Device status distribution
  const statusDistribution = [
    { name: 'Normal', value: stats.secure_devices || 21, color: '#10B981' },
    { name: 'Warning', value: 2, color: '#F59E0B' },
    { name: 'High Risk', value: 1, color: '#F97316' },
    { name: 'Critical', value: stats.critical_alerts || 1, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#0F223D] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>MedSentinel Cyber-Physical System</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hospital Cyber Defense & Patient Safety Command Center
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl mt-1">
            Real-time zero-trust device telemetry, AI threat correlation, and the Patient Safety Risk Engine. Active life-support treatment continuity enforced.
          </p>
        </div>

        {/* Quick Link to Clinical Monitor 4-Quadrant View */}
        <Link
          to="/clinical-view"
          className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-lg font-semibold text-xs shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition group"
        >
          <Monitor className="w-4 h-4 text-white group-hover:scale-110 transition" />
          <span>Launch Clinical Monitor Output View</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Devices */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Connected Devices</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white font-mono">
            {stats.total_devices}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% telemetry synced
          </div>
        </div>

        {/* Secure Devices */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Secure Baseline</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-emerald-400 font-mono">
            {stats.secure_devices}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Passing zero-trust checks
          </div>
        </div>

        {/* Attention Devices */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Attention Needed</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-amber-400 font-mono">
            {stats.attention_devices}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            Warnings or CVE patches
          </div>
        </div>

        {/* Critical Patient Alerts */}
        <div className="bg-slate-900/90 border border-red-900/50 p-4 rounded-xl shadow bg-red-950/10">
          <div className="flex items-center justify-between text-red-300 text-xs font-medium">
            <span>Critical Alerts</span>
            <Heart className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="mt-2 text-3xl font-black text-red-400 font-mono">
            {stats.critical_alerts}
          </div>
          <div className="text-[11px] text-red-300 font-medium mt-1">
            VENT-016 (ICU Room 08)
          </div>
        </div>

        {/* Fleet Safety Risk Score */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-xs font-medium">Fleet Safety Risk</div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">Weighted avg</div>
            <div className="mt-1">
              <RiskBadge score={stats.average_safety_risk_score} size="sm" />
            </div>
          </div>
          <SafetyScoreGauge score={stats.average_safety_risk_score} size={70} />
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Safety Risk Trend Area Chart */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Fleet Patient Safety Risk Score & Cyber Anomaly Trend
              </h2>
              <p className="text-xs text-slate-400">Continuous 6-hour evaluation from Isolation Forest & Risk Engine</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
              AUTO-REFRESH 1s
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="avgRisk" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#riskGrad)" name="Safety Risk Score" />
                <Area type="monotone" dataKey="networkThreats" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#threatGrad)" name="Threat Events" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Status Distribution Pie */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Device Fleet Security Posture
            </h2>
            <p className="text-xs text-slate-400">25 Simulated Connected Medical Devices</p>
          </div>

          <div className="h-44 w-full my-auto flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-3">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name}:</span>
                <span className="font-bold text-white font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Safety Watch & Priority Incidents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Patient Safety Watch Panel (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Active Patient Safety Watch List
              </h2>
              <p className="text-xs text-slate-400">
                Connected devices tied to high-dependency patients with active treatment continuity protections
              </p>
            </div>
            <Link to="/patient-safety" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
              View All Patients <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {devices.filter(d => d.patient).slice(0, 4).map((d) => (
              <div
                key={d.id}
                className={`p-3.5 rounded-lg border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  d.device_status === 'Critical'
                    ? 'bg-red-950/20 border-red-500/40 text-red-100'
                    : d.device_status === 'Warning'
                    ? 'bg-amber-950/10 border-amber-500/30 text-amber-100'
                    : 'bg-slate-950/60 border-slate-800 text-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{d.patient?.full_name}</span>
                    <span className="text-xs text-slate-400 font-mono">({d.patient?.patient_uid})</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      d.patient?.condition_status === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {d.patient?.condition_status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-semibold">{d.device_uid}</span>
                    <span>•</span>
                    <span>{d.name}</span>
                    <span>•</span>
                    <span className="text-slate-400">{d.room}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 italic">
                    Dependency: {d.patient?.treatment_dependency}
                  </div>
                </div>

                <div className="flex items-center space-x-2.5">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Device Status</div>
                    <span className={`text-xs font-mono font-bold ${
                      d.device_status === 'Critical' ? 'text-red-400' : d.device_status === 'Warning' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {d.device_status}
                    </span>
                  </div>
                  <Link
                    to={`/devices/${d.id}`}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs transition"
                  >
                    Inspect
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Cyber Incidents (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Active Cyber & Anomaly Incidents
              </h2>
              <p className="text-xs text-slate-400">Priority triage queue for biomedical SOC</p>
            </div>
            <Link to="/incidents" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium">
              Kanban Board <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {incidents.slice(0, 4).map((inc) => (
              <div key={inc.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg hover:border-slate-700 transition space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">{inc.incident_number}</span>
                  <RiskBadge level={inc.severity} size="sm" />
                </div>
                <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {inc.title}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="capitalize text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                    Status: {inc.status}
                  </span>
                  <span>{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

