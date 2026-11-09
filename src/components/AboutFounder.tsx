import React from 'react';
import { Target, Compass, Sparkles, Code2, Lightbulb, Cpu } from 'lucide-react';

interface AboutFounderProps {
  theme: 'dark' | 'light';
}

export const AboutFounder: React.FC<AboutFounderProps> = ({ theme }) => {
  const isLight = theme === 'light';

  return (
    <section
      id="about-founder"
      className="w-full mt-16 md:mt-24 pt-12 md:pt-16 border-t border-slate-800/80 transition-colors"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* Section Header Tag */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Leadership &amp; Vision</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            About the{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Founder
            </span>
          </h2>
          <p
            className={`mt-2 text-sm sm:text-base max-w-xl ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            The driving mind and creative direction behind NetSpeed Pro
          </p>
        </div>

        {/* Main Founder Profile Card */}
        <div
          className={`relative rounded-3xl p-6 sm:p-8 md:p-10 border transition-all duration-300 overflow-hidden ${
            isLight
              ? 'bg-white/95 border-slate-200 shadow-xl'
              : 'bg-gradient-to-b from-[#090f26]/95 to-[#060a1a]/95 border-cyan-500/20 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl'
          }`}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-center">
            {/* Left Column: Landscape Photograph */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="relative w-full rounded-2xl p-1 bg-gradient-to-tr from-cyan-500/40 via-blue-600/30 to-purple-600/40 shadow-xl shadow-cyan-500/15 group">
                {/* Photo Frame */}
                <div className="relative w-full rounded-[14px] overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center">
                  <img
                    src="/assets/aistudio/file_00000000f29082118b8932ee472889fb_17d271c4.png"
                    alt="Wajid Khan - Founder of NetSpeed Pro"
                    className="w-full h-full object-cover sm:object-contain rounded-[14px] transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                </div>

                {/* Subtle corner tech accent */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-300 tracking-wider">
                  FOUNDER &amp; DEVELOPER
                </div>
              </div>

              {/* Founder Pillars */}
              <div className="grid grid-cols-3 gap-2 w-full mt-4 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center">
                  <Code2 className="w-4 h-4 text-cyan-400 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-200">Developer</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center">
                  <Cpu className="w-4 h-4 text-blue-400 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-200">Technology</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col items-center">
                  <Lightbulb className="w-4 h-4 text-purple-400 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-200">Creative</span>
                </div>
              </div>
            </div>

            {/* Right Column: Founder Details & Biography */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              {/* Name & Title Header */}
              <div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  Wajid Khan
                </h3>
                <div className="mt-1.5 flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-cyan-400 font-mono">
                  <span>Developer</span>
                  <span className="text-slate-600">|</span>
                  <span>Technology Enthusiast</span>
                  <span className="text-slate-600">|</span>
                  <span>Creative Thinker</span>
                </div>
              </div>

              {/* Biography Prose */}
              <div
                className={`space-y-3.5 text-xs sm:text-sm leading-relaxed ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                <p>
                  Meet <strong className="text-white font-semibold">Wajid Khan</strong>, a passionate developer, technology enthusiast, and creative thinker who believes in the power of technology to transform everyday experiences.
                </p>
                <p>
                  Driven by curiosity, creativity, and a passion for digital innovation, he is dedicated to exploring modern technologies and building useful, beautiful, and user-friendly digital solutions.
                </p>
                <p>
                  His approach combines creative thinking, continuous learning, and attention to detail to turn ideas into meaningful digital experiences.
                </p>
                <p className="text-slate-400 italic">
                  &ldquo;He believes that great technology should not only be powerful but also simple and accessible to everyone.&rdquo;
                </p>
              </div>

              {/* Mission Highlight Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900/70 to-cyan-950/40 border border-cyan-500/30">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  <Target className="w-4 h-4" />
                  <span>Mission</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed">
                  &ldquo;To make technology simpler, smarter, and more accessible by creating innovative digital experiences that solve real-world problems.&rdquo;
                </p>
              </div>

              {/* About NetSpeed Pro Vision */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>About NetSpeed Pro</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  &ldquo;NetSpeed Pro is built with a vision to provide everyone with a fast, simple, and reliable way to understand their internet connection performance.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
