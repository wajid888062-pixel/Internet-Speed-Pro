/**
 * NetSpeed Pro formatting and export utilities
 */

export function formatMbps(val: number | undefined | null, decimals = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '0.0';
  if (val < 0.1 && val > 0) return '< 0.1';
  if (val >= 100) return val.toFixed(1);
  return val.toFixed(decimals);
}

export function formatMs(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  if (val < 1 && val > 0) return '< 1';
  return Math.round(val).toString();
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateReportText(metrics: {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  server: { name: string; city?: string; country?: string; ip?: string; colo?: string };
  timestamp: number;
  testDurationMs?: number;
}): string {
  const dateStr = formatDate(metrics.timestamp);
  const location = [metrics.server.city, metrics.server.country, metrics.server.colo ? `(${metrics.server.colo})` : '']
    .filter(Boolean)
    .join(' ');

  return `⚡ NetSpeed Pro - Internet Performance Report
==================================================
Date & Time: ${dateStr}
Server: ${metrics.server.name} ${location ? `[${location}]` : ''}
${metrics.server.ip ? `Client IP: ${metrics.server.ip}` : ''}

RESULTS:
--------------------------------------------------
⬇️ Download Speed : ${formatMbps(metrics.downloadSpeed)} Mbps
⬆️ Upload Speed   : ${formatMbps(metrics.uploadSpeed)} Mbps
📶 Latency (Ping) : ${formatMs(metrics.ping)} ms
〰️ Jitter         : ${formatMs(metrics.jitter)} ms
⏱️ Test Duration  : ${metrics.testDurationMs ? (metrics.testDurationMs / 1000).toFixed(1) + 's' : 'N/A'}

Engine: Real-time Cloudflare Anycast Edge Benchmarking
Generated via NetSpeed Pro
==================================================`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

export function downloadJsonFile(filename: string, data: object): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTextReport(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
