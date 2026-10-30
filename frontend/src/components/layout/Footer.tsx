import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B132B] border-t border-slate-800 text-slate-400 py-4 px-6 text-xs mt-auto">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">MedSentinel CPS</span>
          <span className="text-slate-500">•</span>
          <span>Cybersecurity Framework for Connected Medical Devices</span>
        </div>
        <div className="text-slate-400 text-center text-[11px]">
          <span className="text-amber-400 font-semibold">Simulated Demonstration Environment:</span> Built for educational and research evaluation. Never automatically terminates life-support therapy.
        </div>
        <div className="text-slate-500 font-mono text-[11px]">
          Zero-Trust Microsegmentation • Patient Safety Risk Engine
        </div>
      </div>
    </footer>
  );
};
