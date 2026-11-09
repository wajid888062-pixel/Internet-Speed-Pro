import { History, HelpCircle, Moon, Sun, User, Star } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onOpenMethodology: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenHistory,
  onOpenMethodology,
  historyCount,
}) => {
  const isLight = theme === 'light';

  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-[#070c1e]/90 border-cyan-500/15 shadow-lg shadow-black/20 text-slate-100 transition-colors"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo - Official User Asset */}
        <a
          href="/"
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl"
          title="NetSpeed Pro - Home"
        >
          {/* Logo Container with object-contain */}
          <div className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500/40 via-blue-500/20 to-purple-500/40 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-400/40 group-hover:scale-105 transition-all duration-300">
            <img
              src="/assets/aistudio/file_000000000da08211956b25793ecb2d68_0ccaa503.png"
              alt="NetSpeed Pro Official Brand Logo"
              className="w-full h-full object-contain rounded-full"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:brightness-110 transition-all">
                NetSpeed
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
              Check Your Internet Speed
            </p>
          </div>
        </a>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Rate Us */}
          <button
            onClick={() => {
              const el = document.getElementById('rate-us');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isLight
                ? 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="Rate NetSpeed Pro"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span className="hidden sm:inline">Rate</span>
          </button>

          {/* About Founder */}
          <button
            onClick={() => {
              const el = document.getElementById('about-founder');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isLight
                ? 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="About the Founder"
          >
            <User className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Founder</span>
          </button>

          {/* Methodology / How It Works */}
          <button
            onClick={onOpenMethodology}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isLight
                ? 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="How measurements work"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">How It Works</span>
          </button>

          {/* Test History */}
          <button
            onClick={onOpenHistory}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              isLight
                ? 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="View Test History"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg border transition-all ${
              isLight
                ? 'bg-slate-100/80 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            aria-label="Toggle dark/light mode"
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
