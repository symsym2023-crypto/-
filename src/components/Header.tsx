import React from 'react';
import { Sparkles, BookOpen, BookmarkCheck, Award, Settings } from 'lucide-react';

interface HeaderProps {
  activeTab: 'quiz' | 'wrongNotes' | 'progress' | 'settings';
  setActiveTab: (tab: 'quiz' | 'wrongNotes' | 'progress' | 'settings') => void;
  wrongCount: number;
  onGenerateAiWord: () => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  wrongCount,
  onGenerateAiWord,
  isGenerating,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/70 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl" role="img" aria-label="book">📘</span>
          <a
            href="#quiz"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('quiz');
            }}
            className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 hover:text-indigo-900 transition-colors"
          >
            중학 영단어 마스터 트레이너
          </a>
        </div>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="flex items-center gap-2 sm:gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'text-amber-900 font-bold border-b-2 border-amber-500'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>단어 퀴즈</span>
          </button>

          <button
            onClick={() => setActiveTab('wrongNotes')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap ${
              activeTab === 'wrongNotes'
                ? 'text-amber-900 font-bold border-b-2 border-amber-500'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>오답 노트</span>
            {wrongCount > 0 && (
              <span className="ml-0.5 text-xs font-mono font-bold text-rose-600 bg-rose-100 rounded-full px-1.5 py-0.2">
                {wrongCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap ${
              activeTab === 'progress'
                ? 'text-amber-900 font-bold border-b-2 border-amber-500'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>성장 기록</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'text-amber-900 font-bold border-b-2 border-amber-500'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>학습 설정</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onGenerateAiWord}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
            title="Gemini AI로 새로운 초등 영단어 카드 생성하기"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">AI 새 단어 카드</span>
            <span className="sm:hidden">AI 생성</span>
          </button>
        </div>
      </div>
    </header>
  );
};
