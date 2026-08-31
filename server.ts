import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAI;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Q&A Tutor for current lesson
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { currentLesson, userQuestion, chatHistory } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        answer: `أهلاً بك! أنا المساعد التعليمي الذكي لمنصة "مهارة". بالنسبة لموضوع "${currentLesson?.title || 'المهارة الحالية'}": 

النصيحة العملية المباشرة:
1. ركز على تطبيق الخطوات خطوة بخطوة كما في الفيديو.
2. لا تتردد في استخدام علامة تبويب "تطبيق عملي" لاختبار مهاراتك فورياً!

(ملاحظة: يمكنك إعداد مفتاح API الخاص بك لتفعيل الإجابات الفورية التوليدية الذكية).`,
      });
    }

    const systemInstruction = `أنت "معلم مهارة الذكي" (Mahara AI Tutor)، خبير تعليمي تفاعلي متخصص في تبسيط المهارات العملية وتوضيح خطوات التنفيذ للمتعلمين.
سياق الدرس الحالي:
- العنوان: ${currentLesson?.title || 'مهارة عملية'}
- التصنيف: ${currentLesson?.categoryLabel || ''}
- المستوى: ${currentLesson?.level || ''}
- ملخص المهارة: ${currentLesson?.summary || ''}
- خطوات التنفيذ: ${JSON.stringify(currentLesson?.steps || [])}

التعليمات:
1. أجب باللغة العربية بأسلوب واضح، تشجيعي، ومباشر دون إطالة غير مفيدة.
2. إذا سألك المستخدم عن كيفية تطبيق خطوة معينة، أعطه مثالاً عملياً واقعياً أو حيلة سريعة.
3. استخدم التنسيق المنظم (نقاط، كود عند الحاجة، ملاحظات ذهبية).
4. اختم بجملة محفزة للتطبيق العملي.`;

    let prompt = `سؤال المتعلم: ${userQuestion}`;
    if (chatHistory && chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-4).map((m: any) => `${m.sender === 'user' ? 'المتعلم' : 'المعلم الذكي'}: ${m.text}`).join('\n');
      prompt = `المحادثة السابقة:\n${recentHistory}\n\nالسؤال الجديد: ${userQuestion}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ answer: response.text || 'عذراً، لم أتمكن من استخراج الإجابة، يرجى المحاولة مرة أخرى.' });
  } catch (error: any) {
    console.error('Error in /api/ai/ask:', error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء معالجة السؤال بالذكاء الاصطناعي.' });
  }
});

// Dynamic AI Quiz Generation
app.post('/api/ai/quiz', async (req, res) => {
  try {
    const { lessonTitle, lessonSummary, steps } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        questions: [
          {
            id: 'mock-q1',
            question: `ما هو المفهوم الأساسي في تطبيق ${lessonTitle}؟`,
            options: [
              'التنفيذ العشوائي دون تخطيط',
              'اتباع الخطوات المتسلسلة بدقة',
              'تجاهل الأدوات المساعدة',
              'تخطي مرحلة القياس والفحص'
            ],
            correctIndex: 1,
            explanation: 'اتباع الخطوات العملية المتسلسلة هو أساس إتقان المهارات وتفادي الأخطاء.',
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `قم بتوليد اختبار سريع (سؤالين إلى ثلاثة أسئلة اختيار من متعدد) لاختبار فهم المتعلم بعد مشاهدة هذا الدرس:
العنوان: ${lessonTitle}
الملخص: ${lessonSummary}
الخطوات: ${JSON.stringify(steps || [])}`,
      config: {
        systemInstruction: 'أنت مسؤول تقييم تعليمي ومصمم اختبارات مهارية ذكية. أخرج الأسئلة بصيغة JSON حصراً وفق الـ Schema المحددة باللغة العربية.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"questions":[]}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI Lesson Generator
app.post('/api/ai/create-lesson', async (req, res) => {
  try {
    const { topic, category, level } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        lesson: {
          id: `ai-skill-${Date.now()}`,
          title: `كيف تتقن ${topic} في خطوات عملية سريعة`,
          category: category || 'tech',
          categoryLabel: 'مهارة عملية',
          level: level || 'مبتدئ',
          durationSeconds: 45,
          xpReward: 40,
          tags: [topic, 'مهارات_عملية', 'تطوير_ذاتي'],
          summary: `دليل سريع ومكثف لتعلم ${topic} من خلال خطوات تطبيقية مباشرة قابلة للتنفيذ الفوري.`,
          steps: [
            { id: '1', stepNumber: 1, title: 'التهيئة وفهم المفهوم الأساسي', description: `افهم المبدأ الرئيسي في ${topic} وتأكد من تجهيز الأدوات المطلوبة.` },
            { id: '2', stepNumber: 2, title: 'التطبيق العملي خطوة بخطوة', description: 'ابدأ بتنفيذ التمرين الأول وتجنب التشتت بالخيارات المتقدمة.' },
            { id: '3', stepNumber: 3, title: 'المراجعة واختبار النتيجة', description: 'تحقق من صحة المخرجات وقارنها بالمعايير القياسية.' }
          ],
          quiz: [
            {
              id: 'q1',
              question: `ما هي أهم خطوة أولى عند البدء في ${topic}؟`,
              options: ['التهيئة وتجهيز الأدوات بدقة', 'التخطي للمراحل النهائية', 'تجنب القراءة والملاحظة', 'التطبيق دون معرفة الهدف'],
              correctIndex: 0,
              explanation: 'التهيئة السليمة تضمن تنفيذ العمل بنجاح بنسبة 90%.'
            }
          ],
          resources: [
            { id: 'r1', title: 'خريطة طريق مختصرة', type: 'cheat_sheet', content: `خطوات إتقان ${topic} في 3 أيام تدريبية.` }
          ]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `قم بتوليد مقطع تعليمي مهاري قصير (Micro-lesson / Short-form Skill Clip) حول موضوع: "${topic}".
التصنيف: ${category || 'عام'}
المستوى: ${level || 'مبتدئ'}

المطلوب:
1. عنوان جذاب ومباشر للمقطع التعليمي
2. ملخص يركز على الفائدة المباشرة
3. 3 إلى 4 خطوات عملية تنفيذية متسلسلة مع نصائح وأكواد/أمثلة إن كانت تقنية
4. سؤالين اختبار ذكيين لفحص الفهم
5. مورد أو قالب عملي جاهز للنسخ
6. نص للـ Sandbox إذا كان تمرين برمجي أو أمر ذكاء اصطناعي أو حاسبة`,
      config: {
        systemInstruction: 'أنت خبير في تصميم المحتوى التعليمي السريع Micro-learning. أخرج النتيجة بتنسيق JSON حصراً باللغة العربية.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            durationSeconds: { type: Type.INTEGER },
            xpReward: { type: Type.INTEGER },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tip: { type: Type.STRING },
                  codeSnippet: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'description'],
              },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
            resources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ['title', 'type', 'content'],
              },
            },
          },
          required: ['title', 'summary', 'steps', 'quiz', 'resources'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const createdLesson = {
      id: `ai-skill-${Date.now()}`,
      title: parsed.title || topic,
      creator: {
        name: 'مساعد مهارة التوليدي',
        handle: '@mahara_ai',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        title: 'صانع محتوى مهارات ذكي',
        isVerified: true,
        followersCount: '150K',
      },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      category: category || 'tech',
      categoryLabel: category === 'tech' ? 'برمجة وتقنية' : category === 'ai' ? 'ذكاء اصطناعي' : 'مهارة عملية',
      level: level || 'مبتدئ',
      durationSeconds: parsed.durationSeconds || 45,
      xpReward: parsed.xpReward || 40,
      tags: parsed.tags || [topic],
      summary: parsed.summary || `تعلم ${topic} بخطوات عملية`,
      captionHighlights: [
        { time: 5, text: `مرحباً بك في درس ${parsed.title || topic}`, keywords: ['مقدمة'] },
        { time: 20, text: 'ابدأ بالخطوة الأولى وطبقها بحذر ودقة', keywords: ['الخطوة الأولى'] },
      ],
      steps: (parsed.steps || []).map((s: any, idx: number) => ({
        id: `step-${idx + 1}`,
        stepNumber: s.stepNumber || idx + 1,
        title: s.title,
        description: s.description,
        tip: s.tip,
        codeSnippet: s.codeSnippet,
      })),
      quiz: (parsed.quiz || []).map((q: any, idx: number) => ({
        id: `q-${idx + 1}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
      resources: (parsed.resources || []).map((r: any, idx: number) => ({
        id: `res-${idx + 1}`,
        title: r.title,
        type: r.type || 'cheat_sheet',
        content: r.content,
      })),
      stats: {
        views: 120,
        likes: 18,
        saves: 14,
        shares: 6,
        completions: 8,
      },
      comments: [],
    };

    res.json({ lesson: createdLesson });
  } catch (error: any) {
    console.error('Error in /api/ai/create-lesson:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware in dev or static serving in production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduTok / Mahara server is running on http://localhost:${PORT}`);
  });
}

setupViteOrStatic();
