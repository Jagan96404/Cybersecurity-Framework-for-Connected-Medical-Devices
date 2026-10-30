import React, { useEffect, useRef, useState } from 'react';
import { Settings, Play, Pause, FastForward } from 'lucide-react';

interface FetalMonitorProps {
  baselineFhr?: number;
  contractionIntervalSec?: number;
}

export const FetalMonitor: React.FC<FetalMonitorProps> = ({
  baselineFhr = 138,
  contractionIntervalSec = 90
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [speed, setSpeed] = useState<string>('3 cm/min');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;
    const width = canvas.width;
    const height = canvas.height;

    // Buffer of points
    const fhrPoints: number[] = new Array(width).fill(baselineFhr);
    const tocoPoints: number[] = new Array(width).fill(15);

    const fhrTop = 20;
    const fhrBottom = height * 0.62;
    const tocoTop = height * 0.65;
    const tocoBottom = height - 20;

    const render = () => {
      if (!isPaused) {
        tick++;
        // Calculate new FHR point with beat-to-beat variability (physiological jitter)
        const variability = (Math.random() - 0.5) * 6;
        const drift = Math.sin(tick * 0.02) * 5;
        const currentFhr = baselineFhr + variability + drift;

        // Calculate Toco contraction (bell curve every ~200 ticks)
        const cycle = tick % 240;
        let currentToco = 12 + Math.random() * 2;
        if (cycle > 80 && cycle < 160) {
          const bell = Math.sin(((cycle - 80) / 80) * Math.PI);
          currentToco += Math.pow(bell, 2) * 65; // Peak up to ~75 mmHg
        }

        fhrPoints.shift();
        fhrPoints.push(currentFhr);
        tocoPoints.shift();
        tocoPoints.push(currentToco);
      }

      // Draw standard red medical grid paper
      ctx.fillStyle = '#fff5f5';
      ctx.fillRect(0, 0, width, height);

      // Fine grid lines (every 10px)
      ctx.strokeStyle = '#fecaca';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Major calibrated red grid lines
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.0;
      for (let x = 0; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // FHR Calibrated lines: 240, 210, 180, 150, 120, 90, 60
      const fhrScale = [240, 210, 180, 150, 120, 90, 60];
      ctx.fillStyle = '#dc2626';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';

      fhrScale.forEach(val => {
        // Map 60-240 to [fhrBottom, fhrTop]
        const y = fhrBottom - ((val - 60) / (240 - 60)) * (fhrBottom - fhrTop);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.fillText(val.toString(), width / 2, y - 2);
      });

      // Toco Calibrated lines: 100, 80, 60, 40, 20, 0
      const tocoScale = [100, 80, 60, 40, 20, 0];
      tocoScale.forEach(val => {
        const y = tocoBottom - ((val - 0) / 100) * (tocoBottom - tocoTop);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.fillText(val.toString(), width / 2, y - 2);
      });

      // Divider line
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.63);
      ctx.lineTo(width, height * 0.63);
      ctx.stroke();

      // Draw FHR trace (dark grey/black medical pen line)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < width; i++) {
        const val = fhrPoints[i];
        const y = fhrBottom - ((val - 60) / (240 - 60)) * (fhrBottom - fhrTop);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Draw Toco contraction trace (blue/dark pen line)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i < width; i++) {
        const val = tocoPoints[i];
        const y = tocoBottom - ((val - 0) / 100) * (tocoBottom - tocoTop);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [baselineFhr, isPaused]);

  return (
    <div className="bg-white text-slate-800 font-mono rounded border border-slate-300 shadow-2xl overflow-hidden flex flex-col h-full">
      {/* Title Bar matching reference image */}
      <div className="bg-slate-100 border-b border-slate-300 px-3 py-1 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-semibold text-slate-900">Infirmary Integrated: External Fetal Monitor</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-600">
          <button className="hover:text-black transition flex items-center gap-1">
            <Settings className="w-3 h-3" /> Device Options
          </button>
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-sans">Strip Speed:</span>
            {['1 cm/min', '2 cm/min', '3 cm/min'].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 text-[10px] rounded ${speed === s ? 'bg-rose-600 text-white font-bold' : 'bg-slate-200 text-slate-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="hover:text-black transition"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-600" /> : <Pause className="w-3 h-3 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 relative bg-[#fff5f5] min-h-[340px]">
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
