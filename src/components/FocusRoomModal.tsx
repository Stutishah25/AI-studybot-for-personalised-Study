import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Target, 
  Volume2, 
  VolumeX,
  Clock
} from 'lucide-react';

interface FocusRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusRoomModal: React.FC<FocusRoomModalProps> = ({ isOpen, onClose }) => {
  const { currentSubject, incrementStudyTime } = useStudy();

  const [selectedDuration, setSelectedDuration] = useState<number>(25); // minutes
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionGoal, setSessionGoal] = useState<string>('Master AVL Tree Rotations and complete recall check');
  const [completed, setCompleted] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<boolean>(false);
  const [customMinutes, setCustomMinutes] = useState<string>('30');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          setCompleted(true);
          incrementStudyTime(selectedDuration);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, selectedDuration, incrementStudyTime]);

  if (!isOpen) return null;

  const setTimer = (mins: number) => {
    setSelectedDuration(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
    setCompleted(false);
    setIsCustom(false);
  };

  const handleCustomApply = () => {
    const mins = Math.max(1, parseInt(customMinutes, 10) || 30);
    setSelectedDuration(mins);
    setTimeLeft(mins * 60);
    setIsRunning(false);
    setCompleted(false);
    setIsCustom(true);
  };

  const resetTimer = () => {
    setTimeLeft(selectedDuration * 60);
    setIsRunning(false);
    setCompleted(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((selectedDuration * 60 - timeLeft) / (selectedDuration * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070a12]/95 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Ambient background pulsing orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-xl bg-[#0f1526]/90 border border-violet-500/30 rounded-3xl p-8 md:p-10 shadow-2xl flex flex-col items-center text-center space-y-8">
        {/* Top Control */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-full border border-cyan-800/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            FOCUS SANCTUARY
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAmbientSound(!ambientSound)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={ambientSound ? 'Mute ambient study tone' : 'Enable ambient focus chime'}
            >
              {ambientSound ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Goal Section */}
        <div className="w-full space-y-2">
          <span className="text-xs uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <Target className="w-3.5 h-3.5 text-cyan-400" /> Current Study Goal
          </span>
          <input
            type="text"
            value={sessionGoal}
            onChange={e => setSessionGoal(e.target.value)}
            className="w-full text-center text-lg font-medium text-white bg-transparent border-b border-slate-700/60 focus:border-cyan-400 focus:outline-none py-1 transition-colors"
          />
          <span className="text-xs text-violet-300/80">Subject: {currentSubject?.name || 'Computer Science'}</span>
        </div>

        {/* Big Circular Progress Ring & Timer */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-800"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-cyan-400 transition-all duration-1000 ease-linear"
              strokeWidth="5"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center space-y-1">
            <span className="text-5xl font-mono font-bold text-white tracking-wider">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
              {isRunning ? 'Focused' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Timer Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[25, 45, 60].map(mins => (
            <button
              key={mins}
              type="button"
              onClick={() => setTimer(mins)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedDuration === mins && !isCustom
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-[#151d33] text-slate-300 hover:bg-[#1b2542] border border-slate-700/60'
              }`}
            >
              {mins} min
            </button>
          ))}
          <div className="flex items-center gap-1.5 bg-[#151d33] border border-slate-700/60 rounded-xl px-2 py-1">
            <input
              type="number"
              value={customMinutes}
              onChange={e => setCustomMinutes(e.target.value)}
              className="w-12 text-center bg-transparent text-xs text-white focus:outline-none"
              placeholder="mins"
            />
            <button
              type="button"
              onClick={handleCustomApply}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                isCustom ? 'bg-cyan-500 text-black' : 'text-slate-300 hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-[#141b2e] border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-600 hover:opacity-95 text-black font-bold text-base shadow-xl shadow-cyan-950/50 flex items-center gap-3 transition-all"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-black" /> Pause Focus
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-black" /> Start Session
              </>
            )}
          </button>
        </div>

        {/* Completion Modal Alert */}
        {completed && (
          <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-left space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>Study session complete 🎉</span>
            </div>
            <p className="text-xs text-slate-300">
              Outstanding work! Your deep focus session has been logged into your study metrics.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-black/40 border border-emerald-900/50">
                <span className="block text-base font-bold text-white">{selectedDuration} min</span>
                <span className="text-[10px] text-slate-400">Time Studied</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-emerald-900/50">
                <span className="block text-base font-bold text-emerald-400">+10%</span>
                <span className="text-[10px] text-slate-400">Progress Bump</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-emerald-900/50">
                <span className="block text-base font-bold text-amber-300">🔥 +1</span>
                <span className="text-[10px] text-slate-400">Streak Maintained</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
