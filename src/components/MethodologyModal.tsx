import React from 'react';
import { X, CheckCircle2, ShieldCheck, Zap, Network, HelpCircle } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const isLight = theme === 'light';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#0a0f24] border-slate-800 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Measurement Methodology & Accuracy</span>
            </h2>
            <p className="text-xs text-slate-400">
              How NetSpeed Pro benchmarks your network without simulations
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <h3 className="font-bold text-sm text-cyan-400 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Cloudflare SpeedTest Engine & Zero-Fabrication Guarantee</span>
            </h3>
            <p>
              NetSpeed Pro is powered directly by Cloudflare's official open-source measurement engine (<code className="font-mono text-cyan-300">@cloudflare/speedtest</code>). It never uses random numbers, artificial counters, or simulated progress. Every byte and millisecond is extracted via the browser's native <code className="font-mono text-cyan-300">PerformanceResourceTiming</code> API and raw socket transfers against Cloudflare's global edge network.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              <span>How Each Metric is Computed</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                <span className="font-bold text-slate-200 block text-xs">Latency (Ping)</span>
                <p className="text-slate-400 mt-1">
                  8 sequential round-trip requests are sent to the nearest Anycast edge node. Outlier spikes are filtered using median computation to reflect baseline round-trip response time.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                <span className="font-bold text-slate-200 block text-xs">Jitter (Variance)</span>
                <p className="text-slate-400 mt-1">
                  Calculated using RFC 3550 statistical mean absolute deviation between consecutive ping packets. Low jitter (&lt;5ms) ensures audio/video streams don't stutter.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                <span className="font-bold text-slate-200 block text-xs">Download Speed</span>
                <p className="text-slate-400 mt-1">
                  Multi-stream concurrent binary payload downloads saturate your actual bandwidth after TCP window ramp-up, counting every raw byte streamed into the browser reader.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800">
                <span className="font-bold text-slate-200 block text-xs">Upload Speed</span>
                <p className="text-slate-400 mt-1">
                  Uncompressible random binary byte buffers are transmitted via HTTP/2 POST requests directly to edge servers, evaluating outbound throughput without proxy compression artifacts.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Why Browser Tests Differ From ISP Advertised Speeds</span>
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li><strong className="text-slate-300">Wi-Fi &amp; Hardware Overhead:</strong> Wireless interference, router distance, and 2.4GHz vs 5GHz/6GHz bands create noticeable speed drop-offs compared to direct wired Ethernet.</li>
              <li><strong className="text-slate-300">TCP Slow-Start &amp; TLS:</strong> HTTPS encryption, protocol handshake headers, and browser process sandboxing represent 3–7% physical transport overhead.</li>
              <li><strong className="text-slate-300">Network Congestion &amp; VPNs:</strong> Active background downloads, active torrents, or commercial VPN tunnels route traffic through intermediary servers that add latency.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
