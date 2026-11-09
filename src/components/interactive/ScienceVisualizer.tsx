import React, { useState, useEffect, useRef } from 'react';
import {
  Atom,
  RotateCcw,
  Play,
  Pause,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';

export const ScienceVisualizer: React.FC = () => {
  const [activeSim, setActiveSim] = useState<'gravity' | 'waves' | 'pendulum'>('gravity');

  // Gravity sim state
  const [gravityG, setGravityG] = useState(1.2);
  const [satelliteSpeed, setSatelliteSpeed] = useState(2.8);
  const [satelliteDist, setSatelliteDist] = useState(140);
  const [isPlaying, setIsPlaying] = useState(true);

  // Wave sim state
  const [frequency1, setFrequency1] = useState(0.04);
  const [frequency2, setFrequency2] = useState(0.045);
  const [waveAmplitude, setWaveAmplitude] = useState(35);

  // Pendulum sim state
  const [pendulumLength, setPendulumLength] = useState(150);
  const [pendulumGravity, setPendulumGravity] = useState(9.8);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Orbital simulation loop
  useEffect(() => {
    if (activeSim !== 'gravity') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    let animationId: number;
    const trail: Array<{ x: number; y: number }> = [];

    const render = () => {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw central sun / planet
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 35);
      gradient.addColorStop(0, '#fde047');
      gradient.addColorStop(0.5, '#ea580c');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Satellite position
      const x = centerX + Math.cos(angle) * satelliteDist;
      const y = centerY + Math.sin(angle) * (satelliteDist * 0.7);

      trail.push({ x, y });
      if (trail.length > 90) trail.shift();

      // Draw orbit trail
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      trail.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Draw satellite
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isPlaying) {
        angle += (satelliteSpeed * 0.01 * gravityG * 80) / satelliteDist;
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [activeSim, gravityG, satelliteSpeed, satelliteDist, isPlaying]);

  // Wave interference simulation loop
  useEffect(() => {
    if (activeSim !== 'waves') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let animationId: number;

    const render = () => {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height / 2;

      // Draw Wave 1 (Cyan)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = centerY - 60 + Math.sin(x * frequency1 + time) * (waveAmplitude * 0.6);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Wave 2 (Violet)
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = centerY - 60 + Math.sin(x * frequency2 - time * 0.8) * (waveAmplitude * 0.6);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Superposition Result Wave (Electric Cyan & White)
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const w1 = Math.sin(x * frequency1 + time) * waveAmplitude;
        const w2 = Math.sin(x * frequency2 - time * 0.8) * waveAmplitude;
        const y = centerY + 50 + (w1 + w2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (isPlaying) {
        time += 0.05;
      }
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [activeSim, frequency1, frequency2, waveAmplitude, isPlaying]);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Interactive Physics Laboratory
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Science Visualizer</h1>
          <p className="text-xs text-slate-400">
            Real-time interactive physics simulations for gravitational orbits and wave interference.
          </p>
        </div>

        {/* Sim Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-input">
          <button
            onClick={() => setActiveSim('gravity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSim === 'gravity'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gravitational Orbits
          </button>
          <button
            onClick={() => setActiveSim('waves')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSim === 'waves'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wave Interference
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="glass-panel-glow rounded-3xl border-cyan-400/30 overflow-hidden relative shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          className="w-full h-[340px] sm:h-[380px] block"
        />

        {/* Floating Controls Overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-white hover:text-cyan-300 transition-colors shadow-lg"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </div>

      {/* Simulation Controls Panel */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/30 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
          <Sliders size={16} />
          <span>Interactive Parameters</span>
        </div>

        {activeSim === 'gravity' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Gravitational Parameter (G·M):</span>
                <span className="font-mono text-cyan-400">{gravityG}</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={gravityG}
                onChange={(e) => setGravityG(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Orbital Velocity ($v$):</span>
                <span className="font-mono text-cyan-400">{satelliteSpeed}</span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                step={0.2}
                value={satelliteSpeed}
                onChange={(e) => setSatelliteSpeed(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Semi-Major Radius ($r$):</span>
                <span className="font-mono text-cyan-400">{satelliteDist}px</span>
              </div>
              <input
                type="range"
                min={80}
                max={220}
                step={5}
                value={satelliteDist}
                onChange={(e) => setSatelliteDist(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Frequency Wave 1:</span>
                <span className="font-mono text-cyan-400">{frequency1.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.1}
                step={0.005}
                value={frequency1}
                onChange={(e) => setFrequency1(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Frequency Wave 2:</span>
                <span className="font-mono text-cyan-400">{frequency2.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min={0.01}
                max={0.1}
                step={0.005}
                value={frequency2}
                onChange={(e) => setFrequency2(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Amplitude (Energy):</span>
                <span className="font-mono text-cyan-400">{waveAmplitude}</span>
              </div>
              <input
                type="range"
                min={15}
                max={60}
                step={1}
                value={waveAmplitude}
                onChange={(e) => setWaveAmplitude(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
