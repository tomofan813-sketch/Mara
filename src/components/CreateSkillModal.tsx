import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, Plus, Video, Layers, CheckCircle2 } from 'lucide-react';
import { SkillVideo, SkillCategory, SkillLevel } from '../types';
import { CATEGORIES_LIST } from '../data/skillsData';
import { sound } from '../utils/audio';

interface CreateSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkill: (skill: SkillVideo) => void;
}

export const CreateSkillModal: React.FC<CreateSkillModalProps> = ({
  isOpen,
  onClose,
  onAddSkill,
}) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<SkillCategory>('tech');
  const [level, setLevel] = useState<SkillLevel>('مبتدئ');
  const [isLoading, setIsLoading] = useState(false);

  // Manual fields
  const [manualTitle, setManualTitle] = useState('');
  const [manualSummary, setManualSummary] = useState('');
  const [manualStep1, setManualStep1] = useState('');
  const [manualStep2, setManualStep2] = useState('');

  if (!isOpen) return null;

  const handleGenerateAiLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    setIsLoading(true);
    sound.playPop();

    try {
      const res = await fetch('/api/ai/create-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          level,
        }),
      });

      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      if (data.lesson) {
        sound.playLevelUp();
        onAddSkill(data.lesson);
        onClose();
      }
    } catch (err) {
      console.log('Using local lesson generator in standalone mode:', err);
      const catLabel = CATEGORIES_LIST.find(c => c.id === category)?.label || 'مهارة عملية';
      const newLesson: SkillVideo = {
        id: `ai-skill-${Date.now()}`,
        title: `كيف تتقن ${topic.trim()} في خطوات عملية سريعة`,
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
        category,
        categoryLabel: catLabel,
        level,
        durationSeconds: 45,
        xpReward: 40,
        tags: [topic.trim(), 'مهارات_عملية', 'تطبيق_سريع'],
        summary: `دليل سريع ومكثف لتعلم ${topic.trim()} من خلال خطوات تطبيقية مباشرة قابلة للتنفيذ الفوري.`,
        captionHighlights: [
          { time: 5, text: `مرحباً بك في درس ${topic.trim()}`, keywords: ['مقدمة'] },
          { time: 20, text: 'ابدأ بالخطوة الأولى وطبقها بدقة', keywords: ['الخطوة الأولى'] },
        ],
        steps: [
          {
            id: 's1',
            stepNumber: 1,
            title: `التهيئة وفهم المفهوم الأساسي لـ ${topic.trim()}`,
            description: `افهم المبدأ الرئيسي في ${topic.trim()} وتأكد من تجهيز الأدوات والمتطلبات الأولية.`,
            tip: 'تأكد من عدم تخطي مرحلة الإعداد المسبق قبل البدء بالتنفيذ الفعلي.',
          },
          {
            id: 's2',
            stepNumber: 2,
            title: 'التطبيق العملي المباشر خطوة بخطوة',
            description: 'ابدأ بتنفيذ التمرين الأول تدريجياً وتجنب التشتت بالخيارات الإضافية المعقدة.',
            tip: 'ركز على الإتقان البسيط قبل محاولة الوصول إلى الكمال.',
          },
          {
            id: 's3',
            stepNumber: 3,
            title: 'المراجعة واختبار النتيجة وجودة المخرج',
            description: 'تحقق من صحة المخرجات وقارنها بالمعايير القياسية للتأكد من نجاح المهارة.',
            tip: 'احفظ النتيجة في مفكرتك التعليمية للمراجعة اللاحقة.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: `ما هي أهم خطوة أولى عند البدء في ${topic.trim()}؟`,
            options: [
              'التهيئة وتجهيز المتطلبات والأدوات بدقة',
              'التخطي المباشر للمراحل النهائية',
              'تجاهل التعليمات الإرشادية',
              'التطبيق دون تحديد الهدف'
            ],
            correctIndex: 0,
            explanation: 'التهيئة السليمة تضمن تنفيذ العمل بنجاح بنسبة تفوق 90%.',
          },
        ],
        resources: [
          {
            id: 'r1',
            title: `خريطة طريق مختصرة لـ ${topic.trim()}`,
            type: 'cheat_sheet',
            content: `خطوات إتقان ${topic.trim()}:\n1. الإعداد والتهيئة\n2. التطبيق العملي اليومي\n3. التقييم والمراجعة المستمرة`,
          },
        ],
        stats: { views: 10, likes: 5, saves: 3, shares: 1, completions: 2 },
        comments: [],
      };

      sound.playLevelUp();
      onAddSkill(newLesson);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    sound.playSuccess();
    const newLesson: SkillVideo = {
      id: `manual-skill-${Date.now()}`,
      title: manualTitle.trim(),
      creator: {
        name: 'أنت (صانع مهارة)',
        handle: '@you_creator',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        title: 'مشارك مهارات',
        isVerified: false,
        followersCount: '1.2K',
      },
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      posterUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      category,
      categoryLabel: CATEGORIES_LIST.find(c => c.id === category)?.label || 'مهارة عملية',
      level,
      durationSeconds: 45,
      xpReward: 35,
      tags: ['مهارة_جديدة', 'تطبيق_عملي'],
      summary: manualSummary.trim() || 'مقطع تعليمي عملي موجز.',
      captionHighlights: [
        { time: 5, text: manualTitle, keywords: ['المهارة'] },
      ],
      steps: [
        {
          id: 'm1',
          stepNumber: 1,
          title: manualStep1 || 'الخطوة الأولى للتهيئة والبدء',
          description: manualStep1 || 'تجهيز الأدوات والمتطلبات الأساسية للبدء بدقة.',
        },
        {
          id: 'm2',
          stepNumber: 2,
          title: manualStep2 || 'التنفيذ العملي المباشر',
          description: manualStep2 || 'تطبيق الخطوة المباشرة ومراجعة النتيجة.',
        },
      ],
      quiz: [
        {
          id: 'mq1',
          question: `ما هو أهم عامل لنجاح تطبيق ${manualTitle}؟`,
          options: ['التركيز والدقة في الخطوات', 'الاستعجال وتخطي التهيئة', 'تجاهل النصائح', 'عدم المراجعة'],
          correctIndex: 0,
          explanation: 'الالتزام بتسلسل الخطوات يضمن الإتقان وتفادي الأخطاء.',
        },
      ],
      resources: [
        {
          id: 'mr1',
          title: 'ملخص الخطوات',
          type: 'cheat_sheet',
          content: `${manualStep1}\n${manualStep2}`,
        },
      ],
      stats: { views: 1, likes: 1, saves: 1, shares: 0, completions: 0 },
      comments: [],
    };

    onAddSkill(newLesson);
    onClose();
  };

  const sampleAiIdeas = [
    'كيف تبرمج قائمة تنقل Responsive بـ Tailwind',
    'أمر ذكاء اصطناعي لكتابة خطة عمل أسبوعية',
    'طريقة لحام سلك مقطوع بمكواة اللحام القصدير',
    'قاعدة الصمت لـ 3 ثوانٍ قبل الإجابة في المقابلات',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-950">
                ✨
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-100 flex items-center gap-2">
                  إضافة مهارة تعليمية جديدة
                </h3>
                <p className="text-xs text-neutral-400">
                  توليد مقطع مهاري ذكي بواسطة Gemini أو كتابته يدوياً
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-2 bg-neutral-950 gap-2 border-b border-neutral-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('ai')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                mode === 'ai'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>توليد تلقائي فوري بالـ AI</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                mode === 'manual'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>كتابة مهارة يدوية</span>
            </button>
          </div>

          {/* Body Forms */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {mode === 'ai' ? (
              <form onSubmit={handleGenerateAiLesson} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">
                    عن ماذا تدور المهارة العملية؟ (Topic):
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="مثال: حيلة اختصار الوقت في Excel، أو فحص تسريب السباكة..."
                    required
                    disabled={isLoading}
                    className="w-full bg-neutral-950 border border-neutral-700 focus:border-indigo-500 focus:outline-none rounded-xl p-3 text-neutral-100 placeholder-neutral-500 text-xs sm:text-sm"
                  />
                </div>

                {/* Ideas chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-neutral-400">أفكار مقترحة سريعة للتجربة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleAiIdeas.map((idea, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTopic(idea)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] border border-neutral-700/60"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5">التصنيف:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SkillCategory)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-neutral-200"
                    >
                      <option value="tech">برمجة وتقنية</option>
                      <option value="ai">ذكاء اصطناعي وأتمتة</option>
                      <option value="diy">صيانة وحِرف يدوية</option>
                      <option value="languages">لغات وتواصل</option>
                      <option value="business">أعمال ومالية</option>
                      <option value="design">تصميم وإنتاج</option>
                      <option value="life_hacks">مهارات حياتية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1.5">المستوى:</label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as SkillLevel)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-neutral-200"
                    >
                      <option value="مبتدئ">مبتدئ</option>
                      <option value="متوسط">متوسط</option>
                      <option value="متقدم">متقدم</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/30 rounded-xl text-indigo-200 text-xs leading-relaxed space-y-1">
                  <div className="font-bold flex items-center gap-1 text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>ماذا سيقوم الذكاء الاصطناعي بتوليده؟</span>
                  </div>
                  <div>
                    سيبني لك بطاقة تعليمية كاملة: ملخص المهارة، خطوات التنفيذ المرقمة، اختبار سريع لاختبار المتعلمين، وقوالب قابلة للنسخ!
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!topic.trim() || isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>جاري صياغة المهارة والخطوات الذكية...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>توليد ونشر المهارة في الخلاصة</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Manual form */
              <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">عنوان المهارة:</label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="مثال: كيفية فحص الفيوز المنزلي بأمان"
                    required
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">الملخص والفائدة المباشرة:</label>
                  <textarea
                    value={manualSummary}
                    onChange={(e) => setManualSummary(e.target.value)}
                    placeholder="اكتب نبذة سريعة توضح ما سيتعلمه المستخدم..."
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">الخطوة العملية الأولى:</label>
                  <input
                    type="text"
                    value={manualStep1}
                    onChange={(e) => setManualStep1(e.target.value)}
                    placeholder="الخطوة 1..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">الخطوة العملية الثانية:</label>
                  <input
                    type="text"
                    value={manualStep2}
                    onChange={(e) => setManualStep2(e.target.value)}
                    placeholder="الخطوة 2..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-neutral-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!manualTitle.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>نشر المهارة يدوياً</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
