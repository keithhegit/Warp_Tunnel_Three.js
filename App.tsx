
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import WarpTunnel from './components/WarpTunnel';

const App: React.FC = () => {
  // Initialize default speed to 20% (0.2) as requested
  const [speed, setSpeed] = useState(0.2);
  const [isAutoAccelerating, setIsAutoAccelerating] = useState(false);
  const animationRef = useRef<number>(0);

  // White flash starts appearing at 100% (1.0) and reaches full opacity at 200% (2.0)
  const flashOpacity = useMemo(() => {
    if (speed < 1.0) return 0;
    // Map 1.0 -> 2.0 to 0 -> 1 range
    return Math.min(1, (speed - 1.0) / 1.0);
  }, [speed]);

  // Handle manual speed changes
  const adjustSpeed = useCallback((delta: number) => {
    if (isAutoAccelerating) setIsAutoAccelerating(false);
    setSpeed(prev => {
      const next = Math.min(2.0, Math.max(0.2, prev + delta));
      return parseFloat(next.toFixed(2)); // Clean floating point errors
    });
  }, [isAutoAccelerating]);

  // Initiate the jump sequence
  const startHyperdrive = () => {
    // Reset to base 20% immediately before starting the ramp
    setSpeed(0.2);
    setIsAutoAccelerating(true);
  };

  // Smooth Accumulation Logic
  useEffect(() => {
    if (!isAutoAccelerating) return;

    // We use a fixed duration to go from 0.2 to 2.0
    const startValue = 0.2;
    const endValue = 2.0;
    const duration = 6000; // 6 seconds to complete the jump
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Linear accumulation simulation
      // Even if the frame rate varies, it follows the time-based linear path
      const currentSpeed = startValue + (endValue - startValue) * progress;
      
      setSpeed(currentSpeed);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAutoAccelerating(false);
        setSpeed(2.0); // Ensure final state is exactly 200%
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAutoAccelerating]);

  return (
    <div className="relative w-full h-full text-white font-mono select-none overflow-hidden bg-black">
      {/* Three.js Background with FOV stretch effect at high speeds */}
      <div 
        className="w-full h-full transition-transform duration-500 ease-out"
        style={{ 
          transform: speed > 1.4 ? `scale(${1 + (speed - 1.4) * 0.5})` : 'scale(1)',
          filter: speed > 1.8 ? `blur(${(speed - 1.8) * 10}px)` : 'none'
        }}
      >
        <WarpTunnel speedMultiplier={speed} />
      </div>

      {/* Cinematic Border and Shadows */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-black/30 z-10" />
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black via-black/40 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-10" />

      {/* White Out Transition Layer */}
      <div 
        className="fixed inset-0 bg-white pointer-events-none z-50 transition-opacity duration-100" 
        style={{ 
          opacity: flashOpacity,
          mixBlendMode: 'screen'
        }} 
      />
      
      {/* Absolute White Cover at 200% */}
      {speed >= 1.99 && (
        <div className="fixed inset-0 bg-white z-[100]" />
      )}

      {/* Control Interface */}
      <div 
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 z-[110] transition-all duration-700 ${speed >= 2.0 ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}
      >
        {/* Speed Dial */}
        <div className="flex items-center gap-8 bg-black/60 backdrop-blur-3xl px-10 py-5 rounded-full border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)]">
          <button 
            onClick={() => adjustSpeed(-0.1)}
            disabled={isAutoAccelerating}
            className="w-12 h-12 rounded-full border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center text-2xl active:scale-90 disabled:opacity-10"
          >
            -
          </button>
          <div className="flex flex-col items-center min-w-[160px]">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 mb-2 font-bold">Warp Factor</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tighter italic">{(speed * 100).toFixed(0)}</span>
              <span className="text-sm font-bold opacity-40">%</span>
            </div>
          </div>
          <button 
            onClick={() => adjustSpeed(0.1)}
            disabled={isAutoAccelerating}
            className="w-12 h-12 rounded-full border border-white/20 hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center text-2xl active:scale-90 disabled:opacity-10"
          >
            +
          </button>
        </div>

        {/* Hyperdrive Initiation Button */}
        <button 
          onClick={startHyperdrive}
          disabled={isAutoAccelerating || speed >= 2.0}
          className={`px-14 py-5 rounded-full border text-[11px] font-black uppercase tracking-[0.6em] transition-all duration-1000 overflow-hidden relative group shadow-2xl
            ${isAutoAccelerating 
              ? 'border-cyan-400/50 bg-cyan-900/40 text-cyan-100' 
              : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]'}`}
        >
          <span className="relative z-10 flex items-center gap-3">
            {isAutoAccelerating && <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />}
            {isAutoAccelerating ? 'Initiating Jump Sequence' : 'Engage Hyperdrive'}
          </span>
          {isAutoAccelerating && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1s_infinite] -translate-x-full" />
          )}
        </button>

        {/* Status Text */}
        <div className="flex flex-col items-center gap-1 opacity-40">
           <div className="text-[9px] uppercase tracking-[1em] animate-pulse">
            {speed >= 1.8 ? 'Critical Threshold' : speed >= 1.0 ? 'Trans-Warp Active' : 'Sub-Light Propulsion'}
          </div>
        </div>
      </div>

      {/* Screen Grain/Noise for Texture */}
      <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay z-[120]"></div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;
