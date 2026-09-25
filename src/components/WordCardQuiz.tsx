import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { WordCard } from '../types/word';
import { WordIllustration } from './WordIllustration';
import { playCorrectSound, playWrongSound, speakEnglishWord } from '../utils/audio';
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Lightbulb,
  Sparkles,
  HelpCircle,
  RotateCcw,
  BookMarked,
} from 'lucide-react';

interface WordCardQuizProps {
  card: WordCard;
  cardNumber: number;
  onAnswerResult: (isCorrect: boolean, userAnswer: string) => void;
  onNextCard: () => void;
  speechSpeed: number;
  autoAdvance: boolean;
  isReviewMode?: boolean;
}

export const WordCardQuiz: React.FC<WordCardQuizProps> = ({
  card,
  cardNumber,
  onAnswerResult,
  onNextCard,
  speechSpeed,
  autoAdvance,
  isReviewMode = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [fillAnswers, setFillAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset card state
  useEffect(() => {
    setSelectedOption(null);
    setTextInput('');
    setSubmitted(false);
    setIsCorrect(null);
    setShowHint(false);

    // If fill_alphabet mode, prepare blanks
    if (card.quizType === 'fill_alphabet' && card.missingIndices) {
      setFillAnswers(new Array(card.missingIndices.length).fill(''));
    }

    // Auto-pronounce word for kids
    const timer = setTimeout(() => {
      speakEnglishWord(card.word, speechSpeed);
    }, 350);

    return () => clearTimeout(timer);
  }, [card.id, card.word, card.quizType, speechSpeed]);

  // Focus input for spelling mode
  useEffect(() => {
    if (card.quizType === 'spelling_input' && !submitted) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [card.id, card.quizType, submitted]);

  // Handle multiple-choice option click
  const handleSelectOption = (option: string) => {
    if (submitted) return;
    setSelectedOption(option);
    checkAnswer(option);
  };

  // Handle direct text submission
  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (submitted || !textInput.trim()) return;
    checkAnswer(textInput.trim());
  };

  // Handle fill-in alphabet submission
  const handleFillSubmit = () => {
    if (submitted) return;
    // Reconstruct student's formed word
    const missingIndices = card.missingIndices || [];
    const letters = card.word.split('');
    missingIndices.forEach((idx, i) => {
      letters[idx] = fillAnswers[i]?.toLowerCase() || '';
    });
    const formedWord = letters.join('');
    checkAnswer(formedWord);
  };

  const checkAnswer = (answer: string) => {
    const cleanUser = answer.toLowerCase().replace(/\s+/g, '');
    const cleanTarget = card.targetAnswer.toLowerCase().replace(/\s+/g, '');

    const correct = cleanUser === cleanTarget;
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      playCorrectSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
      });
      // Optionally auto advance
      if (autoAdvance) {
        setTimeout(() => {
          onNextCard();
        }, 1600);
      }
    } else {
      playWrongSound();
    }

    onAnswerResult(correct, answer);
  };

  // On-screen alphabet virtual keys for spelling
  const alphabetList = 'abcdefghijklmnopqrstuvwxyz'.split('');

  const appendLetter = (letter: string) => {
    if (submitted) return;
    if (card.quizType === 'spelling_input') {
      setTextInput((prev) => prev + letter);
      inputRef.current?.focus();
    }
  };

  const removeLastLetter = () => {
    if (submitted) return;
    if (card.quizType === 'spelling_input') {
      setTextInput((prev) => prev.slice(0, -1));
      inputRef.current?.focus();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md p-5 sm:p-7 transition-all">
      {/* Top Metadata Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-900 font-mono tabular-nums">
            {isReviewMode ? '오답 복습 카드' : `단어 카드 #${cardNumber}`}
          </span>
          <span aria-hidden="true">·</span>
          <span>{card.gradeLevel}</span>
          <span aria-hidden="true">·</span>
          <span>{card.category}</span>
          <span aria-hidden="true">·</span>
          <span>{card.partOfSpeech}</span>
        </div>

        <div className="flex items-center gap-2">
          {card.quizType === 'choice_meaning' && <span>뜻 고르기 퀴즈</span>}
          {card.quizType === 'choice_word' && <span>영단어 찾기 퀴즈</span>}
          {card.quizType === 'spelling_input' && <span>스펠링 직접 쓰기</span>}
          {card.quizType === 'fill_alphabet' && <span>빈칸 알파벳 맞추기</span>}
        </div>
      </div>

      {/* Main Grid: Card Illustration & Details */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Visual Artwork & Audio */}
        <div className="md:col-span-5 flex flex-col items-center">
          <WordIllustration
            iconName={card.iconName}
            emoji={card.emoji}
            colorTheme={card.colorTheme}
            word={card.word}
          />

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => speakEnglishWord(card.word, speechSpeed)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 rounded-full transition-all active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span>원어민 발음 듣기</span>
            </button>

            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-full transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>{showHint ? '힌트 닫기' : '힌트 보기'}</span>
            </button>
          </div>

          {/* Phonics Guide */}
          <div className="mt-2 text-center">
            <p className="text-xs text-slate-500 font-mono">
              발음: <span className="text-slate-700 font-semibold">{card.phonics}</span>
            </p>
          </div>
        </div>

        {/* Right Column: Quiz Question & Interactive Inputs */}
        <div className="md:col-span-7 flex flex-col justify-center">
          {/* Question Prompt */}
          <div className="mb-4">
            <span className="text-xs font-bold text-amber-600 tracking-wide uppercase">Question</span>
            {card.quizType === 'choice_meaning' && (
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                <span className="font-mono text-amber-700">{card.word}</span> 의 알맞은 뜻은?
              </h2>
            )}
            {card.quizType === 'choice_word' && (
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                &ldquo;<span className="text-amber-700">{card.meaning}</span>&rdquo;을(를) 영어로 쓰면?
              </h2>
            )}
            {card.quizType === 'spelling_input' && (
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                &ldquo;<span className="text-amber-700">{card.meaning}</span>&rdquo;의 스펠링을 적어보세요!
              </h2>
            )}
            {card.quizType === 'fill_alphabet' && (
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                빈칸에 들어갈 알맞은 알파벳은?
              </h2>
            )}
          </div>

          {/* Hint callout */}
          {showHint && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">선생님의 힌트: </span>
                {card.teacherTip}
              </div>
            </div>
          )}

          {/* Interactive Quiz Mode 1 & 2: Multiple Choice Options */}
          {(card.quizType === 'choice_meaning' || card.quizType === 'choice_word') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {card.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isThisTarget = option === card.targetAnswer;

                let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-amber-50/60 hover:border-amber-300';
                if (submitted) {
                  if (isThisTarget) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-300';
                  } else if (isSelected && !isThisTarget) {
                    btnStyle = 'bg-rose-50 border-rose-400 text-rose-800 font-medium line-through';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    disabled={submitted}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left text-sm sm:text-base transition-all active:scale-98 ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-xs font-mono font-bold text-slate-600 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium">{option}</span>
                    </div>

                    {submitted && isThisTarget && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {submitted && isSelected && !isThisTarget && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Interactive Quiz Mode 3: Spelling Input (Direct Writing) */}
          {card.quizType === 'spelling_input' && (
            <div className="space-y-4">
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={submitted}
                  placeholder="중학 내신 서술형 스펠링 입력 (예: environment)"
                  className="flex-1 px-4 py-3 text-lg font-mono tracking-wider border-2 border-amber-300 focus:border-amber-500 focus:outline-hidden rounded-2xl bg-amber-50/20 text-slate-800 placeholder:text-slate-400 font-semibold"
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="submit"
                  disabled={submitted || !textInput.trim()}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all active:scale-95 whitespace-nowrap shadow-xs"
                >
                  제출하기
                </button>
              </form>

              {/* On-screen alphabet keyboard for young students */}
              {!submitted && (
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-amber-800">터치 알파벳 자판</span>
                    <button
                      type="button"
                      onClick={removeLastLetter}
                      className="text-[11px] font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>한 글자 지우기</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {alphabetList.map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => appendLetter(ch)}
                        className="w-7 h-8 sm:w-8 sm:h-9 bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-100 rounded-lg text-sm font-mono font-bold text-slate-800 shadow-2xs active:scale-90 transition-all flex items-center justify-center"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Quiz Mode 4: Fill Missing Alphabet */}
          {card.quizType === 'fill_alphabet' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 py-4 bg-amber-50/50 rounded-2xl border border-amber-200/60">
                {card.word.split('').map((char, index) => {
                  const isBlank = card.missingIndices?.includes(index);
                  const blankIdx = isBlank ? card.missingIndices?.indexOf(index) : -1;
                  const currentFill = blankIdx !== undefined && blankIdx !== -1 ? fillAnswers[blankIdx] : '';

                  if (isBlank) {
                    return (
                      <div
                        key={index}
                        className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center text-xl sm:text-2xl font-mono font-bold shadow-2xs ${
                          submitted
                            ? isCorrect
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                              : 'border-rose-400 bg-rose-50 text-rose-800'
                            : 'border-amber-400 bg-white text-amber-900 animate-pulse'
                        }`}
                      >
                        {submitted ? char : currentFill || '?'}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className="w-10 h-12 sm:w-12 sm:h-14 rounded-xl border border-slate-200 bg-slate-100/80 flex items-center justify-center text-xl sm:text-2xl font-mono font-bold text-slate-700"
                    >
                      {char}
                    </div>
                  );
                })}
              </div>

              {!submitted && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2 text-center">
                    아래 보기 중에서 빈칸에 들어갈 알파벳을 골라보세요!
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {card.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setFillAnswers([opt]);
                          const letters = card.word.split('');
                          (card.missingIndices || []).forEach((idx) => {
                            letters[idx] = opt.toLowerCase();
                          });
                          checkAnswer(letters.join(''));
                        }}
                        className="py-3 bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-100/60 rounded-xl text-lg font-mono font-bold text-slate-800 shadow-2xs active:scale-95 transition-all text-center"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback & Result Card */}
          {submitted && (
            <div
              className={`mt-5 p-4 sm:p-5 rounded-2xl border transition-all ${
                isCorrect
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-rose-50/80 border-rose-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 shrink-0">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <h3
                      className={`text-base sm:text-lg font-bold ${
                        isCorrect ? 'text-emerald-900' : 'text-rose-900'
                      }`}
                    >
                      {isCorrect ? '🎯 정답입니다! 핵심 어휘 정복 완료!' : '📝 오답 노트에 저장되었습니다.'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
                      정답: <span className="font-bold text-slate-900 font-mono">{card.word}</span>{' '}
                      ({card.meaning})
                    </p>

                    {!isCorrect && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-700 font-medium">
                        <BookMarked className="w-3.5 h-3.5" />
                        <span>오답 노트에서 파생어와 어원을 집중 복습할 수 있어요!</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={onNextCard}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
                >
                  <span>다음 단어</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Teacher Tip & Example Sentence & Synonyms */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-indigo-900 shrink-0">📌 어원 및 내신 분석:</span>
                  <span>{card.teacherTip}</span>
                </div>
                {card.synonymOrAntonym && (
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-emerald-800 shrink-0">🔗 연어/파생어/유의어:</span>
                    <span className="font-medium text-emerald-950">{card.synonymOrAntonym}</span>
                  </div>
                )}
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-slate-600 shrink-0">📖 교과서 독해 예문:</span>
                  <div>
                    <span className="font-medium text-slate-900">&ldquo;{card.exampleSentenceEn}&rdquo;</span>
                    <span className="text-slate-500 ml-1.5 font-normal">({card.exampleSentenceKo})</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
