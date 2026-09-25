import React from 'react';
import { Volume2, Sparkles, Flame, Star } from 'lucide-react';
import { speakEnglishWord } from '../utils/audio';

interface TeacherBannerProps {
  teacherMessage: string;
  currentWord?: string;
  speechSpeed: number;
  streak: number;
  xp: number;
  gradeLevel: string;
}

export const TeacherBanner: React.FC<TeacherBannerProps> = ({
  teacherMessage,
  currentWord,
  speechSpeed,
  streak,
  xp,
  gradeLevel,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 p-4 sm:p-5 shadow-xs mb-6 relative overflow-hidden">
      {/* Decorative subtle ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Teacher Avatar & Message */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-100 border-2 border-indigo-300 flex items-center justify-center text-2xl shadow-xs">
              👨‍🏫
            </div>
            <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
              영어샘
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
              <span>중학 영어 지도교사의 핵심 피드백</span>
              <span aria-hidden="true" className="text-indigo-300">·</span>
              <span className="text-slate-500 font-normal">{gradeLevel} 내신 대비</span>
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-snug">
              &ldquo;{teacherMessage}&rdquo;
            </p>
          </div>
        </div>

        {/* Quick Student Stats */}
        <div className="flex items-center gap-3 self-end sm:self-center bg-amber-50/70 border border-amber-100 rounded-xl px-3 py-2">
          {currentWord && (
            <button
              onClick={() => speakEnglishWord(currentWord, speechSpeed)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-200/60 hover:bg-amber-300/70 rounded-lg transition-colors"
              title="원어민 발음 다시 듣기"
            >
              <Volume2 className="w-4 h-4 text-amber-800" />
              <span>발음 듣기</span>
            </button>
          )}

          <div className="flex items-center gap-1 text-xs font-semibold text-amber-900">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="font-mono tabular-nums">{streak}</span>
            <span className="text-slate-500 text-[11px]">연속</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-amber-900">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-mono tabular-nums">{xp}</span>
            <span className="text-slate-500 text-[11px]">XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
