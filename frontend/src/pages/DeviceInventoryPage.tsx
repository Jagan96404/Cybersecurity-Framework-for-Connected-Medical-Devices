import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Cpu, Search, Filter, ShieldAlert, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';

export const DeviceInventoryPage: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [criticalityFilter, setCriticalityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await api.getDevices({
        search: search || undefined,
        device_type: typeFilter || undefined,
        status: statusFilter || undefined,
        criticality: criticalityFilter || undefined,
      });
      setDevices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [search, typeFilter, statusFilter, criticalityFilter]);

  const handleIsolate = async (devId: number, name: string) => {
    try {
      const res = await api.isolateDevice(devId, "Manual network isolation triggered from device inventory.");
      setActionNotice(res.message);
      fetchDevices();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReconnect = async (devId: number) => {
    try {
      await api.reconnectDevice(devId);
      setActionNotice("Device network restored.");
      fetchDevices();
      setTimeout(() => setActionNotice(null), 4000);
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
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Hardware Asset Management</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Medical Device Inventory & Trust Fleet
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl mt-1">
            Searchable repository of all connected clinical telemetry endpoints, firmware baselines, zero-trust cryptographic certificates, and safety ratings.
          </p>
        </div>

        <button
          onClick={fetchDevices}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {actionNotice && (
        <div className="bg-cyan-950/70 border border-cyan-500/50 p-3 rounded-lg text-cyan-300 text-xs font-medium animate-fade-in flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search UID, device name, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All Device Types</option>
              <option value="Ventilator">Ventilator</option>
              <option value="Infusion Pump">Infusion Pump</option>
              <option value="Cardiac Monitor">Cardiac Monitor</option>
              <option value="Insulin Pump">Insulin Pump</option>
              <option value="Wearable">Wearable</option>
              <option value="Defibrillator">Defibrillator</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All Device Statuses</option>
              <option value="Normal">Normal</option>
              <option value="Warning">Warning</option>
              <option value="High Risk">High Risk</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Criticality Filter */}
          <div>
            <select
              value={criticalityFilter}
              onChange={(e) => setCriticalityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All Criticality Levels</option>
              <option value="Life-Critical">Life-Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Device UID & Model</th>
                <th className="py-3 px-4">Type & Criticality</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Assigned Patient</th>
                <th className="py-3 px-4">Firmware</th>
                <th className="py-3 px-4">Network Trust</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {devices.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40 transition">
                  {/* UID & Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-xs">{d.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{d.device_uid}</div>
                  </td>

                  {/* Type & Criticality */}
                  <td className="py-3.5 px-4">
                    <div>{d.device_type}</div>
                    <span className={`text-[10px] font-bold font-mono ${
                      d.device_criticality === 'Life-Critical' ? 'text-red-400' : 'text-amber-400'
                    }`}>
                      {d.device_criticality}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{d.room}</div>
                    <div className="text-[11px] text-slate-400">{d.floor}</div>
                  </td>

                  {/* Patient */}
                  <td className="py-3.5 px-4">
                    {d.patient ? (
                      <div>
                        <div className="font-bold text-white">{d.patient.full_name}</div>
                        <span className={`text-[10px] font-semibold ${
                          d.patient.condition_status === 'Critical' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {d.patient.condition_status}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Firmware */}
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    <div>{d.firmware_version}</div>
                    <span className="text-[10px] text-emerald-400">{d.cert_status}</span>
                  </td>

                  {/* Network Trust */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.network_trust_score > 80 ? 'bg-emerald-500' : d.network_trust_score > 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${d.network_trust_score}%` }}
                        />
                      </div>
                      <span className="font-bold text-white text-xs">{d.network_trust_score}%</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <RiskBadge level={d.device_status} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      to={`/devices/${d.id}`}
                      className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded text-[11px] font-medium transition"
                    >
                      Detail
                    </Link>

                    {d.is_isolated ? (
                      <button
                        onClick={() => handleReconnect(d.id)}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-medium transition"
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => handleIsolate(d.id, d.name)}
                        className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded text-[11px] font-medium transition"
                      >
                        Safe Isolate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

