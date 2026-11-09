import React from 'react';
import { ArrowDown, ArrowUp, Activity, Waves } from 'lucide-react';
import { formatMbps, formatMs, formatBytes } from '../utils/formatters';

interface MetricCardProps {
  type: 'download' | 'upload' | 'ping' | 'jitter';
  value: number | undefined;
  peak?: number;
  transferredBytes?: number;
  isActive: boolean;
  isCompleted: boolean;
  theme: 'dark' | 'light';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  type,
  value,
  peak,
  transferredBytes,
  isActive,
  isCompleted,
  theme,
}) => {
  const config = {
    download: {
      title: 'DOWNLOAD',
      unit: 'Mbps',
      icon: ArrowDown,
      color: 'text-cyan-400',
      activeBorder: 'border-cyan-500/50 shadow-lg shadow-cyan-500/10',
      bgGlow: 'bg-cyan-500/10',
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
    },
    upload: {
      title: 'UPLOAD',
      unit: 'Mbps',
      icon: ArrowUp,
      color: 'text-purple-400',
      activeBorder: 'border-purple-500/50 shadow-lg shadow-purple-500/10',
      bgGlow: 'bg-purple-500/10',
      badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    },
    ping: {
      title: 'LATENCY (PING)',
      unit: 'ms',
      icon: Activity,
      color: 'text-sky-400',
      activeBorder: 'border-sky-500/50 shadow-lg shadow-sky-500/10',
      bgGlow: 'bg-sky-500/10',
      badgeColor: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
    },
    jitter: {
      title: 'JITTER',
      unit: 'ms',
      icon: Waves,
      color: 'text-emerald-400',
      activeBorder: 'border-emerald-500/50 shadow-lg shadow-emerald-500/10',
      bgGlow: 'bg-emerald-500/10',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    },
  }[type];

  const Icon = config.icon;
  const isLight = theme === 'light';

  const displayVal =
    type === 'ping' || type === 'jitter'
      ? formatMs(value)
      : formatMbps(value);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 md:p-6 transition-all duration-300 border ${
        isActive
          ? `${config.activeBorder} ${isLight ? 'bg-white shadow-md' : 'bg-slate-900/90'}`
          : isLight
          ? 'bg-white/80 border-slate-200/90 hover:border-slate-300 shadow-sm'
          : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700/80 backdrop-blur-md'
      }`}
    >
      {/* Active pulse highlight bar */}
      {isActive && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            type === 'download'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
              : type === 'upload'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-400'
              : 'bg-gradient-to-r from-sky-500 to-emerald-400'
          } animate-pulse`}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl ${config.bgGlow} ${
              isActive ? 'scale-110' : ''
            } transition-transform duration-300`}
          >
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3
              className={`text-xs font-bold tracking-wider ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {config.title}
            </h3>
            {isActive && (
              <span className="flex items-center gap-1.5 text-[10px] text-cyan-400 font-medium">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Testing...
              </span>
            )}
          </div>
        </div>

        {/* Transfer payload size info */}
        {transferredBytes && transferredBytes > 0 ? (
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {formatBytes(transferredBytes)}
          </span>
        ) : null}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2 mt-2">
        <span
          className={`text-3xl md:text-4xl font-extrabold font-mono tracking-tight transition-colors ${
            value && value > 0
              ? isLight
                ? 'text-slate-900'
                : 'text-white'
              : isLight
              ? 'text-slate-300'
              : 'text-slate-600'
          }`}
        >
          {displayVal}
        </span>
        <span
          className={`text-sm font-semibold ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {config.unit}
        </span>
      </div>

      {/* Footer Info / Peak Speed */}
      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-xs">
        {peak && peak > 0 && (type === 'download' || type === 'upload') ? (
          <div className="flex items-center gap-1 text-slate-400">
            <span>Peak:</span>
            <span className="font-semibold text-slate-300 font-mono">
              {formatMbps(peak)} Mbps
            </span>
          </div>
        ) : (
          <span
            className={`${
              isLight ? 'text-slate-400' : 'text-slate-500'
            } text-[11px]`}
          >
            {type === 'download'
              ? 'Inbound stream throughput'
              : type === 'upload'
              ? 'Outbound payload speed'
              : type === 'ping'
              ? 'Round-trip response time'
              : 'Packet timing variance'}
          </span>
        )}

        {isCompleted && value && value > 0 && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              type === 'download'
                ? value >= 100
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-cyan-500/10 text-cyan-400'
                : type === 'upload'
                ? value >= 20
                  ? 'bg-purple-500/10 text-purple-400'
                  : 'bg-indigo-500/10 text-indigo-400'
                : value <= 30
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            Verified
          </span>
        )}
      </div>
    </div>
  );
};
