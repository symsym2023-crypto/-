import React from 'react';
import { LearningProgress, WrongNoteItem } from '../types/word';
import { Award, Flame, CheckCircle2, BookOpen, Star, RefreshCw } from 'lucide-react';

interface ProgressViewProps {
  progress: LearningProgress;
  wrongNotes: WrongNoteItem[];
  onResetProgress: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  wrongNotes,
  onResetProgress,
}) => {
  const accuracy =
    progress.totalSolved > 0
      ? Math.round((progress.correctCount / progress.totalSolved) * 100)
      : 0;

  const currentLevel = Math.floor(progress.xp / 100) + 1;
  const currentLevelXp = progress.xp % 100;

  const masteredCount = wrongNotes.filter((n) => n.isMastered).length;

  const allBadges = [
    {
      id: 'first_word',
      title: '중학 어휘 입문',
      desc: '첫 번째 중학 단어 퀴즈 완주',
      unlocked: progress.totalSolved >= 1,
      icon: '📘',
    },
    {
      id: 'streak_3',
      title: '내신 집중력 발휘',
      desc: '3단어 연속 정답 달성',
      unlocked: progress.streakDays >= 3,
      icon: '🔥',
    },
    {
      id: 'solved_10',
      title: '어휘력 레벨업',
      desc: '누적 10단어 학습 완료',
      unlocked: progress.totalSolved >= 10,
      icon: '⭐',
    },
    {
      id: 'solved_30',
      title: '내신 1등급 도전자',
      desc: '누적 30단어 학습 완료',
      unlocked: progress.totalSolved >= 30,
      icon: '🎓',
    },
    {
      id: 'master_wrong',
      title: '오답 완벽 소멸',
      desc: '오답 노트 단어 3개 이상 마스터',
      unlocked: masteredCount >= 3,
      icon: '🏆',
    },
    {
      id: 'accuracy_high',
      title: '독해 서술형 명사수',
      desc: '10문제 이상 풀고 정답률 80% 이상',
      unlocked: progress.totalSolved >= 10 && accuracy >= 80,
      icon: '🎯',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Level & XP Card */}
      <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-xs">
              🎖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                  Level {currentLevel}
                </span>
                <span className="text-xs text-slate-500 font-mono">({progress.xp} XP)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                초등 영단어 마스터
              </h2>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-xs text-slate-500">다음 레벨까지</span>
            <div className="text-base font-bold font-mono text-amber-900">
              {100 - currentLevelXp} XP 남음
            </div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-mono">
            <span>Lv.{currentLevel}</span>
            <span>{currentLevelXp} / 100 XP</span>
            <span>Lv.{currentLevel + 1}</span>
          </div>
          <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${currentLevelXp}%` }}
            />
          </div>
        </div>

        {/* 4 Stat Counters */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/60 rounded-2xl text-center">
            <BookOpen className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-xs text-slate-600">총 푼 단어</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {progress.totalSolved}
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/60 rounded-2xl text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-xs text-slate-600">정답 수</div>
            <div className="text-xl font-bold font-mono text-emerald-800 mt-0.5">
              {progress.correctCount}
            </div>
          </div>

          <div className="p-3.5 bg-orange-50/60 border border-orange-200/60 rounded-2xl text-center">
            <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
            <div className="text-xs text-slate-600">연속 정답</div>
            <div className="text-xl font-bold font-mono text-orange-700 mt-0.5">
              {progress.streakDays}
            </div>
          </div>

          <div className="p-3.5 bg-sky-50/60 border border-sky-200/60 rounded-2xl text-center">
            <Star className="w-5 h-5 text-sky-600 mx-auto mb-1" />
            <div className="text-xs text-slate-600">정답률</div>
            <div className="text-xl font-bold font-mono text-sky-800 mt-0.5">
              {accuracy}%
            </div>
          </div>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold text-slate-900">학습 성취 뱃지 컬렉션</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allBadges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border text-center transition-all ${
                badge.unlocked
                  ? 'bg-amber-50/40 border-amber-200 text-slate-900 shadow-2xs'
                  : 'bg-slate-50/60 border-slate-200/80 text-slate-400 opacity-60'
              }`}
            >
              <div className="text-3xl mb-1.5">{badge.icon}</div>
              <h4 className="text-sm font-bold">{badge.title}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{badge.desc}</p>
              <div className="mt-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    badge.unlocked
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {badge.unlocked ? '획득 완료 ✨' : '도전 중'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Reset button */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onResetProgress}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>학습 기록 초기화</span>
          </button>
        </div>
      </div>
    </div>
  );
};
