import React, { useMemo } from 'react';
import { TestPhase } from '../types/speedtest';
import { formatMbps, formatMs } from '../utils/formatters';

interface SpeedometerProps {
  phase: TestPhase;
  currentValue: number;
  peakValue?: number;
  percent: number;
  isTesting: boolean;
  theme: 'dark' | 'light';
}

const TICKS = [0, 10, 25, 50, 100, 250, 500, 1000];

export const Speedometer: React.FC<SpeedometerProps> = ({
  phase,
  currentValue,
  peakValue = 0,
  percent,
  isTesting,
  theme,
}) => {
  // Map value to 0-1 fraction for gauge display
  const fraction = useMemo(() => {
    if (phase === 'ping') {
      // 0 to 200ms scale
      return Math.min(Math.max(currentValue / 150, 0), 1);
    }
    // Mbps scale (piecewise logarithmic mapping for aesthetic deflection)
    const val = Math.max(0, currentValue);
    if (val <= 0) return 0;
    if (val <= 10) return (val / 10) * 0.18;
    if (val <= 50) return 0.18 + ((val - 10) / 40) * 0.22; // 0.18 - 0.40
    if (val <= 100) return 0.40 + ((val - 50) / 50) * 0.18; // 0.40 - 0.58
    if (val <= 250) return 0.58 + ((val - 100) / 150) * 0.17; // 0.58 - 0.75
    if (val <= 500) return 0.75 + ((val - 250) / 250) * 0.13; // 0.75 - 0.88
    if (val <= 1000) return 0.88 + ((val - 500) / 500) * 0.12; // 0.88 - 1.00
    return 1;
  }, [phase, currentValue]);

  // Geometry configuration
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const r = 126;
  const startAngle = 135; // degrees (bottom-left)
  const sweepAngle = 270; // degrees total arc
  const endAngle = startAngle + sweepAngle; // 405 degrees (bottom-right)

  const circumference = 2 * Math.PI * r;
  const arcLength = (sweepAngle / 360) * circumference;
  const dashOffset = arcLength * (1 - fraction);

  // Needle angle in degrees
  const needleAngle = startAngle + fraction * sweepAngle;

  // Active theme & phase color palette
  const phaseColors = useMemo(() => {
    if (phase === 'ping') {
      return {
        stroke: 'url(#pingGradient)',
        glow: 'rgba(56, 189, 248, 0.4)',
        accent: '#38bdf8',
        label: 'LATENCY (PING)',
        unit: 'ms',
      };
    }
    if (phase === 'download') {
      return {
        stroke: 'url(#downloadGradient)',
        glow: 'rgba(6, 182, 212, 0.5)',
        accent: '#06b6d4',
        label: 'DOWNLOAD SPEED',
        unit: 'Mbps',
      };
    }
    if (phase === 'upload') {
      return {
        stroke: 'url(#uploadGradient)',
        glow: 'rgba(168, 85, 247, 0.5)',
        accent: '#a855f7',
        label: 'UPLOAD SPEED',
        unit: 'Mbps',
      };
    }
    if (phase === 'completed') {
      return {
        stroke: 'url(#completedGradient)',
        glow: 'rgba(16, 185, 129, 0.4)',
        accent: '#10b981',
        label: 'TEST COMPLETE',
        unit: 'Mbps',
      };
    }
    return {
      stroke: 'url(#idleGradient)',
      glow: 'rgba(59, 130, 246, 0.25)',
      accent: '#3b82f6',
      label: 'READY TO BENCHMARK',
      unit: 'Mbps',
    };
  }, [phase]);

  // Generate tick markers around perimeter
  const tickElements = useMemo(() => {
    return TICKS.map((tickVal) => {
      let tickFrac = 0;
      if (tickVal === 0) tickFrac = 0;
      else if (tickVal <= 10) tickFrac = (tickVal / 10) * 0.18;
      else if (tickVal <= 50) tickFrac = 0.18 + ((tickVal - 10) / 40) * 0.22;
      else if (tickVal <= 100) tickFrac = 0.40 + ((tickVal - 50) / 50) * 0.18;
      else if (tickVal <= 250) tickFrac = 0.58 + ((tickVal - 100) / 150) * 0.17;
      else if (tickVal <= 500) tickFrac = 0.75 + ((tickVal - 250) / 250) * 0.13;
      else tickFrac = 1;

      const angleRad = ((startAngle + tickFrac * sweepAngle) * Math.PI) / 180;
      const x1 = cx + (r - 12) * Math.cos(angleRad);
      const y1 = cy + (r - 12) * Math.sin(angleRad);
      const x2 = cx + (r - 2) * Math.cos(angleRad);
      const y2 = cy + (r - 2) * Math.sin(angleRad);

      const labelR = r - 26;
      const lx = cx + labelR * Math.cos(angleRad);
      const ly = cy + labelR * Math.sin(angleRad);

      const isCurrentActive = fraction >= tickFrac;

      return (
        <g key={`tick-${tickVal}`}>
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isCurrentActive ? phaseColors.accent : theme === 'dark' ? '#334155' : '#cbd5e1'}
            strokeWidth={tickVal % 100 === 0 ? 2.5 : 1.5}
            strokeLinecap="round"
            className="transition-colors duration-300"
          />
          <text
            x={lx}
            y={ly + 4}
            textAnchor="middle"
            fontSize="10"
            fontWeight={isCurrentActive ? '700' : '500'}
            fill={isCurrentActive ? (theme === 'dark' ? '#f8fafc' : '#0f172a') : (theme === 'dark' ? '#64748b' : '#94a3b8')}
            className="select-none font-mono transition-colors duration-300"
          >
            {tickVal}
          </text>
        </g>
      );
    });
  }, [cx, cy, r, startAngle, sweepAngle, fraction, phaseColors.accent, theme]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-3xl transition-all duration-700 opacity-60"
        style={{
          background: phaseColors.glow,
          transform: isTesting ? 'scale(1.15)' : 'scale(0.85)',
        }}
      />

      {/* SVG Speedometer Gauge */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative z-10 overflow-visible"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="downloadGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="60%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>

          <linearGradient id="uploadGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="60%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          <linearGradient id="pingGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="completedGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          <linearGradient id="idleGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Needle drop shadow */}
          <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer subtle guide ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 14}
          fill="none"
          stroke={theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Background track arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={theme === 'dark' ? '#1e293b' : '#e2e8f0'}
          strokeWidth="14"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${cx} ${cy})`}
        />

        {/* Dynamic colored progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={phaseColors.stroke}
          strokeWidth="14"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${cx} ${cy})`}
          className="transition-all duration-150 ease-out"
        />

        {/* Gauge tick marks and numbers */}
        {tickElements}

        {/* Gauge Needle */}
        <g
          transform={`rotate(${needleAngle} ${cx} ${cy})`}
          className="transition-transform duration-150 ease-out"
          filter="url(#needleGlow)"
        >
          {/* Needle pointer */}
          <line
            x1={cx}
            y1={cy}
            x2={cx + r - 16}
            y2={cy}
            stroke={phaseColors.accent}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Needle tip glow dot */}
          <circle
            cx={cx + r - 16}
            cy={cy}
            r="4"
            fill="#ffffff"
            stroke={phaseColors.accent}
            strokeWidth="2"
          />
        </g>

        {/* Central hub circles */}
        <circle
          cx={cx}
          cy={cy}
          r="16"
          fill={theme === 'dark' ? '#0f172a' : '#ffffff'}
          stroke={theme === 'dark' ? '#334155' : '#cbd5e1'}
          strokeWidth="2"
        />
        <circle
          cx={cx}
          cy={cy}
          r="7"
          fill={phaseColors.accent}
          className="transition-colors duration-300"
        />
      </svg>

      {/* Center Digital Display */}
      <div className="absolute top-[160px] flex flex-col items-center justify-center text-center select-none pointer-events-none">
        {/* Phase Subtitle */}
        <span
          className="text-[11px] font-bold tracking-widest uppercase transition-colors duration-300"
          style={{ color: phaseColors.accent }}
        >
          {phaseColors.label}
        </span>

        {/* Main Number Counter */}
        <div className="flex items-baseline justify-center gap-1.5 my-1">
          <span
            className={`text-5xl md:text-6xl font-extrabold tracking-tight font-mono transition-all duration-150 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            {phase === 'ping' ? formatMs(currentValue) : formatMbps(currentValue)}
          </span>
          <span
            className={`text-sm md:text-base font-semibold ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {phaseColors.unit}
          </span>
        </div>

        {/* Peak Speed indicator when testing */}
        {isTesting && peakValue > 0 && phase !== 'ping' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>Peak:</span>
            <span className="font-semibold text-cyan-400">{formatMbps(peakValue)} Mbps</span>
          </div>
        )}

        {/* Overall progress indicator bar */}
        {isTesting && (
          <div className="w-36 h-1.5 mt-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full rounded-full transition-all duration-200 ease-out"
              style={{
                width: `${percent}%`,
                background: phaseColors.accent,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
