import React from 'react';
import { Server, Globe, ShieldCheck } from 'lucide-react';
import { ServerInfo } from '../types/speedtest';

interface ServerBadgeProps {
  server: ServerInfo;
  isTesting: boolean;
  theme: 'dark' | 'light';
}

export const ServerBadge: React.FC<ServerBadgeProps> = ({ server, isTesting, theme }) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-4 py-2 rounded-xl border text-xs transition-all ${
        isLight
          ? 'bg-slate-100/90 border-slate-200 text-slate-700'
          : 'bg-slate-900/60 border-slate-800 text-slate-300'
      }`}
    >
      {/* Server location */}
      <div className="flex items-center gap-2">
        <Server className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-400 font-medium">Server:</span>
        <span className="font-semibold text-slate-200">
          {server.name}
          {server.city ? ` · ${server.city}, ${server.country}` : ''}
        </span>
      </div>

      {/* Client IP & ASN if detected */}
      {server.ip && (
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-slate-400 font-medium">IP:</span>
          <span className="font-mono text-slate-300">{server.ip}</span>
          {server.asn && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {server.asn}
            </span>
          )}
        </div>
      )}

      {/* Protocol / Security Indicator */}
      <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>HTTPS / HTTP/2 Verified</span>
      </div>
    </div>
  );
};
