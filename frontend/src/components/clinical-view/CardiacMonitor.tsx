import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Settings, Bell, Palette, AlertTriangle } from 'lucide-react';

interface CardiacMonitorProps {
  heartRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  spo2?: number;
  etco2?: number;
  respiratoryRate?: number;
  isCyberCompromised?: boolean;
}

export const CardiacMonitor: React.FC<CardiacMonitorProps> = ({
  heartRate = 120,
  systolicBp = 100,
  diastolicBp = 70,
  spo2 = 94,
  etco2 = 39,
  respiratoryRate = 10,
  isCyberCompromised = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [lead, setLead] = useState('Lead II');
  const [activeAlarm, setActiveAlarm] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;

    // 4 vertical channels
    const chHeight = height / 4;

    // Buffer arrays to store past points for clean redraw
    const ecgBuffer: number[] = new Array(width).fill(chHeight / 2);
    const ecg2Buffer: number[] = new Array(width).fill(chHeight * 1.5);
    const spo2Buffer: number[] = new Array(width).fill(chHeight * 2.5);
    const co2Buffer: number[] = new Array(width).fill(chHeight * 3.5);

    let phase = 0;

    const render = () => {
      phase += (heartRate / 60) * 0.08;
      x = (x + 2) % width;

      // Calculate ECG QRS pulse
      const p = phase % (2 * Math.PI);
      let ecgOffset = 0;
      if (p > 0.8 && p < 0.95) {
        ecgOffset = -8; // P wave
      } else if (p >= 0.95 && p < 1.05) {
        ecgOffset = 6;  // Q wave
      } else if (p >= 1.05 && p < 1.25) {
        ecgOffset = -45; // R wave spike
      } else if (p >= 1.25 && p < 1.35) {
        ecgOffset = 18; // S wave
      } else if (p >= 1.5 && p < 1.8) {
        ecgOffset = -12; // T wave
      }

      // If cyber compromised, inject noise/jitter
      if (isCyberCompromised) {
        ecgOffset += (Math.random() - 0.5) * 15;
      }

      // SpO2 Plethysmograph wave
      const spo2Val = Math.sin(phase) > 0 ? Math.pow(Math.sin(phase), 3) * -28 : Math.sin(phase) * -10;

      // Capnography EtCO2 square/plateau wave
      const respPhase = (phase * 0.25) % (2 * Math.PI);
      let co2Val = 0;
      if (respPhase > 1.0 && respPhase < 3.2) {
        co2Val = -32 + Math.sin(respPhase * 2) * 2; // Plateau phase
      } else {
        co2Val = 0; // Baseline inhalation
      }

      ecgBuffer[x] = chHeight * 0.5 + ecgOffset;
      ecg2Buffer[x] = chHeight * 1.5 + ecgOffset * 0.7;
      spo2Buffer[x] = chHeight * 2.5 + spo2Val;
      co2Buffer[x] = chHeight * 3.7 + co2Val;

      // Clear slight forward beam for sweeper effect
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, 0, 10, height);

      // Channel 1: ECG Lead II (Green)
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const prevX = (x - 2 + width) % width;
      ctx.moveTo(prevX, ecgBuffer[prevX]);
      ctx.lineTo(x, ecgBuffer[x]);
      ctx.stroke();

      // Channel 2: Lead III / Arterial (Green)
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(prevX, ecg2Buffer[prevX]);
      ctx.lineTo(x, ecg2Buffer[x]);
      ctx.stroke();

      // Channel 3: Pulse Oximetry Pleth (Amber)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(prevX, spo2Buffer[prevX]);
      ctx.lineTo(x, spo2Buffer[x]);
      ctx.stroke();

      // Channel 4: Capnography (Cyan)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(prevX, co2Buffer[prevX]);
      ctx.lineTo(x, co2Buffer[x]);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartRate, isCyberCompromised]);

  const meanBp = Math.round((systolicBp + 2 * diastolicBp) / 3);

  return (
    <div className="bg-black text-white font-mono rounded border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-full">
      {/* Title Bar matching reference image */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-1 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-200">Infirmary Integrated: Cardiac Monitor</span>
          {isCyberCompromised && (
            <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 font-sans">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              TELEMETRY JITTER DETECTED
            </span>
          )}
        </div>
        {/* Menu toolbar */}
        <div className="flex items-center space-x-4 text-slate-400">
          <button className="hover:text-white transition flex items-center gap-1">
            <Settings className="w-3 h-3" /> Device Options
          </button>
          <button 
            onClick={() => setActiveAlarm(!activeAlarm)}
            className={`hover:text-white transition flex items-center gap-1 ${activeAlarm ? 'text-amber-400' : ''}`}
          >
            <Bell className="w-3 h-3" /> Alarms
          </button>
          <button 
            onClick={() => setAudioMuted(!audioMuted)}
            className="hover:text-white transition flex items-center gap-1"
          >
            {audioMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />} Audio
          </button>
          <button className="hover:text-white transition flex items-center gap-1">
            <Palette className="w-3 h-3" /> Color Scheme
          </button>
        </div>
      </div>

      {/* Main Grid: Left Numeric Readouts, Right Real-Time Canvas Waves */}
      <div className="flex-1 grid grid-cols-12 bg-black min-h-[340px]">
        {/* Numeric Indicators (Left Column) */}
        <div className="col-span-4 border-r border-slate-800 flex flex-col divide-y divide-slate-800 bg-black">
          {/* ECG Channel */}
          <div className="p-3 flex-1 flex flex-col justify-between border-l-4 border-l-emerald-500 bg-emerald-950/10">
            <div className="text-[11px] text-emerald-400 font-sans tracking-wide uppercase">
              Electrocardiograph
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-5xl font-black text-emerald-400 tracking-tighter">
                {heartRate}
              </div>
              <div className="text-xs text-emerald-500 font-sans">bpm</div>
            </div>
          </div>

          {/* Blood Pressure Channel */}
          <div className="p-3 flex-1 flex flex-col justify-between border-l-4 border-l-slate-400 bg-slate-900/20">
            <div className="text-[11px] text-slate-300 font-sans tracking-wide uppercase">
              Non-invasive Blood Press
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-white tracking-tight">
                {systolicBp} / {diastolicBp}
              </div>
              <div className="text-sm font-semibold text-slate-400 font-sans">
                ({meanBp})
              </div>
            </div>
          </div>

          {/* Pulse Oximetry SpO2 Channel */}
          <div className="p-3 flex-1 flex flex-col justify-between border-l-4 border-l-amber-500 bg-amber-950/10">
            <div className="text-[11px] text-amber-400 font-sans tracking-wide uppercase">
              Pulse Oximetry
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-extrabold text-amber-400 tracking-tight">
                {spo2} <span className="text-2xl font-normal">%</span>
              </div>
              <div className="text-xs text-amber-400 font-bold">@ {heartRate}</div>
            </div>
          </div>

          {/* End-Tidal Capnography Channel */}
          <div className="p-3 flex-1 flex flex-col justify-between border-l-4 border-l-cyan-400 bg-cyan-950/10">
            <div className="text-[11px] text-cyan-400 font-sans tracking-wide uppercase">
              End-tidal Capnography
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-cyan-400 tracking-tight">
                {etco2}
              </div>
              <div className="text-xs text-cyan-400 font-bold">@ {respiratoryRate}</div>
            </div>
          </div>
        </div>

        {/* Waveform Canvas (Right Column) */}
        <div className="col-span-8 relative bg-black flex flex-col">
          {/* Channel Label Overlays */}
          <div className="absolute top-2 right-3 text-[10px] text-emerald-400/80 font-sans z-10 pointer-events-none">
            Electrocardiograph (ECG) Lead II
          </div>
          <div className="absolute top-[26%] right-3 text-[10px] text-emerald-500/80 font-sans z-10 pointer-events-none">
            Electrocardiograph (ECG) Lead III
          </div>
          <div className="absolute top-[52%] right-3 text-[10px] text-amber-400/80 font-sans z-10 pointer-events-none">
            Pulse Oximetry Plethysmograph
          </div>
          <div className="absolute top-[77%] right-3 text-[10px] text-cyan-400/80 font-sans z-10 pointer-events-none">
            End-tidal Capnography (EtCO2)
          </div>

          <canvas
            ref={canvasRef}
            width={580}
            height={340}
            className="w-full h-full block"
          />
        </div>
      </div>
    </div>
  );
};
