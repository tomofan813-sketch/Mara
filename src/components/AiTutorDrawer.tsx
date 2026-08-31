import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, Sparkles, User, Lightbulb, Loader2, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { SkillVideo, ChatMessage, ActionStep } from '../types';
import { sound } from '../utils/audio';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillVideo;
  initialStepPrompt?: ActionStep | null;
}

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({
  isOpen,
  onClose,
  skill,
  initialStepPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize initial message when skill opens
  useEffect(() => {
    if (isOpen) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        sender: 'ai',
        text: `أهلاً بك! أنا "معلم مهارة الذكي" 🤖.\nأنا هنا لمساعدتك في فهم وتطبيق مهارة:\n**"${skill.title}"**.\n\nهل تود استيضاح خطوة معينة، معرفة أخطاء شائعة يجب تجنبها، أو ترغب في تمرين عملي؟`,
        timestamp: 'الآن',
      };

      if (initialStepPrompt) {
        setMessages([
          welcomeMessage,
          {
            id: 'step-req',
            sender: 'user',
            text: `ممكن تشرح لي خطوة ${initialStepPrompt.stepNumber}: "${initialStepPrompt.title}" بأمثلة واقعية؟`,
            timestamp: 'الآن',
          },
        ]);
        // Trigger auto AI response for this step
        handleSendQuestion(`اشرح لي بالتفصيل خطوة ${initialStepPrompt.stepNumber}: "${initialStepPrompt.title}" وكيف أطبقها بنجاح مع تجنب الأخطاء.`);
      } else {
        setMessages([welcomeMessage]);
      }
    }
  }, [isOpen, skill.id, initialStepPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendQuestion = async (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query || isLoading) return;

    sound.playPop();

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentLesson: skill,
          userQuestion: query,
          chatHistory: messages,
        }),
      });

      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      const aiReply = data.answer || 'عذراً، حدث خطأ أثناء جلب الرد.';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
      sound.playSuccess();
    } catch (err) {
      console.log('Using smart local AI response in standalone/offline mode:', err);
      // Smart offline fallback
      let smartAnswer = `أهلاً بك! في سياق مهارة "${skill.title}":\n\n`;
      if (query.includes('خطأ') || query.includes('أخطاء')) {
        smartAnswer += `⚠️ **أهم الأخطاء الشائعة لتجنبها:**\n1. التسرع في التنفيذ دون التأكد من المتطلبات.\n2. إهمال مراجعة الخطوات بعد الانتهاء.\n3. عدم استخدام أدوات القياس أو الاختبار المخصصة.`;
      } else if (query.includes('تمرين') || query.includes('دقائق') || query.includes('تطبيق')) {
        smartAnswer += `⚡ **تمرين تطبيقي سريع (5 دقائق):**\n1. افتح تبويب "تطبيق عملي" في الشاشة الرئيسية.\n2. قم بتنفيذ الخطوة الأولى: "${skill.steps[0]?.title || 'التهيئة'}".\n3. شارك نتيجتك أو دوّنها في الحقيبة التعليمية!`;
      } else if (query.includes('دخل') || query.includes('عمل') || query.includes('سوق')) {
        smartAnswer += `💼 **كيف تستفيد من هذه المهارة مهنياً:**\n- إتقان "${skill.title}" يتيح لك تقديم خدمات احترافية في سوق العمل الحر أو رفع كفاءتك التشغيلية وتوفير وقت ثمين.`;
      } else {
        smartAnswer += `💡 **إرشادات وتوجيهات تطبيقية:**\n- يُنصح بتطبيق الخطوة: "${skill.steps[0]?.title || 'البدء'}" أولاً ثم الانتقال تدريجياً للخطوات التالية.\n- يمكنك دوماً حفظ الملاحظات وتكرار مشاهدة المقطع لتثبيت المعلومة.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: smartAnswer,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
      sound.playSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeech = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const starterPrompts = [
    'ما هي أشهر الأخطاء الشائعة في هذا التطبيق؟',
    'أعطني تمرين عملي أطبقه الآن خلال 5 دقائق',
    'كيف أستخدم هذه المهارة لزيادة دخلي أو عملي؟',
    'اشرح لي المفهوم كأنني مبتدئ بعمر 12 سنة',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg h-[88vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/95 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-950">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-neutral-900" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-neutral-100 flex items-center gap-2">
                  المعلم الذكي التفاعلي
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                    Gemini 3.7
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-1">
                  مساعدك المباشر لمهارة: {skill.title}
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

          {/* Chat Messages */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3.5 bg-neutral-950/40">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center flex-shrink-0 mt-1 border border-indigo-500/30">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-neutral-800/80 border border-neutral-700/60 text-neutral-100 rounded-tr-none'
                      : 'bg-emerald-600 text-white rounded-tl-none font-medium shadow-md'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] opacity-70">
                      <span>{msg.timestamp}</span>
                      {isAi && (
                        <button
                          onClick={() => handleSpeech(msg.text)}
                          className="hover:opacity-100 text-neutral-400 hover:text-indigo-300 transition-opacity flex items-center gap-1"
                          title="قراءة صوتية"
                        >
                          {isSpeaking ? <VolumeX className="w-3 h-3 text-indigo-400" /> : <Volume2 className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isAi && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-300 flex items-center justify-center flex-shrink-0 mt-1 border border-emerald-500/30">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-indigo-300 bg-neutral-800/50 p-3 rounded-2xl w-fit border border-neutral-700/50">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>المعلم الذكي يحلل المهارة ويكتب الإجابة...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Starters */}
          <div className="px-3 py-2 bg-neutral-900 border-t border-neutral-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
            {starterPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendQuestion(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap flex-shrink-0 px-2.5 py-1 rounded-lg bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 text-[11px] border border-neutral-700/70 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
              placeholder="اطرح أي سؤال حول تطبيق هذه المهارة..."
              disabled={isLoading}
              className="flex-1 bg-neutral-950 border border-neutral-700/80 focus:border-indigo-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500"
            />

            <button
              onClick={() => handleSendQuestion()}
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all flex-shrink-0 shadow-md shadow-indigo-950"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
