import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface StudyBuddyMascotProps {
  status?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

export const StudyBuddyMascot: React.FC<StudyBuddyMascotProps> = ({
  status = 'Study Buddy Online',
  size = 'md',
  showStatus = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Friendly Academic Mascot Avatar */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-[#1A1F26] via-[#12151A] to-[#0B0D10] border border-[#C5A059]/40 flex items-center justify-center shadow-lg shadow-black/50 overflow-hidden group cursor-pointer`}
        title="NOVA Socratic Study Buddy"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute inset-0 bg-radial from-[#C5A059]/20 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-teal-500/20 rounded-full blur-sm" />

        {/* Mascot Vector: Stylized Friendly Academic Companion */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4 relative z-10"
        >
          {/* Owl / Buddy Body */}
          <path
            d="M18 6C11.5 6 7.5 11 7.5 18C7.5 25 11.5 30 18 30C24.5 30 28.5 25 28.5 18C28.5 11 24.5 6 18 6Z"
            fill="#12151A"
            stroke="#C5A059"
            strokeWidth="1.5"
          />
          {/* Scholar Cap / Mortarboard */}
          <path
            d="M18 3L28 7.5L18 12L8 7.5L18 3Z"
            fill="#C5A059"
          />
          <path
            d="M26 8.5V14"
            stroke="#E2C78E"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="26" cy="14.5" r="1" fill="#E2C78E" />
          {/* Left Eye */}
          <circle cx="13.5" cy="17" r="3.2" fill="#1C222B" stroke="#C5A059" strokeWidth="1" />
          <circle cx="14" cy="16.5" r="1.5" fill="#2DD4BF" />
          <circle cx="14.5" cy="16" r="0.6" fill="#FFFFFF" />
          {/* Right Eye */}
          <circle cx="22.5" cy="17" r="3.2" fill="#1C222B" stroke="#C5A059" strokeWidth="1" />
          <circle cx="22" cy="16.5" r="1.5" fill="#2DD4BF" />
          <circle cx="22.5" cy="16" r="0.6" fill="#FFFFFF" />
          {/* Friendly Golden Beak */}
          <path
            d="M18 19L19.5 21.5H16.5L18 19Z"
            fill="#E2C78E"
          />
          {/* Chest Feathers / Open Page Arc */}
          <path
            d="M14 24C16 25 20 25 22 24"
            stroke="#C5A059"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>

        {/* Live Active Status Dot */}
        <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-[#12151A] animate-pulse" />
      </motion.div>

      {/* Text Label & Badge */}
      {showStatus && (
        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-serif font-bold text-white tracking-wide">
              NOVA Companion
            </span>
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
          </div>
          <span className="text-[10px] font-mono text-[#C5A059] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block animate-ping" />
            {status}
          </span>
        </div>
      )}
    </div>
  );
};
