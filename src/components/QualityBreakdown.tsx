import React, { useState } from 'react';
import {
  Tv,
  Gamepad2,
  Video,
  CloudUpload,
  Copy,
  Check,
  Share2,
  Download,
  RotateCcw,
  Sparkles,
  FileText,
} from 'lucide-react';
import { SpeedMetrics } from '../types/speedtest';
import { getActivityRatings } from '../utils/qualityRating';
import {
  copyToClipboard,
  downloadJsonFile,
  downloadTextReport,
  generateReportText,
  formatMbps,
  formatMs,
} from '../utils/formatters';

interface QualityBreakdownProps {
  metrics: SpeedMetrics;
  onTestAgain: () => void;
  theme: 'dark' | 'light';
}

export const QualityBreakdown: React.FC<QualityBreakdownProps> = ({
  metrics,
  onTestAgain,
  theme,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const isLight = theme === 'light';

  const activities = getActivityRatings(
    metrics.downloadSpeed,
    metrics.uploadSpeed,
    metrics.ping,
    metrics.jitter
  );

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'superb':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'good':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'fair':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const getOverallTag = () => {
    switch (metrics.qualityRating) {
      case 'excellent':
        return {
          title: 'Ultra High-Speed Broadband',
          desc: 'Exceptional throughput with esports-tier low latency. Ready for heavy 4K/8K multi-stream loads and concurrent workflows.',
          color: 'text-emerald-400',
        };
      case 'good':
        return {
          title: 'Fast & Reliable Connection',
          desc: 'High-speed connection that handles 4K streaming, smooth remote video conferences, and responsive online play.',
          color: 'text-cyan-400',
        };
      case 'fair':
        return {
          title: 'Standard Internet Performance',
          desc: 'Adequate for standard HD streaming and web browsing, but may experience slowdowns during large concurrent uploads.',
          color: 'text-amber-400',
        };
      default:
        return {
          title: 'Sub-Optimal Network Throughput',
          desc: 'Elevated latency or constrained bandwidth detected. Consider checking Wi-Fi distance or network congestion.',
          color: 'text-rose-400',
        };
    }
  };

  const overall = getOverallTag();

  const handleCopy = async () => {
    const text = generateReportText(metrics);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    const text = `⚡ NetSpeed Pro: Download ${formatMbps(metrics.downloadSpeed)} Mbps, Upload ${formatMbps(metrics.uploadSpeed)} Mbps, Ping ${formatMs(metrics.ping)} ms.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NetSpeed Pro Internet Speed Test Results',
          text,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadJson = () => {
    downloadJsonFile(`netspeed-pro-report-${Date.now()}.json`, metrics);
    setDownloadDropdown(false);
  };

  const handleDownloadText = () => {
    const text = generateReportText(metrics);
    downloadTextReport(`netspeed-pro-report-${Date.now()}.txt`, text);
    setDownloadDropdown(false);
  };

  return (
    <div className="w-full mt-10 space-y-6">
      {/* Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-md bg-slate-900/40 border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            Benchmark Finalized
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">
            Duration: {(metrics.testDurationMs / 1000).toFixed(1)}s
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Test Again Button */}
          <button
            onClick={onTestAgain}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Test Again</span>
          </button>

          {/* Copy Results */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Share</span>
          </button>

          {/* Download Report Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDownloadDropdown(!downloadDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Export</span>
            </button>

            {downloadDropdown && (
              <div className="absolute right-0 bottom-full mb-2 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1.5 z-30">
                <button
                  onClick={handleDownloadText}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download Text Report</span>
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-purple-400" />
                  <span>Download JSON Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quality Summary Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900/60 border-slate-800 backdrop-blur-md'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className={`text-base font-bold ${overall.color}`}>
                {overall.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {overall.desc}
            </p>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
            <div className="text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                Overall Grade
              </span>
              <span className="text-xl font-extrabold uppercase tracking-wide text-cyan-400 font-mono">
                {metrics.qualityRating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-World Activity Suitability Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {activities.map((act) => {
          const Icon =
            act.iconName === 'Tv'
              ? Tv
              : act.iconName === 'Gamepad2'
              ? Gamepad2
              : act.iconName === 'Video'
              ? Video
              : CloudUpload;

          return (
            <div
              key={act.name}
              className={`p-4 rounded-xl border transition-all ${
                isLight
                  ? 'bg-white/90 border-slate-200/90'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-slate-800/60 text-slate-300">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getRatingBadge(
                    act.rating
                  )}`}
                >
                  {act.rating}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">{act.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                {act.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
