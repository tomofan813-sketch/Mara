import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, RotateCcw, Copy, Check, Sparkles, Sliders, Mic, Square, ArrowRight, DollarSign } from 'lucide-react';
import { SkillVideo } from '../types';
import { sound } from '../utils/audio';

interface SandboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillVideo;
}

export const SandboxDrawer: React.FC<SandboxDrawerProps> = ({
  isOpen,
  onClose,
  skill,
}) => {
  // CSS Sandbox State
  const [flexJustify, setFlexJustify] = useState('center');
  const [flexAlign, setFlexAlign] = useState('center');
  const [flexDirection, setFlexDirection] = useState('row');
  const [flexGap, setFlexGap] = useState(16);

  // Prompt Sandbox State
  const [roleInput, setRoleInput] = useState('خبير تسويق رقمي ومدير حملات إعلانية');
  const [taskInput, setTaskInput] = useState('وضع خطة إطلاق منتج جديد خلال أسبوع');
  const [formatInput, setFormatInput] = useState('جدول Markdown بخطوات يومية');
  const [promptOutput, setPromptOutput] = useState('');
  const [isCopiedPrompt, setIsCopiedPrompt] = useState(false);

  // Calculator Sandbox State
  const [salary, setSalary] = useState(10000);
  const [fixedExpenses, setFixedExpenses] = useState(4000);

  // Speech Practice State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [activePhraseIndex, setActivePhraseIndex] = useState(0);

  if (!isOpen) return null;

  const sandboxType = skill.sandboxType || 'code';

  const generatedPrompt = `[الدور]: تصرف كـ ${roleInput} بخبرة 10 سنوات.\n[المهمة]: أريد منك تنفيذ التالي: ${taskInput}.\n[القيود]: ركز على الجانب العملي التنفيذي، تجنب الحشو، واذكر الأدوات المقترحة.\n[صيغة الإخراج]: ${formatInput}.`;

  const copyGeneratedPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    sound.playSuccess();
    setIsCopiedPrompt(true);
    setTimeout(() => setIsCopiedPrompt(false), 2000);
  };

  // Calculator computations
  const needs = Math.round(salary * 0.5);
  const wants = Math.round(salary * 0.3);
  const savings = Math.round(salary * 0.2);
  const emergencyMonths3 = Math.round((needs + fixedExpenses) * 3);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/20">
                🧪
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-neutral-100 flex items-center gap-2">
                  مختبر التطبيق العملي (Interactive Sandbox)
                </h3>
                <p className="text-xs text-neutral-400">
                  جرّب وطبّق المهارة بنفسك بشكل حي ومباشر
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

          {/* Sandbox Body Content Based on Type */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {/* 1. CODE / CSS FLEXBOX SANDBOX */}
            {sandboxType === 'code' && (
              <div className="space-y-4">
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs text-neutral-300 flex items-center justify-between">
                  <span>عدّل خصائص الـ Flexbox وشاهد تأثير السنترة على الصناديق فوراً:</span>
                  <button
                    onClick={() => {
                      setFlexJustify('center');
                      setFlexAlign('center');
                      setFlexDirection('row');
                      setFlexGap(16);
                      sound.playPop();
                    }}
                    className="text-neutral-400 hover:text-neutral-200 flex items-center gap-1 text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>إعادة ضبط</span>
                  </button>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/50">
                    <label className="block text-neutral-400 mb-1.5 font-medium">
                      justify-content (المحور الرئيسي):
                    </label>
                    <select
                      value={flexJustify}
                      onChange={(e) => {
                        setFlexJustify(e.target.value);
                        sound.playPop();
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="center">center (توسيط)</option>
                      <option value="flex-start">flex-start (بداية)</option>
                      <option value="flex-end">flex-end (نهاية)</option>
                      <option value="space-between">space-between (توزيع حواف)</option>
                      <option value="space-around">space-around (توزيع متوازن)</option>
                    </select>
                  </div>

                  <div className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/50">
                    <label className="block text-neutral-400 mb-1.5 font-medium">
                      align-items (المحور المتعامد):
                    </label>
                    <select
                      value={flexAlign}
                      onChange={(e) => {
                        setFlexAlign(e.target.value);
                        sound.playPop();
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="center">center (توسيط عمودي)</option>
                      <option value="flex-start">flex-start (أعلى)</option>
                      <option value="flex-end">flex-end (أسفل)</option>
                      <option value="stretch">stretch (تمدد)</option>
                    </select>
                  </div>
                </div>

                {/* Gap Slider */}
                <div className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/50 flex items-center justify-between text-xs gap-4">
                  <span className="text-neutral-400 font-medium">
                    المسافة gap: <span className="text-emerald-400 font-bold">{flexGap}px</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    step="4"
                    value={flexGap}
                    onChange={(e) => setFlexGap(Number(e.target.value))}
                    className="flex-1 accent-emerald-500"
                  />
                </div>

                {/* Live Visual Canvas Preview */}
                <div className="border border-neutral-700 rounded-xl overflow-hidden bg-black/60">
                  <div className="bg-neutral-950 px-3 py-1.5 border-b border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
                    <span>🔴 🟡 🟢 معاينة حية (Live Render)</span>
                    <span className="text-emerald-400 font-bold">display: flex</span>
                  </div>
                  <div
                    className="w-full h-44 bg-neutral-950/80 p-4 transition-all duration-300 overflow-hidden"
                    style={{
                      display: 'flex',
                      justifyContent: flexJustify,
                      alignItems: flexAlign,
                      flexDirection: flexDirection as any,
                      gap: `${flexGap}px`,
                    }}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-bold text-xs flex items-center justify-center shadow-lg">
                      1
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-400 text-white font-bold text-xs flex items-center justify-center shadow-lg">
                      2
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-black font-bold text-xs flex items-center justify-center shadow-lg">
                      3
                    </div>
                  </div>
                </div>

                {/* Generated CSS Snippet */}
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs font-mono text-emerald-300 dir-ltr text-left">
                  {`.container {\n  display: flex;\n  justify-content: ${flexJustify};\n  align-items: ${flexAlign};\n  gap: ${flexGap}px;\n}`}
                </div>
              </div>
            )}

            {/* 2. PROMPT ENGINEERING SANDBOX */}
            {sandboxType === 'prompt' && (
              <div className="space-y-3.5">
                <p className="text-xs text-neutral-400 leading-relaxed">
                  قم بملء مكونات الأمر وفق معادلة الفيديو الذهبية لتوليد برومبت احترافي جاهز للنسخ:
                </p>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      1. الدور المطلوب (Role / Persona):
                    </label>
                    <input
                      type="text"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      2. المهمة والسياق (Task & Context):
                    </label>
                    <input
                      type="text"
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-medium mb-1">
                      3. التنسيق والمخرجات (Output Format):
                    </label>
                    <input
                      type="text"
                      value={formatInput}
                      onChange={(e) => setFormatInput(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Generated Prompt Box */}
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="font-semibold text-amber-400">الأمر النهائي المُهيكل:</span>
                    <button
                      onClick={copyGeneratedPrompt}
                      className="flex items-center gap-1 text-neutral-300 hover:text-amber-300 transition-colors"
                    >
                      {isCopiedPrompt ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الأمر</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans bg-neutral-900/80 p-3 rounded-lg border border-neutral-800">
                    {generatedPrompt}
                  </pre>
                </div>
              </div>
            )}

            {/* 3. CALCULATOR SANDBOX (50/30/20) */}
            {sandboxType === 'calculator' && (
              <div className="space-y-4">
                <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-semibold text-neutral-200">الراتب الشهري الصافي:</label>
                      <span className="text-emerald-400 font-bold font-mono text-sm">{salary.toLocaleString()} ريال</span>
                    </div>
                    <input
                      type="range"
                      min="3000"
                      max="40000"
                      step="500"
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-blue-950/30 border border-blue-500/30 p-3 rounded-xl">
                    <div className="text-[11px] text-blue-400 font-bold mb-1">50% أساسيات</div>
                    <div className="text-sm sm:text-base font-bold font-mono text-blue-200">{needs.toLocaleString()}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">سكن، فواتير، غذاء</div>
                  </div>

                  <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl">
                    <div className="text-[11px] text-amber-400 font-bold mb-1">30% رغبات</div>
                    <div className="text-sm sm:text-base font-bold font-mono text-amber-200">{wants.toLocaleString()}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">مطاعم، سفر، ترفيه</div>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl">
                    <div className="text-[11px] text-emerald-400 font-bold mb-1">20% استثمار</div>
                    <div className="text-sm sm:text-base font-bold font-mono text-emerald-200">{savings.toLocaleString()}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">ادخار واستثمار فوري</div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-800/40 rounded-xl border border-neutral-700/60 text-xs text-neutral-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    الهدف المقترح لصندوق الطوارئ (3 أشهر): <strong className="text-emerald-300 font-mono font-bold">{(needs * 3).toLocaleString()} ريال</strong>
                  </span>
                </div>
              </div>
            )}

            {/* 4. SPEECH PRACTICE & TIMER SANDBOX */}
            {sandboxType === 'speech_timer' && (
              <div className="space-y-4 text-center">
                <p className="text-xs text-neutral-400 leading-relaxed">
                  تدرّب على نطق هذه العبارة بصوت عالٍ وواثق خلال 10 ثوانٍ:
                </p>

                {/* Teleprompter Card */}
                <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-100 shadow-inner">
                  <div className="text-xs text-indigo-400 font-semibold mb-2">العبارة المهنية للتدريب:</div>
                  <div className="text-base sm:text-lg font-bold text-white leading-relaxed dir-ltr text-center font-sans">
                    "That's a great question, let me verify the exact figures and get back to you by 3 PM."
                  </div>
                  <div className="text-xs text-neutral-400 mt-2 dir-rtl">
                    (سؤال ممتاز، دعني أتحقق من الأرقام الدقيقة وأعاود إفادتك بحلول الساعة 3 عصراً)
                  </div>
                </div>

                {/* Recorder / Timer Button */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      if (!isTimerRunning) {
                        setIsTimerRunning(true);
                        setSecondsElapsed(0);
                        sound.playPop();
                        const interval = setInterval(() => {
                          setSecondsElapsed(prev => {
                            if (prev >= 10) {
                              clearInterval(interval);
                              setIsTimerRunning(false);
                              sound.playSuccess();
                              return 10;
                            }
                            return prev + 1;
                          });
                        }, 1000);
                      } else {
                        setIsTimerRunning(false);
                      }
                    }}
                    className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-lg transition-all ${
                      isTimerRunning
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isTimerRunning ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>

                  <div className="mt-2 text-xs font-mono text-neutral-300">
                    {isTimerRunning ? `جاري التسجيل التدريبي: ${secondsElapsed} ث / 10 ث` : 'اضغط لبدء مؤقت المحاكاة'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex justify-end">
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
            >
              تم إتقان التمرين ومتابعة الفيديو 🚀
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
