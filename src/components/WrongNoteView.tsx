import React, { useState } from 'react';
import { WrongNoteItem, WordCard, GradeLevel } from '../types/word';
import { WordIllustration } from './WordIllustration';
import { speakEnglishWord } from '../utils/audio';
import {
  Volume2,
  CheckCircle2,
  Trash2,
  Play,
  RotateCcw,
  Search,
  BookOpen,
  Printer,
  Sparkles,
  Award,
} from 'lucide-react';

interface WrongNoteViewProps {
  wrongNotes: WrongNoteItem[];
  onStartReviewQuiz: (cards: WordCard[]) => void;
  onToggleMastered: (id: string) => void;
  onDeleteWrongNote: (id: string) => void;
  onClearAll: () => void;
  speechSpeed: number;
}

export const WrongNoteView: React.FC<WrongNoteViewProps> = ({
  wrongNotes,
  onStartReviewQuiz,
  onToggleMastered,
  onDeleteWrongNote,
  onClearAll,
  speechSpeed,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'unsolved' | 'mastered'>('unsolved');
  const [gradeFilter, setGradeFilter] = useState<'all' | GradeLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [printMode, setPrintMode] = useState(false);

  // Filter items
  const filteredNotes = wrongNotes.filter((item) => {
    if (filterStatus === 'unsolved' && item.isMastered) return false;
    if (filterStatus === 'mastered' && !item.isMastered) return false;
    if (gradeFilter !== 'all' && item.card.gradeLevel !== gradeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchWord = item.card.word.toLowerCase().includes(q);
      const matchMeaning = item.card.meaning.toLowerCase().includes(q);
      if (!matchWord && !matchMeaning) return false;
    }
    return true;
  });

  const unsolvedCount = wrongNotes.filter((n) => !n.isMastered).length;
  const masteredCount = wrongNotes.filter((n) => n.isMastered).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl border border-amber-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="notebook">📕</span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                나만의 영단어 오답 노트
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              틀렸던 단어들이 브라우저에 영구 보관됩니다. 복습하여 완전히 내 것으로 만들어봐요!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onStartReviewQuiz(filteredNotes.map((n) => n.card))}
              disabled={filteredNotes.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>오답 집중 퀴즈 시작 ({filteredNotes.length})</span>
            </button>

            <button
              onClick={() => setPrintMode(!printMode)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              title="프린트용 단어장 양식"
            >
              <Printer className="w-4 h-4" />
              <span>{printMode ? '기본 보기' : '인쇄용 보기'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
            <button
              onClick={() => setFilterStatus('unsolved')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === 'unsolved'
                  ? 'bg-white text-amber-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              복습 필요 ({unsolvedCount})
            </button>
            <button
              onClick={() => setFilterStatus('mastered')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === 'mastered'
                  ? 'bg-white text-emerald-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              마스터 완료 ({masteredCount})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 ({wrongNotes.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="단어 또는 뜻 검색..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Print Sheet View (when toggled) */}
      {printMode ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-sm print:m-0 print:border-none">
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800 mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900">중학 영어 내신 대비 오답 복습지</h1>
              <p className="text-xs text-slate-500">서술형 스펠링과 어원, 파생어를 확인하며 복습해 보세요.</p>
            </div>
            <div className="text-right text-xs text-slate-500 font-mono">
              이름: _________________ | 학년: 중___ | 날짜: ____년 __월 __일
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((item, index) => (
              <div key={item.id} className="p-3.5 border border-slate-300 rounded-lg flex items-start gap-3">
                <span className="font-mono font-bold text-xs text-slate-500 w-5">
                  {index + 1}.
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold font-mono text-slate-900">
                      {item.card.word}
                    </span>
                    <span className="text-xs text-indigo-900 font-bold">
                      [{item.card.partOfSpeech}] {item.card.meaning}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    발음: {item.card.phonics} | {item.card.gradeLevel}
                  </div>
                  <div className="text-[11px] text-indigo-900 font-medium">
                    어원/내신팁: {item.card.teacherTip}
                  </div>
                  {item.card.synonymOrAntonym && (
                    <div className="text-[11px] text-emerald-800 font-medium">
                      연계: {item.card.synonymOrAntonym}
                    </div>
                  )}
                  <div className="pt-2 border-t border-dashed border-slate-200 text-xs text-slate-400">
                    서술형 3회 쓰기: ____________ / ____________ / ____________
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              학습지 인쇄하기 (Print)
            </button>
          </div>
        </div>
      ) : (
        /* Standard List of Wrong Notes Cards */
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-amber-200/60 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-3xl mb-3">
                🎉
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {filterStatus === 'unsolved'
                  ? '모든 오답을 복습 완료했거나 아직 틀린 단어가 없어요!'
                  : '해당 조건의 단어가 없습니다.'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                퀴즈를 풀다가 틀린 단어는 여기에 자동으로 모여 복습할 수 있어요.
              </p>
            </div>
          ) : (
            filteredNotes.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all ${
                  item.isMastered
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-amber-200/80 hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Word Info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                      {item.card.emoji}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold font-mono text-slate-900 tracking-tight">
                          {item.card.word}
                        </span>
                        <button
                          onClick={() => speakEnglishWord(item.card.word, speechSpeed)}
                          className="p-1 rounded-md text-amber-700 hover:bg-amber-100 transition-colors"
                          title="발음 듣기"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        <span className="text-xs text-slate-500 font-mono">
                          [{item.card.phonics}]
                        </span>

                        {item.isMastered && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            마스터 완료
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-semibold text-amber-800">{item.card.meaning}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.card.gradeLevel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.card.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-600 font-medium">오답 {item.wrongCount}회</span>
                      </div>

                      {/* Teacher memory tip */}
                      <p className="text-xs text-indigo-900 bg-indigo-50/80 border border-indigo-100 rounded-lg px-2.5 py-1 mt-1 inline-block">
                        📌 <span className="font-bold">어원/내신팁:</span> {item.card.teacherTip}
                      </p>

                      {item.card.synonymOrAntonym && (
                        <p className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-100 rounded-lg px-2.5 py-1 mt-1 block">
                          🔗 <span className="font-bold">연어/파생어:</span> {item.card.synonymOrAntonym}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onToggleMastered(item.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                        item.isMastered
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.isMastered ? '복습 미완료로 변경' : '마스터 완료'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteWrongNote(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="오답 노트에서 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {wrongNotes.length > 0 && (
            <div className="pt-4 flex justify-between items-center text-xs text-slate-500">
              <span>총 {wrongNotes.length}개의 단어가 오답 노트에 저장되어 있습니다.</span>
              <button
                onClick={onClearAll}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                오답 노트 전체 비우기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
