import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI with aistudio-build User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Generates a middle school English word card dynamically using Gemini 3.8 Flash.
 */
app.post('/api/gemini/generate-word', async (req, res) => {
  try {
    const { gradeLevel = '중1 (기초/필수)', category = '전체', quizType = 'choice_meaning', excludeWords = [] } = req.body;

    const prompt = `대한민국 중학교 영어 교사로서 중학생용 영어 단어 학습 카드 1개를 새로 만들어주세요.

요청 조건:
- 대상 학년: ${gradeLevel} (중1 기초/필수 800단어, 중2 표준/내신 1,200단어, 중3 심화/고등대비 1,800단어 중 해당 학년 수준에 최적화)
- 카테고리: ${category === '전체' ? '사회/문화, 과학/환경, 기술/정보, 학교/진로, 일상/심리, 문학/예술, 역사/지리 중 하나' : category}
- 퀴즈 유형: ${quizType} (choice_meaning: 뜻 고르기, choice_word: 영단어 고르기, spelling_input: 서술형 스펠링 쓰기, fill_alphabet: 철자/어근 빈칸 맞추기)
- 제외할 이미 출제된 단어 목록: [${excludeWords.slice(-30).join(', ')}]

중학생들의 내신 서술형 대비와 어휘력 확장을 위해:
1. 접두사/어근/접미사(Etymology) 분석이 담긴 명쾌한 암기 비법(teacherTip)
2. 중학교 교과서/독해 지문 스타일의 자연스러운 예문(exampleSentenceEn, exampleSentenceKo)
3. 파생어, 유의어, 반의어, 또는 주요 연어(Collocation) 정보(synonymOrAntonym)
4. 정확한 한글 발음 기호 안내(phonics)를 반드시 포함해 주세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `당신은 대한민국 중학교 영어과 교사이자 EBS/내신 어휘 전문 강사입니다.
중학생들의 어휘력 확장, 파생어 및 어원 분석, 내신 서술형 시험 대비를 돕는 전문적이고 명쾌하며 격려하는 지도 톤을 유지합니다.
반드시 유효한 JSON 형식으로만 응답해야 합니다.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: {
              type: Type.STRING,
              description: '영어 단어 (소문자, 예: environment, opportunity)',
            },
            meaning: {
              type: Type.STRING,
              description: '한국어 뜻 (예: 환경, 자연환경)',
            },
            phonics: {
              type: Type.STRING,
              description: '발음 및 파닉스 기호 (예: 인바이런먼트 [ɪnˈvaɪrənmənt])',
            },
            partOfSpeech: {
              type: Type.STRING,
              description: '품사 (명사, 동사, 형용사, 부사, 접속사 등)',
            },
            gradeLevel: {
              type: Type.STRING,
              description: '중1 (기초/필수), 중2 (표준/내신), 중3 (심화/고등대비) 중 하나',
            },
            category: {
              type: Type.STRING,
              description: '사회/문화, 과학/환경, 기술/정보, 학교/진로, 일상/심리, 문학/예술, 역사/지리 중 하나',
            },
            exampleSentenceEn: {
              type: Type.STRING,
              description: '중학교 교과서/독해 지문 수준의 영어 예문',
            },
            exampleSentenceKo: {
              type: Type.STRING,
              description: '영어 예문의 정확한 한국어 해석',
            },
            teacherTip: {
              type: Type.STRING,
              description: '어원(접두사/어근/접미사) 분석 및 내신 서술형 철자 암기 꿀팁',
            },
            synonymOrAntonym: {
              type: Type.STRING,
              description: '유의어, 반의어, 파생어 또는 주요 연어(collocation) 정보',
            },
            quizType: {
              type: Type.STRING,
              description: 'choice_meaning, choice_word, spelling_input, fill_alphabet 중 하나',
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4개의 보기 (오답 매력도가 높은 중학 수준의 오답 보기 포함)',
            },
            targetAnswer: {
              type: Type.STRING,
              description: '정답 문자열',
            },
            missingIndices: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: 'fill_alphabet 퀴즈일 때 비워둘 알파벳의 0부터 시작하는 인덱스들',
            },
            iconName: {
              type: Type.STRING,
              description: '아이콘 명칭 (book, globe, star, award, compass, shield, target 등)',
            },
            emoji: {
              type: Type.STRING,
              description: '해당 단어를 상징하는 시각적 이모지',
            },
            colorTheme: {
              type: Type.STRING,
              description: 'indigo, sky, emerald, amber, rose, violet 중 하나',
            },
          },
          required: [
            'word',
            'meaning',
            'phonics',
            'partOfSpeech',
            'gradeLevel',
            'category',
            'exampleSentenceEn',
            'exampleSentenceKo',
            'teacherTip',
            'quizType',
            'options',
            'targetAnswer',
            'emoji',
            'colorTheme',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini API did not return text');
    }

    const parsedData = JSON.parse(text);
    const cardWithId = {
      ...parsedData,
      id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      word: parsedData.word.toLowerCase().trim(),
    };

    res.json({ success: true, card: cardWithId });
  } catch (error) {
    console.error('Error in /api/gemini/generate-word:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '단어 카드 생성 중 오류가 발생했습니다.',
    });
  }
});

/**
 * Teacher cheering message generator for elementary students.
 */
app.post('/api/gemini/teacher-cheer', async (req, res) => {
  const { isCorrect = true, word = '', meaning = '', studentStreak = 0 } = req.body || {};
  try {
    const prompt = `대한민국 중학교 영어 교사 입장에서 학생에게 지적이고 힘이 되는 피드백 한마디(1~2문장)를 남겨주세요.
- 상황: ${isCorrect ? '정답을 맞춤 (어휘 습득 성공!)' : '오답 발생 (오답 노트에 저장되어 복습 필요)'}
- 단어: ${word} (${meaning})
- 현재 연속 정답: ${studentStreak}개
- 중학생들이 내신 시험과 서술형 영단어 정복에 자신감을 가질 수 있는 명쾌하고 격려하는 멘트`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: '중학교 영어과 교사이자 멘토입니다. 학생이 꾸준히 어휘를 정복할 수 있도록 신뢰감 있고 따뜻하게 피드백합니다.',
      },
    });

    res.json({ success: true, cheer: response.text?.trim() });
  } catch (error) {
    console.error('Error in /api/gemini/teacher-cheer:', error);
    res.status(500).json({
      success: false,
      cheer: isCorrect
        ? '훌륭해요! 내신과 독해에서 가장 중요한 핵심 어휘를 정확히 익혔습니다! 👏'
        : '오답도 실력이 되는 과정이에요! 오답 노트에 저장되었으니 어원과 예문으로 확실히 다져봅시다! 💡',
    });
  }
});

// Setup Vite middleware in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Elementary English Learning Workbook server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
