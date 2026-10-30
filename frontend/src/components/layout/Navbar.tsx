import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, Activity, LayoutDashboard, Cpu, Users, 
  AlertTriangle, FileText, PlayCircle, Layers, Monitor, 
  Radio, LogOut, UserCheck
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, role, switchDemoRole, logout } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navItems = [
    { label: 'Command Center', path: '/', icon: LayoutDashboard },
    { label: 'Clinical Monitors', path: '/clinical-view', icon: Monitor, highlight: true },
    { label: 'Digital Twin', path: '/digital-twin', icon: Layers },
    { label: 'Devices', path: '/devices', icon: Cpu },
    { label: 'Patient Safety', path: '/patient-safety', icon: Users },
    { label: 'Threats', path: '/threats', icon: AlertTriangle },
    { label: 'Incidents', path: '/incidents', icon: ShieldAlert },
    { label: 'SBOM', path: '/sbom', icon: FileText },
    { label: 'Simulator', path: '/simulator', icon: PlayCircle },
  ];

  return (
    <header className="bg-[#0B132B]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-[1720px] mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-lg shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-sans">
                  MEDSENTINEL
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded font-semibold">
                  CPS 2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">
                Cybersecurity Framework for Connected Medical Devices
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : item.highlight
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Telemetry status + Role Switcher */}
        <div className="flex items-center space-x-3">
          {/* Live Telemetry WebSocket status */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-full text-[11px] text-emerald-400">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="font-mono font-medium">CPS BUS ONLINE</span>
          </div>

          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center space-x-2 px-3 py-1 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-md text-xs text-slate-200 transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-tight">ACTIVE ROLE</span>
                <span className="font-semibold text-white capitalize">{role.replace('_', ' ')}</span>
              </div>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 font-medium">
                  Switch Demo Account
                </div>
                {(['administrator', 'security_analyst', 'clinician'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchDemoRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition ${
                      role === r ? 'text-cyan-400 font-bold bg-cyan-950/30' : 'text-slate-300'
                    }`}
                  >
                    <span>{DEMO_CREDENTIALS[r].label}</span>
                    {role === r && <span className="text-[10px] text-cyan-400 font-mono">ACTIVE</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
