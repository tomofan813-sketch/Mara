import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, Plus, Video, Upload, CheckCircle2, Image, Link, FileVideo, AlertCircle } from 'lucide-react';
import { SkillVideo, SkillCategory, SkillLevel } from '../types';
import { CATEGORIES_LIST } from '../data/skillsData';
import { useAuth } from '../context/AuthContext';
import { publishNewVideo } from '../services/dbOperations';
import { sound } from '../utils/audio';

interface CreateSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkill: (skill: any) => void;
}

export const CreateSkillModal: React.FC<CreateSkillModalProps> = ({
  isOpen,
  onClose,
  onAddSkill,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [mode, setMode] = useState<'upload' | 'ai'>('upload');
  
  // Video upload / manual fields
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSummary, setVideoSummary] = useState('');
  const [category, setCategory] = useState<SkillCategory>('tech');
  const [level, setLevel] = useState<SkillLevel>('مبتدئ');
  const [videoUrl, setVideoUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // Interactive mini steps
  const [step1Title, setStep1Title] = useState('');
  const [step1Desc, setStep1Desc] = useState('');
  const [step2Title, setStep2Title] = useState('');
  const [step2Desc, setStep2Desc] = useState('');

  // AI Topic generator
  const [aiTopic, setAiTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle local video file pick via HTML5 File Reader
  const handleLocalVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (e.g. limit to 100MB for mobile performance)
    if (file.size > 100 * 1024 * 1024) {
      setErrorMsg('حجم ملف الفيديو كبير جداً. الحد الأقصى المسموح به هو 100 ميغابايت.');
      return;
    }

    setErrorMsg(null);
    const objectUrl = URL.createObjectURL(file);
    setVideoUrl(objectUrl);
    sound.playSuccess();
  };

  const handleLocalPosterFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPosterUrl(objectUrl);
  };

  const handlePublishManualVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || (!videoUrl.trim() && !posterUrl.trim())) {
      setErrorMsg('يرجى كتابة عنوان الفيديو وتحديد ملف أو رابط الفيديو');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    sound.playPop();

    const catLabel = CATEGORIES_LIST.find(c => c.id === category)?.label || 'مهارة عامة';
    const parsedTags = tagsInput.split(/[\s,]+/).filter(t => t.trim().length > 0);

    const steps = [];
    if (step1Title.trim()) {
      steps.push({
        id: 's1',
        stepNumber: 1,
        title: step1Title.trim(),
        description: step1Desc.trim() || 'الخطوة الأولى في تطبيق المهارة',
      });
    }
    if (step2Title.trim()) {
      steps.push({
        id: 's2',
        stepNumber: 2,
        title: step2Title.trim(),
        description: step2Desc.trim() || 'الخطوة الثانية في تطبيق المهارة',
      });
    }
    if (steps.length === 0) {
      steps.push({
        id: 's1',
        stepNumber: 1,
        title: 'فهم وتطبيق المهارة عملياً',
        description: videoSummary || 'تطبيق الخطوات الموضحة في الفيديو بدقة وبشكل تدريجي.',
      });
    }

    try {
      const finalVideoData = {
        userId: currentUser?.uid || 'guest_creator',
        creatorName: userProfile?.name || 'صانع مهارة',
        creatorHandle: userProfile?.handle || '@creator',
        creatorAvatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        creatorTitle: userProfile?.title || 'صانع محتوى تعليمي',
        isVerified: userProfile?.isVerified || false,
        title: videoTitle.trim(),
        summary: videoSummary.trim() || 'فيديو تعليمي تفاعلي تم نشره في مجتمع مهارة.',
        videoUrl: videoUrl.trim() || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        posterUrl: posterUrl.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        category,
        categoryLabel: catLabel,
        level,
        durationSeconds: 45,
        xpReward: 50,
        tags: parsedTags.length > 0 ? parsedTags : ['مهارة_جديدة', 'تطبيق_عملي'],
        captionHighlights: [
          { time: 3, text: videoTitle.trim(), keywords: ['مهارة'] },
          { time: 15, text: steps[0]?.title || 'خطوات التطبيق', keywords: ['تطبيق'] },
        ],
        steps,
        quiz: [
          {
            id: 'q1',
            question: `ما هو الهدف الأساسي من مهارة "${videoTitle.trim()}"؟`,
            options: [
              'التطبيق العملي واكتساب المهارة بنجاح',
              'التنفيذ العشوائي دون تخطيط',
              'تجاهل الخطوات الإرشادية',
              'عدم الممارسة'
            ],
            correctIndex: 0,
            explanation: 'التطبيق العملي الدقيق هو مفتاح إتقان المهارات في مهارة.',
          },
        ],
        resources: [
          {
            id: 'r1',
            title: 'دليل التطبيق والمراجع',
            type: 'link',
            content: 'ملخص تعليمي وخطوات تطبيق المهارة خطوة بخطوة.',
            url: '#',
          },
        ],
        sandboxType: 'none',
      };

      const published = await publishNewVideo(finalVideoData);
      sound.playLevelUp();
      onAddSkill(published);
      onClose();
    } catch (err: any) {
      console.error('Error publishing video:', err);
      setErrorMsg('حدث خطأ أثناء حفظ الفيديو في قاعدة البيانات السحابية.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAiSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() || isLoading) return;

    setIsLoading(true);
    sound.playPop();
    setErrorMsg(null);

    try {
      const catLabel = CATEGORIES_LIST.find(c => c.id === category)?.label || 'مهارة عملية';
      const aiVideoData = {
        userId: currentUser?.uid || 'ai_agent',
        creatorName: 'مساعد مهارة التوليدي 🤖',
        creatorHandle: '@mahara_ai',
        creatorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        creatorTitle: 'معلم الذكاء الاصطناعي',
        isVerified: true,
        title: `كيف تتقن ${aiTopic.trim()} في خطوات عملية سريعة`,
        summary: `دليل سريع ومكثف لتعلم ${aiTopic.trim()} من خلال خطوات تطبيقية مباشرة قابلة للتنفيذ الفوري.`,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
        category,
        categoryLabel: catLabel,
        level,
        durationSeconds: 45,
        xpReward: 40,
        tags: [aiTopic.trim(), 'مهارات_عملية', 'تطبيق_سريع'],
        captionHighlights: [
          { time: 5, text: `مرحباً بك في درس ${aiTopic.trim()}`, keywords: ['مقدمة'] },
          { time: 20, text: 'ابدأ بالخطوة الأولى وطبقها بدقة', keywords: ['الخطوة الأولى'] },
        ],
        steps: [
          {
            id: 's1',
            stepNumber: 1,
            title: `التهيئة وفهم المفهوم الأساسي لـ ${aiTopic.trim()}`,
            description: `افهم المبدأ الرئيسي في ${aiTopic.trim()} وتأكد من تجهيز الأدوات والمتطلبات الأولية.`,
            tip: 'تأكد من عدم تخطي مرحلة الإعداد المسبق قبل البدء بالتنفيذ الفعلي.',
          },
          {
            id: 's2',
            stepNumber: 2,
            title: 'التطبيق العملي المباشر خطوة بخطوة',
            description: 'ابدأ بتنفيذ التمرين الأول تدريجياً وتجنب التشتت بالخيارات الإضافية المعقدة.',
            tip: 'ركز على الإتقان البسيط قبل محاولة الوصول إلى الكمال.',
          },
        ],
        quiz: [
          {
            id: 'q1',
            question: `ما هي أهم خطوة أولى عند البدء في ${aiTopic.trim()}؟`,
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
            title: 'ورقة مساعدة ومفاهيم أساسية',
            type: 'cheat_sheet',
            content: `أهم النقاط الذهبية لتذكر أساسيات ${aiTopic.trim()}`,
            url: '#',
          },
        ],
        sandboxType: 'prompt',
      };

      const published = await publishNewVideo(aiVideoData);
      sound.playLevelUp();
      onAddSkill(published);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('تعذر إنشاء الفيديو التوليدي، يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">نشر مهارة أو درس فيديو جديد</h3>
                <p className="text-[10px] text-neutral-400">شارك معرفتك العملية أو ولّد درساً فورياً بالذكاء الاصطناعي</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                onClose();
              }}
              className="p-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-neutral-950 p-1 border-b border-neutral-800 text-xs font-bold flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setMode('upload');
              }}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                mode === 'upload'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>رفع فيديو ونشر يدوي</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setMode('ai');
              }}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                mode === 'ai'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>توليد ذكي بالـ AI</span>
            </button>
          </div>

          {/* Body Form */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar text-xs">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'upload' ? (
              <form onSubmit={handlePublishManualVideo} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    عنوان المهارة / الفيديو *
                  </label>
                  <input
                    type="text"
                    required
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="مثال: كيف تبني واجهة مستخدم سريعة بـ Tailwind"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Video File Picker or Link */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2.5">
                  <label className="block text-[11px] font-semibold text-neutral-300">
                    ملف الفيديو (من الهاتف أو الحاسوب)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-neutral-900 hover:bg-neutral-850 border border-dashed border-neutral-700 hover:border-emerald-500 rounded-xl cursor-pointer text-neutral-300 transition-colors">
                      <FileVideo className="w-4 h-4 text-emerald-400" />
                      <span>{videoUrl.startsWith('blob:') ? 'تم اختيار الفيديو بنجاح ✓' : 'اختر ملف فيديو (MP4/WebM)'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleLocalVideoFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500">أو رابط فيديو مباشر:</span>
                    <input
                      type="url"
                      value={videoUrl.startsWith('blob:') ? '' : videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://example.com/video.mp4"
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-[11px] text-white font-mono placeholder-neutral-600"
                    />
                  </div>
                </div>

                {/* Poster image */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    صورة الغلاف (Cover Image)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={posterUrl}
                      onChange={(e) => setPosterUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 text-[11px] font-mono"
                    />
                    <label className="p-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl cursor-pointer flex items-center justify-center text-neutral-300">
                      <Image className="w-4 h-4 text-indigo-400" />
                      <input type="file" accept="image/*" onChange={handleLocalPosterFile} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Category & Level */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      تصنيف المهارة
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SkillCategory)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                    >
                      {CATEGORIES_LIST.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      المستوى
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as SkillLevel)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="مبتدئ">مبتدئ</option>
                      <option value="متوسط">متوسط</option>
                      <option value="متقدم">متقدم</option>
                    </select>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    الوصف المختصر
                  </label>
                  <textarea
                    rows={2}
                    value={videoSummary}
                    onChange={(e) => setVideoSummary(e.target.value)}
                    placeholder="اشرح باختصار ماذا سيتعلم المشاهد بعد تطبيق المهارة..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    الهاشتاغات والوسوم
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="#برمجة #تصميم #مهارات_عملية"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 font-mono text-[11px]"
                  />
                </div>

                {/* Interactive Steps Builder */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-neutral-200">خطوات التطبيق التفاعلية (اختياري)</span>
                  <input
                    type="text"
                    value={step1Title}
                    onChange={(e) => setStep1Title(e.target.value)}
                    placeholder="الخطوة 1: عنوان الخطوة الأولى"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                  />
                  <input
                    type="text"
                    value={step2Title}
                    onChange={(e) => setStep2Title(e.target.value)}
                    placeholder="الخطوة 2: عنوان الخطوة الثانية"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>نشر الفيديو في مهارة الآن 🚀</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleGenerateAiSkill} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    ما هي المهارة التي ترغب بتوليد درس فوري لها؟ *
                  </label>
                  <input
                    type="text"
                    required
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="مثال: كيفية إعداد إعلانات تيك توك، كتابة أوامر ChatGPT، صيانة محرك الدراجة..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      التصنيف
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SkillCategory)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                    >
                      {CATEGORIES_LIST.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      المستوى
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as SkillLevel)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="مبتدئ">مبتدئ</option>
                      <option value="متوسط">متوسط</option>
                      <option value="متقدم">متقدم</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed">
                  💡 سيقوم المعلم التوليدي بصياغة خطوات تطبيقية عملية، واختبار فوري متعدد الخيارات، ومراجع تطبيقية وحفظها مباشرة في قاعدة البيانات.
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-950 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>توليد ونشر الدرس فورياً ✨</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
