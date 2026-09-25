import React from 'react';
import { GradeLevel, WordCategory, QuizType } from '../types/word';
import { Sliders, Volume2, Sparkles, Check, School, BookOpen } from 'lucide-react';

interface SettingsViewProps {
  gradeLevel: GradeLevel;
  setGradeLevel: (grade: GradeLevel) => void;
  category: WordCategory;
  setCategory: (cat: WordCategory) => void;
  quizTypePreference: 'all' | QuizType;
  setQuizTypePreference: (qt: 'all' | QuizType) => void;
  speechSpeed: number;
  setSpeechSpeed: (speed: number) => void;
  autoAdvance: boolean;
  setAutoAdvance: (auto: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  gradeLevel,
  setGradeLevel,
  category,
  setCategory,
  quizTypePreference,
  setQuizTypePreference,
  speechSpeed,
  setSpeechSpeed,
  autoAdvance,
  setAutoAdvance,
}) => {
  const categories: WordCategory[] = [
    '전체',
    '사회/문화',
    '과학/환경',
    '기술/정보',
    '학교/진로',
    '일상/심리',
    '문학/예술',
    '역사/지리',
  ];

  const gradeOptions: { level: GradeLevel; desc: string; sub: string }[] = [
    {
      level: '중1 (기초/필수)',
      desc: '교과서 기초 800단어 & 품사 개념',
      sub: '기본 어휘와 시제, 일상 필수 표현 완성',
    },
    {
      level: '중2 (표준/내신)',
      desc: '내신 기출 빈출 1,200단어 & 접두사/접미사',
      sub: '중간·기말고사 빈출 다의어 및 연어(Collocation)',
    },
    {
      level: '중3 (심화/고등대비)',
      desc: '독해·서술형 완성 1,800단어 & 유의어/반의어',
      sub: '고난도 서술형 영작 및 고등 수능 연계 어휘 입문',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-indigo-200/80 p-6 sm:p-7 shadow-xs space-y-7">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
        <Sliders className="w-5 h-5 text-indigo-700" />
        <h2 className="text-xl font-bold text-slate-900">중학 영단어 학습 및 내신 환경 설정</h2>
      </div>

      {/* Grade Level Selection */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <School className="w-4 h-4 text-indigo-600" />
          <span>중학교 학년 및 내신 목표 선택</span>
        </label>
        <p className="text-xs text-slate-500">
          선택한 학년 단계에 맞춰 Gemini AI가 내신 빈출 어휘와 교과서 지문 예문을 조절합니다.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {gradeOptions.map((item) => (
            <button
              key={item.level}
              onClick={() => setGradeLevel(item.level)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                gradeLevel === item.level
                  ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-200'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
              }`}
            >
              <div className="text-base flex items-center justify-between">
                <span>{item.level}</span>
                {gradeLevel === item.level && <Check className="w-4 h-4 text-indigo-600" />}
              </div>
              <div className="text-xs text-indigo-900 font-semibold mt-1">
                {item.desc}
              </div>
              <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                {item.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Word Category */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>교과서 단원 주제(카테고리) 선택</span>
        </label>
        <p className="text-xs text-slate-500">
          학교 영어 시험 시험범위나 관심 독해 주제를 우선 선택하여 학습할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Type Preference */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-800">
          퀴즈 출제 방식
        </label>
        <p className="text-xs text-slate-500">
          내신 시험의 서술형 평가를 집중 훈련하려면 &lsquo;서술형 스펠링 쓰기&rsquo;를 선택하세요.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {[
            { id: 'all', label: '골고루 섞어서 (종합 내신 대비)' },
            { id: 'choice_meaning', label: '뜻 고르기 (독해 스피드)' },
            { id: 'choice_word', label: '영단어 찾기 (어휘 식별)' },
            { id: 'spelling_input', label: '서술형 스펠링 쓰기 (주관식)' },
            { id: 'fill_alphabet', label: '철자/어근 빈칸 완성' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setQuizTypePreference(type.id as 'all' | QuizType)}
              className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                quizTypePreference === type.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold ring-1 ring-indigo-300'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pronunciation Speed */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-indigo-600" />
          <span>듣기평가 대비 발음 속도</span>
        </label>
        <p className="text-xs text-slate-500">
          시·도 교육청 영어듣기능력평가 실전 대비를 위해 속도를 선택할 수 있습니다.
        </p>
        <div className="flex items-center gap-3 pt-1">
          {[
            { speed: 0.75, label: '0.75x (정확한 발음 청취)' },
            { speed: 0.9, label: '0.9x (듣기평가 표준)' },
            { speed: 1.05, label: '1.05x (원어민 실전 속도)' },
          ].map((item) => (
            <button
              key={item.speed}
              onClick={() => setSpeechSpeed(item.speed)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                speechSpeed === item.speed
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto Advance Toggle */}
      <div className="flex items-center justify-between p-4 bg-indigo-50/40 rounded-2xl border border-indigo-200/60">
        <div>
          <div className="text-sm font-bold text-slate-800">
            정답 시 다음 단어로 자동 이동
          </div>
          <div className="text-xs text-slate-500">
            정답을 맞추면 1.5초 후 자동으로 다음 단어 카드가 제시됩니다.
          </div>
        </div>
        <button
          onClick={() => setAutoAdvance(!autoAdvance)}
          className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
            autoAdvance ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
        </button>
      </div>

      {/* Teacher Note */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>중학교 영어 교사의 내신 어휘 학습 가이드</span>
        </div>
        <p>
          중학교 영어는 단순 암기를 넘어 <strong>접두사(prefix)·어근(root)·접미사(suffix)</strong>를 통한
          어휘 유추 능력과 <strong>품사 변화 및 예문 속 쓰임새</strong>가 내신 1등급을 결정합니다.
          틀린 단어는 오답 노트에 자동 영구 보관되니, 서술형 스펠링과 유의어를 함께 정리하며 반복해 보세요!
        </p>
      </div>
    </div>
  );
};
