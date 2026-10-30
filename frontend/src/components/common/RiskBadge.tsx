import React from 'react';

interface RiskBadgeProps {
  score?: number;
  level?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, level, size = 'md' }) => {
  let displayLevel = level;
  if (!displayLevel && score !== undefined) {
    if (score < 30) displayLevel = 'Low';
    else if (score < 60) displayLevel = 'Moderate';
    else if (score < 80) displayLevel = 'High';
    else displayLevel = 'Critical';
  }

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  if (displayLevel === 'Low') {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (displayLevel === 'Moderate') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (displayLevel === 'High') {
    colorClasses = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  } else if (displayLevel === 'Critical') {
    colorClasses = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse font-bold';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-3 py-1 font-semibold'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1 rounded border font-mono ${colorClasses} ${sizeClasses}`}>
      <span>{displayLevel?.toUpperCase()}</span>
      {score !== undefined && <span className="opacity-80">({score})</span>}
    </span>
  );
};
