import React from 'react';
import { TestPhase } from '../types/speedtest';

interface LiveWaveformProps {
  samples: number[];
  phase: TestPhase;
  theme: 'dark' | 'light';
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({ samples, phase, theme }) => {
  if (samples.length < 2) return null;

  const width = 280;
  const height = 48;
  const maxVal = Math.max(...samples, 10);
  const minVal = Math.min(...samples, 0);
  const range = maxVal - minVal || 1;

  // Calculate SVG polyline points
  const points = samples
    .map((val, idx) => {
      const x = (idx / (samples.length - 1)) * width;
      const y = height - ((val - minVal) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor =
    phase === 'download'
      ? '#06b6d4'
      : phase === 'upload'
      ? '#a855f7'
      : phase === 'ping'
      ? '#38bdf8'
      : '#10b981';

  return (
    <div className="w-full flex flex-col items-center mt-3 select-none">
      <div className="flex items-center justify-between w-full max-w-[280px] text-[10px] text-slate-400 font-mono mb-1">
        <span>Live Throughput</span>
        <span>{samples[samples.length - 1]} Mbps</span>
      </div>
      <div
        className={`w-full max-w-[280px] h-[52px] rounded-lg p-1 border overflow-hidden ${
          theme === 'dark'
            ? 'bg-slate-950/60 border-slate-800/80'
            : 'bg-slate-100/80 border-slate-200'
        }`}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveformFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#waveformFill)"
          />

          {/* Line stroke */}
          <polyline
            points={points}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current point dot */}
          {samples.length > 0 && (
            <circle
              cx={width}
              cy={height - ((samples[samples.length - 1] - minVal) / range) * (height - 8) - 4}
              r="3"
              fill="#fff"
              stroke={strokeColor}
              strokeWidth="2"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
