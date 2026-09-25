export type GradeLevel = '중1 (기초/필수)' | '중2 (표준/내신)' | '중3 (심화/고등대비)';

export type WordCategory =
  | '전체'
  | '사회/문화'
  | '과학/환경'
  | '기술/정보'
  | '학교/진로'
  | '일상/심리'
  | '문학/예술'
  | '역사/지리';

export type QuizType =
  | 'choice_meaning'   // 뜻 고르기 (객관식)
  | 'choice_word'      // 영단어 고르기 (객관식)
  | 'spelling_input'   // 서술형 스펠링 쓰기 (주관식)
  | 'fill_alphabet';   // 철자/어근 빈칸 맞추기

export interface WordCard {
  id: string;
  word: string;             // e.g. "environment"
  meaning: string;          // e.g. "환경, 자연환경"
  phonics: string;          // e.g. "인바이런먼트 [ɪnˈvaɪrənmənt]"
  partOfSpeech: string;     // e.g. "명사"
  gradeLevel: GradeLevel;
  category: WordCategory;
  exampleSentenceEn: string; // Middle school level complex sentence
  exampleSentenceKo: string; // Translation
  teacherTip: string;       // Etymology / prefix root mnemonic / exam point
  synonymOrAntonym?: string; // e.g. "유의어: surroundings | 파생어: environmental (환경의)"
  quizType: QuizType;
  options: string[];        // 4 choices
  targetAnswer: string;     // Correct answer value
  missingIndices?: number[]; // For fill_alphabet mode
  iconName: string;
  emoji: string;
  colorTheme: 'indigo' | 'sky' | 'emerald' | 'amber' | 'rose' | 'violet';
}

export interface WrongNoteItem {
  id: string;
  wordId: string;
  card: WordCard;
  wrongCount: number;
  lastAttemptAt: string;
  userLastWrongAnswer: string;
  isMastered: boolean;
  masteredAt?: string;
  notes?: string;
}

export interface LearningProgress {
  totalSolved: number;
  correctCount: number;
  wrongCount: number;
  streakDays: number;
  lastActiveDate: string;
  xp: number;
  earnedBadges: string[];
}
