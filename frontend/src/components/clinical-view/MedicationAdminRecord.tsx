import React, { useState } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface MARProps {
  patientName?: string;
  patientMrn?: string;
}

export const MedicationAdminRecord: React.FC<MARProps> = ({
  patientName = "Arthur Pendelton",
  patientMrn = "MRN-902-841"
}) => {
  const [selectedDate, setSelectedDate] = useState("August 5, 2026");
  const timeSlots = ["14:00", "13:00", "12:00", "11:00", "10:00", "09:00"];

  const medications = [
    {
      id: 1,
      name: "Heparin Sodium Subcutaneous",
      dose: "5000 units Subcutaneous",
      schedule: "Routine q12h",
      status: "Given",
      time: "09:00",
      adminBy: "RN Miller",
      cyberStatus: "Verified"
    },
    {
      id: 2,
      name: "Insulin Regular (Humulin R)",
      dose: "10 units Subcutaneous",
      schedule: "Sliding Scale Routine",
      status: "Given",
      time: "09:00",
      adminBy: "RN Miller",
      cyberStatus: "Verified"
    },
    {
      id: 3,
      name: "Norepinephrine Bitartrate IV",
      dose: "8 mcg/min IV (Titrate for MAP > 65)",
      schedule: "Continuous Infusion",
      status: "Infusing via INF-204",
      time: "09:00",
      adminBy: "Smart Pump Auto",
      cyberStatus: "Protected (ICU VLAN ACL)"
    },
    {
      id: 4,
      name: "Lisinopril Tablets",
      dose: "20 mg PO Oral",
      schedule: "Daily Routine",
      status: "Given",
      time: "09:00",
      adminBy: "RN Vance",
      cyberStatus: "Verified"
    },
    {
      id: 5,
      name: "Ipratropium / Albuterol Inhalation",
      dose: "2 puffs Inhaled",
      schedule: "q4h PRN Wheezing",
      status: "Given",
      time: "09:00",
      adminBy: "RT Chen",
      cyberStatus: "Verified"
    }
  ];

  return (
    <div className="bg-white text-slate-800 font-sans rounded border border-slate-300 shadow-2xl overflow-hidden flex flex-col h-full">
      {/* Title Bar matching reference image */}
      <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
          <span className="font-semibold text-slate-900">Infirmary Integrated: Medication Administration Record</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-600">
          <button className="hover:text-black transition flex items-center gap-1 text-[11px]">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
          <div className="flex items-center space-x-1 border border-slate-300 rounded px-1.5 py-0.5 bg-white text-[11px]">
            <span>{selectedDate}</span>
            <span className="font-bold border-l pl-1 ml-1 text-cyan-800">09:00 Block</span>
          </div>
          <div className="flex items-center space-x-1">
            <button className="p-0.5 hover:bg-slate-200 rounded">
              <ChevronLeft className="w-4 h-4 text-cyan-800" />
            </button>
            <button className="p-0.5 hover:bg-slate-200 rounded">
              <ChevronRight className="w-4 h-4 text-cyan-800" />
            </button>
          </div>
        </div>
      </div>

      {/* Patient Header Banner */}
      <div className="bg-cyan-50/70 border-b border-cyan-100 px-4 py-2 flex items-center justify-between">
        <div>
          <span className="text-base font-extrabold text-slate-900 tracking-tight">{patientName}</span>
          <span className="ml-3 text-xs text-slate-500 font-mono">{patientMrn}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            MedSentinel Infusion Guard Active
          </span>
        </div>
      </div>

      {/* Grid Layout matching reference image */}
      <div className="flex-1 overflow-x-auto min-h-[300px]">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-cyan-100/50 text-slate-700 border-b border-cyan-200 font-semibold">
              <th className="p-2.5 border-r border-cyan-200 min-w-[200px]">Prescribed Medication & Order</th>
              {timeSlots.map((ts, idx) => (
                <th
                  key={ts}
                  className={`p-2 border-r border-cyan-200 text-center min-w-[90px] ${
                    ts === '09:00' ? 'bg-cyan-200/80 text-cyan-950 font-bold' : ''
                  }`}
                >
                  <div className="text-[10px] text-slate-500">8/5/2026</div>
                  <div>{ts}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {medications.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/80 transition">
                <td className="p-2.5 border-r border-slate-200 bg-cyan-50/20">
                  <div className="font-bold text-slate-900">{m.name}</div>
                  <div className="text-slate-600 text-[11px]">{m.dose}</div>
                  <div className="text-cyan-700 text-[10px] italic">{m.schedule}</div>
                </td>

                {/* Empty cells for prior hours */}
                {timeSlots.slice(0, 5).map((ts) => (
                  <td key={ts} className="p-2 border-r border-slate-200 text-center bg-white text-slate-400">
                    -
                  </td>
                ))}

                {/* 09:00 Administered Block */}
                <td className="p-2 border-r border-slate-200 bg-cyan-50/60 text-center">
                  <div className="font-semibold text-slate-800 text-[11px]">{m.dose}</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Routine Given</div>
                  <div className="text-[9px] text-slate-500 font-mono">8/5/2026 09:00</div>
                  <div className="mt-1 inline-block px-1.5 py-0.2 text-[9px] rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {m.adminBy}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
