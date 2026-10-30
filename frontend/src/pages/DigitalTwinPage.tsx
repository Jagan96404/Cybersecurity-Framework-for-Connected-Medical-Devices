import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Layers, Activity, AlertTriangle, ShieldCheck, Heart, Cpu, ArrowRight } from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { Link } from 'react-router-dom';

export const DigitalTwinPage: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ICU');
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await api.getDevices();
        setDevices(data);
        if (data.length > 0 && !selectedDevice) {
          setSelectedDevice(data[0]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDevices();
    const interval = setInterval(fetchDevices, 3000);
    return () => clearInterval(interval);
  }, []);

  const departments = ['ICU', 'Cardiology', 'NICU', 'Surgery', 'General Ward'];

  const filteredDevices = devices.filter((d) => {
    if (selectedDept === 'ICU') return d.floor?.includes('ICU') || d.room?.includes('ICU');
    if (selectedDept === 'Cardiology') return d.floor?.includes('Cardiology') || d.room?.includes('Cardiology');
    if (selectedDept === 'NICU') return d.floor?.includes('NICU') || d.room?.includes('NICU');
    if (selectedDept === 'Surgery') return d.floor?.includes('Surgery') || d.room?.includes('OR');
    return d.floor?.includes('Ward') || d.room?.includes('Ward');
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-semibold tracking-wider uppercase mb-1">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Cyber-Physical Spatial Mapping</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hospital Digital Twin & Smart Floorplan
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl mt-1">
            Interactive real-time 2.5D spatial monitoring of clinical micro-VLANs, connected medical IoT assets, and patient safety states.
          </p>
        </div>

        {/* Department Tabs */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs font-medium">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded transition ${
                selectedDept === dept
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Main Floorplan & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Spatial Room Map (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Floor Unit: {selectedDept} (Telemetry VLAN 104)
              </h2>
              <span className="text-xs text-slate-400">Click any clinical room or medical node to inspect telemetry</span>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warning</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500" /> Offline</span>
            </div>
          </div>

          {/* Room Boxes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 min-h-[460px]">
            {filteredDevices.map((dev) => {
              const isSelected = selectedDevice?.id === dev.id;
              const isCrit = dev.device_status === 'Critical';
              const isWarn = dev.device_status === 'Warning';
              const isNormal = dev.device_status === 'Normal';

              return (
                <div
                  key={dev.id}
                  onClick={() => setSelectedDevice(dev)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-800/90 ring-2 ring-cyan-500/20 shadow-lg'
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Top Status Bar indicator */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    isCrit ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />

                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span className="font-bold text-slate-300 font-mono">{dev.room}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        isCrit ? 'bg-red-500 animate-ping' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </div>

                    <div className="text-sm font-black text-white tracking-tight group-hover:text-cyan-300 transition line-clamp-1">
                      {dev.name}
                    </div>

                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {dev.device_uid} • {dev.device_type}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Patient:</span>
                      <span className="font-semibold text-slate-200">
                        {dev.patient ? dev.patient.full_name : 'Unassigned'}
                      </span>
                    </div>
                    {dev.patient && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Condition:</span>
                        <span className={`font-semibold ${
                          dev.patient.condition_status === 'Critical' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {dev.patient.condition_status}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Network Trust:</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {dev.network_trust_score}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Device Node Inspector (Right 4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow flex flex-col justify-between">
          {selectedDevice ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{selectedDevice.device_uid}</span>
                  <h3 className="text-base font-black text-white">{selectedDevice.name}</h3>
                </div>
                <RiskBadge level={selectedDevice.device_status} size="sm" />
              </div>

              {/* Patient Info */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  Associated Patient Profile
                </div>
                {selectedDevice.patient ? (
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Name:</span>
                      <span className="font-bold text-white">{selectedDevice.patient.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Condition:</span>
                      <span className={`font-bold ${selectedDevice.patient.condition_status === 'Critical' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {selectedDevice.patient.condition_status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dependency:</span>
                      <span className="text-slate-300 text-right">{selectedDevice.patient.treatment_dependency}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">No patient assigned to this device.</div>
                )}
              </div>

              {/* Cyber Parameters */}
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Hardware & Network Telemetry
                </div>
                <div className="text-xs space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Firmware:</span>
                    <span className="text-slate-200">{selectedDevice.firmware_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Certificate:</span>
                    <span className="text-emerald-400">{selectedDevice.cert_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">CPU Usage:</span>
                    <span className="text-slate-200">{selectedDevice.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Network Traffic:</span>
                    <span className="text-cyan-400">{selectedDevice.network_traffic_kbps.toFixed(1)} kbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-sans">Network Trust:</span>
                    <span className="text-cyan-300 font-bold">{selectedDevice.network_trust_score}%</span>
                  </div>
                </div>
              </div>

              {/* Safe Response Recommendation */}
              <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-xs space-y-1">
                <div className="font-bold text-cyan-300 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Patient Safety Protocol
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedDevice.device_status === 'Critical'
                    ? "Life-critical ventilation protection enforced. Network egress restricted to ICU local subnet. Automatic shutdown prohibited."
                    : "Zero-Trust policy active. Device operating within nominal bounds."}
                </p>
              </div>

              {/* Action Button */}
              <Link
                to={`/devices/${selectedDevice.id}`}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-600/30"
              >
                <span>Inspect Full Telemetry & SBOM</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12 text-xs">
              Select a room or device on the floorplan to inspect telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

