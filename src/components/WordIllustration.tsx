import React from 'react';

interface WordIllustrationProps {
  iconName: string;
  emoji: string;
  colorTheme: string;
  word: string;
  className?: string;
}

export const WordIllustration: React.FC<WordIllustrationProps> = ({
  iconName,
  emoji,
  colorTheme,
  word,
  className = '',
}) => {
  // Theme gradients
  const themeMap: Record<string, { bg: string; ring: string; text: string }> = {
    rose: { bg: 'from-rose-100 to-amber-50', ring: 'ring-rose-200/60', text: 'text-rose-600' },
    amber: { bg: 'from-amber-100 to-orange-50', ring: 'ring-amber-200/60', text: 'text-amber-600' },
    emerald: { bg: 'from-emerald-100 to-teal-50', ring: 'ring-emerald-200/60', text: 'text-emerald-600' },
    sky: { bg: 'from-sky-100 to-blue-50', ring: 'ring-sky-200/60', text: 'text-sky-600' },
    indigo: { bg: 'from-indigo-100 to-sky-50', ring: 'ring-indigo-200/60', text: 'text-indigo-600' },
    violet: { bg: 'from-violet-100 to-pink-50', ring: 'ring-violet-200/60', text: 'text-violet-600' },
  };

  const theme = themeMap[colorTheme] || themeMap.amber;

  return (
    <div
      className={`relative w-full h-44 sm:h-52 rounded-2xl bg-gradient-to-b ${theme.bg} ring-1 ${theme.ring} flex flex-col items-center justify-center p-4 overflow-hidden select-none ${className}`}
    >
      {/* Decorative background grid and circles */}
      <div className="absolute inset-0 opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`grid-${word}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" className={theme.text} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${word})`} />
        </svg>
      </div>

      {/* Floating gentle sunshine / bubbles */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/40 blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/40 blur-xl pointer-events-none" />

      {/* Center illustration art & emblem */}
      <div className="relative z-10 flex flex-col items-center transition-transform hover:scale-105 duration-300">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-5xl sm:text-6xl border border-white/80">
          <span role="img" aria-label={word}>
            {emoji || '📖'}
          </span>
        </div>
        <div className="mt-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Elementary English Flashcard
        </div>
      </div>
    </div>
  );
};
