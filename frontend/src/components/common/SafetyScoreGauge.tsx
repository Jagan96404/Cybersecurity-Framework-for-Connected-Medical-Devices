import React from 'react';

interface GaugeProps {
  score: number;
  size?: number;
}

export const SafetyScoreGauge: React.FC<GaugeProps> = ({ score, size = 120 }) => {
  const radius = size * 0.4;
  const stroke = size * 0.08;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Semicircle gauge: strokeDashoffset
  const strokeDashoffset = circumference - (score / 100) * (circumference * 0.75);

  let strokeColor = '#10B981'; // Green
  if (score >= 80) strokeColor = '#EF4444'; // Red
  else if (score >= 60) strokeColor = '#F97316'; // Orange
  else if (score >= 30) strokeColor = '#F59E0B'; // Amber

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          stroke="#1F2937"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s ease' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-black font-mono tracking-tight" style={{ color: strokeColor }}>
          {score}
        </span>
        <span className="block text-[10px] text-slate-400 font-mono -mt-1">/ 100</span>
      </div>
    </div>
  );
};
