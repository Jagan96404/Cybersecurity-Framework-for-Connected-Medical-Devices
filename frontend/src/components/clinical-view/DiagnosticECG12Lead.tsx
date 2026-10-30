import React, { useRef, useEffect } from 'react';
import { Settings, Palette, Download, Maximize2 } from 'lucide-react';

interface DiagnosticECG12LeadProps {
  heartRate?: number;
}

export const DiagnosticECG12Lead: React.FC<DiagnosticECG12LeadProps> = ({ heartRate = 75 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw Pink ECG Paper Background
    ctx.fillStyle = '#fff1f2';
    ctx.fillRect(0, 0, width, height);

    // 1mm grid lines
    ctx.strokeStyle = '#fecdd3';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 5) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 5mm heavy grid lines
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.0;
    for (let x = 0; x < width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 12 Leads Layout: 4 columns x 3 rows
    // Col 0: I, II, III
    // Col 1: aVR, aVL, aVF
    // Col 2: V1, V2, V3
    // Col 3: V4, V5, V6
    const leadLayout = [
      { name: 'I', col: 0, row: 0, inverted: false, rAmp: 25 },
      { name: 'II', col: 0, row: 1, inverted: false, rAmp: 35 },
      { name: 'III', col: 0, row: 2, inverted: false, rAmp: 18 },
      { name: 'aVR', col: 1, row: 0, inverted: true, rAmp: 28 },
      { name: 'aVL', col: 1, row: 1, inverted: false, rAmp: 15 },
      { name: 'aVF', col: 1, row: 2, inverted: false, rAmp: 28 },
      { name: 'V1', col: 2, row: 0, inverted: false, rAmp: 8, sAmp: 30 },
      { name: 'V2', col: 2, row: 1, inverted: false, rAmp: 14, sAmp: 28 },
      { name: 'V3', col: 2, row: 2, inverted: false, rAmp: 24, sAmp: 18 },
      { name: 'V4', col: 3, row: 0, inverted: false, rAmp: 34, sAmp: 10 },
      { name: 'V5', col: 3, row: 1, inverted: false, rAmp: 32, sAmp: 6 },
      { name: 'V6', col: 3, row: 2, inverted: false, rAmp: 26, sAmp: 4 }
    ];

    const colWidth = width / 4;
    const rowHeight = height / 3;

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.3;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#0f172a';

    leadLayout.forEach((lead) => {
      const startX = lead.col * colWidth;
      const centerY = lead.row * rowHeight + rowHeight / 2;

      // Label
      ctx.fillText(lead.name, startX + 8, centerY - rowHeight / 3);

      // Draw ECG wave for this section
      ctx.beginPath();
      const period = 70; // cycle length
      for (let px = 0; px < colWidth - 10; px++) {
        const x = startX + px;
        const phase = (px % period) / period;
        let yOffset = 0;

        if (phase > 0.1 && phase < 0.2) {
          yOffset = -5; // P wave
        } else if (phase >= 0.22 && phase < 0.25) {
          yOffset = 4; // Q wave
        } else if (phase >= 0.25 && phase < 0.33) {
          yOffset = -lead.rAmp; // R wave
        } else if (phase >= 0.33 && phase < 0.38) {
          yOffset = lead.sAmp || 8; // S wave
        } else if (phase >= 0.45 && phase < 0.65) {
          yOffset = -8; // T wave
        }

        if (lead.inverted) {
          yOffset = -yOffset;
        }

        const y = centerY + yOffset;
        if (px === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

  }, [heartRate]);

  return (
    <div className="bg-white text-slate-800 font-mono rounded border border-rose-300 shadow-2xl overflow-hidden flex flex-col h-full">
      <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
          <span className="font-semibold text-slate-900">Infirmary Integrated: Electrocardiogram (12-Lead Diagnostic)</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-600">
          <button className="hover:text-black transition flex items-center gap-1">
            <Settings className="w-3 h-3" /> Device Options
          </button>
          <button className="hover:text-black transition flex items-center gap-1">
            <Palette className="w-3 h-3" /> Color Scheme
          </button>
          <span className="text-[11px] font-sans text-rose-700 font-bold">25 mm/s, 10 mm/mV</span>
        </div>
      </div>
      <div className="flex-1 relative bg-[#fff1f2] min-h-[340px]">
        <canvas
          ref={canvasRef}
          width={580}
          height={340}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
