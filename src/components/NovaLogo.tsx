import React from 'react';

interface NovaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const NovaLogo: React.FC<NovaLogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Glowing Knowledge Node & Open Book Star SVG */}
      <div className={`relative flex items-center justify-center ${iconSizes[size]}`}>
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-violet-500/30 to-amber-400/20 rounded-xl blur-md"></div>
        
        {/* Icon Frame */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-b from-[#1c2438] to-[#101524] border border-violet-400/30 p-1.5 shadow-lg shadow-cyan-950/40 flex items-center justify-center">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Open Book Wings / Knowledge Pages */}
            <path
              d="M4 22C8 20 12 20.5 16 23C20 20.5 24 20 28 22V9C24 7 20 7.5 16 10C12 7.5 8 7 4 9V22Z"
              className="stroke-cyan-300"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Center Spine */}
            <path
              d="M16 10V23"
              className="stroke-violet-300"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Central Glowing Star / Knowledge Node */}
            <circle cx="16" cy="6.5" r="2.2" className="fill-amber-300 filter drop-shadow(0 0 4px #f59e0b)" />
            {/* Sparkle Rays */}
            <path
              d="M16 2.5V4M16 9V10.5M12.5 6.5H14M18 6.5H19.5"
              stroke="#fbbf24"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Orbiting Knowledge Nodes */}
            <circle cx="9" cy="14" r="1" className="fill-cyan-300 opacity-80" />
            <circle cx="23" cy="14" r="1" className="fill-violet-300 opacity-80" />
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tracking-tight text-white ${textSizes[size]}`}>
            NOVA
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        </div>
        {showSubtitle && (
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            Your Personal AI Study Companion
          </span>
        )}
      </div>
    </div>
  );
};
