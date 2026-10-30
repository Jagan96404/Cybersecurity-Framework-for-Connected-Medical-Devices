import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShieldAlert, CheckCircle2, UserCheck, AlertTriangle, 
  Clock, ArrowRight, ShieldCheck, X 
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';

export const IncidentResponsePage: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  const fetchIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const stages = ['Open', 'Investigating', 'Contained', 'Resolved', 'False Positive'];

  const handleStatusChange = async (incId: number, nextStatus: string) => {
    try {
      await api.updateIncident(incId, { status: nextStatus });
      fetchIncidents();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleClinicianApprove = async (incId: number) => {
    try {
      await api.approveIncident(incId);
      setApprovalNotice("Dual-key clinician authorization granted! Audit log recorded.");
      setShowApprovalModal(false);
      fetchIncidents();
      setTimeout(() => setApprovalNotice(null), 4000);
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
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Biomedical SOC Incident Orchestration</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Incident Response Center & Kanban Lifecycle
          </h1>
          <p className="text-slate-400 text-xs max-w-2xl mt-1">
            Triaged security incidents with strict Dual-Key Clinician sign-off before applying intrusive mitigations to life-support devices.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total Incidents: <span className="text-white font-bold">{incidents.length}</span>
        </div>
      </div>

      {approvalNotice && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 p-3 rounded-lg text-emerald-300 text-xs font-medium animate-fade-in flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{approvalNotice}</span>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
        {stages.map((stage) => {
          const stageIncidents = incidents.filter((i) => i.status === stage);

          return (
            <div key={stage} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col min-h-[500px]">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                  {stage}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 font-semibold">
                  {stageIncidents.length}
                </span>
              </div>

              {/* Incidents List in this Stage */}
              <div className="space-y-3 flex-1">
                {stageIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-cyan-400 font-bold">
                        {inc.incident_number}
                      </span>
                      <RiskBadge level={inc.severity} size="sm" />
                    </div>

                    <div className="font-semibold text-slate-100 text-xs leading-snug line-clamp-2">
                      {inc.title}
                    </div>

                    {/* Clinician Approval Badge */}
                    {inc.clinician_approval_required && (
                      <div className="text-[10px] pt-1">
                        {inc.clinician_approved ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Clinician Approved
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1 font-semibold">
                            <UserCheck className="w-3 h-3 text-amber-400" /> Clinician Approval Required
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quick Move Button */}
                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{new Date(inc.created_at).toLocaleDateString()}</span>
                      {stage !== 'Resolved' && stage !== 'False Positive' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextIdx = stages.indexOf(stage) + 1;
                            if (nextIdx < stages.length) {
                              handleStatusChange(inc.id, stages[nextIdx]);
                            }
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5"
                        >
                          Advance <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Incident Detail Drawer / Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">{selectedIncident.incident_number}</span>
                  <RiskBadge level={selectedIncident.severity} size="sm" />
                </div>
                <h2 className="text-base font-black text-white mt-1">{selectedIncident.title}</h2>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedIncident.description}
            </p>

            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Current Status:</span>
                <span className="text-white font-bold">{selectedIncident.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Assigned Analyst:</span>
                <span className="text-cyan-400">{selectedIncident.assigned_to || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Clinician Dual-Key:</span>
                <span className={selectedIncident.clinician_approved ? 'text-emerald-400' : 'text-amber-400'}>
                  {selectedIncident.clinician_approved ? 'AUTHORIZED' : 'PENDING CLINICIAN SIGN-OFF'}
                </span>
              </div>
            </div>

            {/* Clinician Action in Modal */}
            {selectedIncident.clinician_approval_required && !selectedIncident.clinician_approved && (
              <button
                onClick={() => handleClinicianApprove(selectedIncident.id)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
              >
                <UserCheck className="w-4 h-4" />
                <span>Grant Clinician Dual-Key Authorization</span>
              </button>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

