import React, { useState, useEffect, useCallback } from 'react';
import { WordCard, WrongNoteItem, LearningProgress, GradeLevel, WordCategory, QuizType } from './types/word';
import { CURATED_WORDS } from './data/curatedWords';
import { Header } from './components/Header';
import { TeacherBanner } from './components/TeacherBanner';
import { WordCardQuiz } from './components/WordCardQuiz';
import { WrongNoteView } from './components/WrongNoteView';
import { ProgressView } from './components/ProgressView';
import { SettingsView } from './components/SettingsView';
import { Sparkles, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const STORAGE_KEY_WRONG_NOTES = 'elementary_english_wrong_notes_v2';
const STORAGE_KEY_PROGRESS = 'elementary_english_progress_v2';
const STORAGE_KEY_SETTINGS = 'elementary_english_settings_v2';

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'quiz' | 'wrongNotes' | 'progress' | 'settings'>('quiz');

  // Educational Settings
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('중1 (기초/필수)');
  const [category, setCategory] = useState<WordCategory>('전체');
  const [quizTypePreference, setQuizTypePreference] = useState<'all' | QuizType>('all');
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.9);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);

  // Card Stream & State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardStream, setCardStream] = useState<WordCard[]>([]);
  const [isGeneratingAiWord, setIsGeneratingAiWord] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Review Mode (Special mode for testing only wrong notes)
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [reviewCards, setReviewCards] = useState<WordCard[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);

  // Persistent Wrong Notes
  const [wrongNotes, setWrongNotes] = useState<WrongNoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WRONG_NOTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load wrong notes from localStorage:', e);
    }
    return [];
  });

  // Persistent Learning Progress
  const [progress, setProgress] = useState<LearningProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load progress from localStorage:', e);
    }
    return {
      totalSolved: 0,
      correctCount: 0,
      wrongCount: 0,
      streakDays: 0,
      lastActiveDate: new Date().toISOString(),
      xp: 0,
      earnedBadges: [],
    };
  });

  // Middle School Teacher Feedback Message
  const [teacherMessage, setTeacherMessage] = useState<string>(
    '반갑습니다! 중학 영어 내신과 독해의 핵심은 어휘 정복에 있습니다. 매일 꾸준히 학습하고, 틀린 단어는 오답 노트에서 어원과 함께 확실히 정복해 봐요!'
  );

  // Save wrong notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WRONG_NOTES, JSON.stringify(wrongNotes));
    } catch (e) {
      console.error('Failed to persist wrong notes:', e);
    }
  }, [wrongNotes]);

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to persist progress:', e);
    }
  }, [progress]);

  // Load Settings from localStorage on init
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.gradeLevel) setGradeLevel(parsed.gradeLevel);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.quizTypePreference) setQuizTypePreference(parsed.quizTypePreference);
        if (parsed.speechSpeed) setSpeechSpeed(parsed.speechSpeed);
        if (typeof parsed.autoAdvance === 'boolean') setAutoAdvance(parsed.autoAdvance);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }, []);

  // Save Settings
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_SETTINGS,
        JSON.stringify({
          gradeLevel,
          category,
          quizTypePreference,
          speechSpeed,
          autoAdvance,
        })
      );
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [gradeLevel, category, quizTypePreference, speechSpeed, autoAdvance]);

  // Filter curated cards based on settings
  const getFilteredCurated = useCallback(() => {
    return CURATED_WORDS.filter((card) => {
      const matchGrade = card.gradeLevel === gradeLevel;
      const matchCat = category === '전체' || card.category === category;
      return matchGrade && matchCat;
    });
  }, [gradeLevel, category]);

  // Initialize or re-filter card stream
  useEffect(() => {
    const filtered = getFilteredCurated();
    const list = filtered.length > 0 ? filtered : CURATED_WORDS;
    // Apply quiz type preference if not 'all'
    const adjusted = list.map((c) => {
      if (quizTypePreference !== 'all') {
        return { ...c, quizType: quizTypePreference };
      }
      return c;
    });
    // Shuffle slightly
    const shuffled = [...adjusted].sort(() => Math.random() - 0.5);
    setCardStream(shuffled);
    setCurrentCardIndex(0);
  }, [getFilteredCurated, quizTypePreference]);

  // Gemini AI Word Generator Call
  const handleGenerateAiWord = async () => {
    setIsGeneratingAiWord(true);
    setGenerationError(null);

    try {
      const excludeWords = cardStream.map((c) => c.word);
      const chosenQuizType =
        quizTypePreference === 'all'
          ? (['choice_meaning', 'choice_word', 'spelling_input', 'fill_alphabet'] as QuizType[])[
              Math.floor(Math.random() * 4)
            ]
          : quizTypePreference;

      const res = await fetch('/api/gemini/generate-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel,
          category,
          quizType: chosenQuizType,
          excludeWords,
        }),
      });

      const data = await res.json();
      if (!data.success || !data.card) {
        throw new Error(data.error || '단어를 생성하지 못했습니다.');
      }

      const newCard: WordCard = data.card;
      // Prepend to card stream and focus on it!
      setCardStream((prev) => [newCard, ...prev]);
      setCurrentCardIndex(0);
      setActiveTab('quiz');
      setIsReviewMode(false);
      setTeacherMessage(
        `Gemini AI가 '${newCard.word}'(${newCard.meaning}) 단어 카드를 방금 새로 만들었어요! 멋지게 풀어볼까요?`
      );
    } catch (err) {
      console.error('AI generation error:', err);
      setGenerationError(
        err instanceof Error ? err.message : 'AI 단어 카드 생성에 실패했습니다. 기본 단어로 계속 학습해요!'
      );
      // Auto clear error message
      setTimeout(() => setGenerationError(null), 5000);
    } finally {
      setIsGeneratingAiWord(false);
    }
  };

  // Current Card to Display
  const currentCard: WordCard | undefined = isReviewMode
    ? reviewCards[reviewIndex]
    : cardStream[currentCardIndex];

  // Advance to next card
  const handleNextCard = () => {
    if (isReviewMode) {
      if (reviewIndex + 1 < reviewCards.length) {
        setReviewIndex((prev) => prev + 1);
      } else {
        // Finished review session
        setIsReviewMode(false);
        setActiveTab('wrongNotes');
        setTeacherMessage('오답 노트 복습 퀴즈를 모두 마쳤어요! 실력이 쑥쑥 자라났어요! 🌟');
      }
    } else {
      if (currentCardIndex + 1 < cardStream.length) {
        setCurrentCardIndex((prev) => prev + 1);
      } else {
        // If reached end of list, fetch new AI card or recycle
        handleGenerateAiWord();
      }
    }
  };

  // Handle Student Answer Result
  const handleAnswerResult = async (isCorrect: boolean, userAnswer: string) => {
    if (!currentCard) return;

    // Update Progress Stats
    setProgress((prev) => ({
      ...prev,
      totalSolved: prev.totalSolved + 1,
      correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      wrongCount: isCorrect ? prev.wrongCount : prev.wrongCount + 1,
      streakDays: isCorrect ? prev.streakDays + 1 : 0,
      xp: prev.xp + (isCorrect ? (isReviewMode ? 15 : 10) : 2),
      lastActiveDate: new Date().toISOString(),
    }));

    if (isCorrect) {
      // If in review mode, mark the wrong note as mastered
      if (isReviewMode) {
        setWrongNotes((prev) =>
          prev.map((item) =>
            item.card.word.toLowerCase() === currentCard.word.toLowerCase()
              ? { ...item, isMastered: true, masteredAt: new Date().toISOString() }
              : item
          )
        );
        setTeacherMessage(
          `대단해요! 오답 노트에 있던 '${currentCard.word}' 단어를 완벽히 정복했어요! 🏆`
        );
      } else {
        const cheerfulPraises = [
          `정답이에요! '${currentCard.word}'의 뜻과 소리를 아주 잘 기억하고 있네요! 👏`,
          `참 잘했어요! 김선생님이 아낌없이 박수를 보냅니다! 🌟`,
          `완벽해요! '${currentCard.word}' 스펠링과 발음이 귀에 쏙 들어오죠? ✨`,
          `우와, 실력이 대단해요! 다음 단어도 힘차게 달려볼까요? 🚀`,
        ];
        setTeacherMessage(cheerfulPraises[Math.floor(Math.random() * cheerfulPraises.length)]);
      }
    } else {
      // INCORRECT: Auto-save to Persistent Wrong Notes
      setWrongNotes((prev) => {
        const existingIdx = prev.findIndex(
          (item) => item.card.word.toLowerCase() === currentCard.word.toLowerCase()
        );

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            wrongCount: updated[existingIdx].wrongCount + 1,
            lastAttemptAt: new Date().toISOString(),
            userLastWrongAnswer: userAnswer,
            isMastered: false, // reset mastered status if failed again
          };
          return updated;
        } else {
          const newItem: WrongNoteItem = {
            id: `wrong-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            wordId: currentCard.id,
            card: currentCard,
            wrongCount: 1,
            lastAttemptAt: new Date().toISOString(),
            userLastWrongAnswer: userAnswer,
            isMastered: false,
          };
          return [newItem, ...prev];
        }
      });

      setTeacherMessage(
        `틀려도 전혀 괜찮아요! 오답 노트에 쏙 보관해 두었으니 언제든 다시 복습할 수 있어요. 힘내요! 💪`
      );
    }
  };

  // Start Review Quiz Mode
  const handleStartReviewQuiz = (cards: WordCard[]) => {
    if (cards.length === 0) return;
    setReviewCards(cards);
    setReviewIndex(0);
    setIsReviewMode(true);
    setActiveTab('quiz');
    setTeacherMessage(
      `오답 노트 집중 복습을 시작합니다! 총 ${cards.length}개의 단어를 하나씩 정복해봐요!`
    );
  };

  // Toggle Mastered in Wrong Notes
  const handleToggleMastered = (id: string) => {
    setWrongNotes((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isMastered: !item.isMastered,
              masteredAt: !item.isMastered ? new Date().toISOString() : undefined,
            }
          : item
      )
    );
  };

  // Delete single wrong note
  const handleDeleteWrongNote = (id: string) => {
    setWrongNotes((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all wrong notes
  const handleClearAllWrongNotes = () => {
    if (window.confirm('오답 노트의 모든 단어를 비우시겠습니까?')) {
      setWrongNotes([]);
    }
  };

  // Reset all progress
  const handleResetProgress = () => {
    if (window.confirm('학습 기록과 획득한 경험치(XP)를 초기화하시겠습니까?')) {
      setProgress({
        totalSolved: 0,
        correctCount: 0,
        wrongCount: 0,
        streakDays: 0,
        lastActiveDate: new Date().toISOString(),
        xp: 0,
        earnedBadges: [],
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-slate-800">
      {/* 3-Zone Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'quiz') setIsReviewMode(false);
        }}
        wrongCount={wrongNotes.filter((n) => !n.isMastered).length}
        onGenerateAiWord={handleGenerateAiWord}
        isGenerating={isGeneratingAiWord}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Elementary Teacher Cheer & Status Banner */}
        <TeacherBanner
          teacherMessage={teacherMessage}
          currentWord={currentCard?.word}
          speechSpeed={speechSpeed}
          streak={progress.streakDays}
          xp={progress.xp}
          gradeLevel={gradeLevel}
        />

        {/* AI Generation Error Notice if any */}
        {generationError && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{generationError}</span>
          </div>
        )}

        {/* Review Mode Bar */}
        {isReviewMode && activeTab === 'quiz' && (
          <div className="mb-4 p-3 bg-amber-100/80 border border-amber-300 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
              <span>오답 노트 집중 복습 진행 중 ({reviewIndex + 1} / {reviewCards.length})</span>
            </div>
            <button
              onClick={() => {
                setIsReviewMode(false);
                setActiveTab('wrongNotes');
              }}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>복습 종료하고 목록으로</span>
            </button>
          </div>
        )}

        {/* TAB 1: 단어 퀴즈 (Flashcard & Interactive Quiz) */}
        {activeTab === 'quiz' && currentCard && (
          <div className="space-y-4">
            <WordCardQuiz
              key={currentCard.id}
              card={currentCard}
              cardNumber={isReviewMode ? reviewIndex + 1 : currentCardIndex + 1}
              onAnswerResult={handleAnswerResult}
              onNextCard={handleNextCard}
              speechSpeed={speechSpeed}
              autoAdvance={autoAdvance}
              isReviewMode={isReviewMode}
            />

            {/* Quick Helper Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2 px-2">
              <div className="flex items-center gap-2">
                <span>단어 넘기기: </span>
                <button
                  onClick={handleNextCard}
                  className="font-medium text-amber-700 hover:underline"
                >
                  다음 카드로 바로 건너뛰기
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateAiWord}
                  disabled={isGeneratingAiWord}
                  className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini에게 다른 단어 카드 만들어달라고 하기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 오답 노트 (Persistent Review Notebook) */}
        {activeTab === 'wrongNotes' && (
          <WrongNoteView
            wrongNotes={wrongNotes}
            onStartReviewQuiz={handleStartReviewQuiz}
            onToggleMastered={handleToggleMastered}
            onDeleteWrongNote={handleDeleteWrongNote}
            onClearAll={handleClearAllWrongNotes}
            speechSpeed={speechSpeed}
          />
        )}

        {/* TAB 3: 나의 성장판 (Progress & Badges) */}
        {activeTab === 'progress' && (
          <ProgressView
            progress={progress}
            wrongNotes={wrongNotes}
            onResetProgress={handleResetProgress}
          />
        )}

        {/* TAB 4: 학습 설정 (Settings) */}
        {activeTab === 'settings' && (
          <SettingsView
            gradeLevel={gradeLevel}
            setGradeLevel={setGradeLevel}
            category={category}
            setCategory={setCategory}
            quizTypePreference={quizTypePreference}
            setQuizTypePreference={setQuizTypePreference}
            speechSpeed={speechSpeed}
            setSpeechSpeed={setSpeechSpeed}
            autoAdvance={autoAdvance}
            setAutoAdvance={setAutoAdvance}
          />
        )}
      </main>

      {/* Clean quiet educational footer */}
      <footer className="mt-auto border-t border-indigo-200/50 py-6 text-center text-xs text-slate-400">
        <p>중학교 영어 교과 맞춤형 영단어 학습장 · 내신 서술형 대비 AI 트레이너</p>
        <p className="mt-1 text-[11px] text-slate-400">
          오답 노트는 브라우저 로컬 저장소에 영구 보관되어 언제든 복습할 수 있습니다.
        </p>
      </footer>
    </div>
  );
}
