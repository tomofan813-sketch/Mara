import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Circle, Copy, Check, Sparkles, Lightbulb, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import { SkillVideo, ActionStep } from '../types';
import { sound } from '../utils/audio';

interface ActionStepsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillVideo;
  onAskAiAboutStep?: (step: ActionStep) => void;
  onOpenSandbox?: () => void;
}

export const ActionStepsDrawer: React.FC<ActionStepsDrawerProps> = ({
  isOpen,
  onClose,
  skill,
  onAskAiAboutStep,
  onOpenSandbox,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [expandedStepId, setExpandedStepId] = useState<string | null>(skill.steps[0]?.id || null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const toggleStep = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop();
    setCompletedSteps(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyCode = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    sound.playPop();
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const copyAllSteps = () => {
    const fullText = `📌 دليل تطبيق مهارة: ${skill.title}\n\n` +
      skill.steps.map(s => `🔹 خطوة ${s.stepNumber}: ${s.title}\n${s.description}\n${s.tip ? `💡 نصيحة: ${s.tip}\n` : ''}${s.codeSnippet ? `💻 كود:\n${s.codeSnippet}\n` : ''}`).join('\n');
    
    navigator.clipboard.writeText(fullText);
    sound.playSuccess();
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const totalSteps = skill.steps.length;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / (totalSteps || 1)) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/20">
                ⚡
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-100 flex items-center gap-2">
                  خطوات التنفيذ العملية
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                    {totalSteps} خطوات
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 line-clamp-1">
                  {skill.title}
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

          {/* Progress bar */}
          <div className="px-4 py-2.5 bg-neutral-950/60 border-b border-neutral-800/80 flex items-center justify-between gap-3 text-xs">
            <span className="text-neutral-400 font-medium">
              نسبة الإنجاز العملي: <span className="text-emerald-400 font-bold">{completedCount}/{totalSteps}</span>
            </span>
            <div className="flex-1 max-w-[160px] h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-emerald-400 font-semibold">{progressPercent}%</span>
          </div>

          {/* Steps List */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1">
            {skill.steps.map((step) => {
              const isCompleted = !!completedSteps[step.id];
              const isExpanded = expandedStepId === step.id;

              return (
                <div
                  key={step.id}
                  onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                  className={`border rounded-xl transition-all cursor-pointer overflow-hidden ${
                    isCompleted
                      ? 'bg-emerald-950/15 border-emerald-500/30'
                      : isExpanded
                      ? 'bg-neutral-800/70 border-amber-500/40 shadow-md'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="p-3.5 flex items-start gap-3">
                    <button
                      onClick={(e) => toggleStep(step.id, e)}
                      className="mt-0.5 text-neutral-400 hover:text-emerald-400 transition-colors focus:outline-none flex-shrink-0"
                      title="تحديد كمنفذة"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950/50" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-500 hover:text-amber-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}>
                            خطوة {step.stepNumber}
                          </span>
                          <h4 className={`font-semibold text-sm ${isCompleted ? 'line-through text-neutral-400' : 'text-neutral-200'}`}>
                            {step.title}
                          </h4>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        )}
                      </div>

                      {/* Preview or Expanded Content */}
                      <p className={`text-xs mt-1.5 leading-relaxed ${isCompleted ? 'text-neutral-500' : 'text-neutral-300'}`}>
                        {step.description}
                      </p>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-2.5 pt-2 border-t border-neutral-800"
                        >
                          {step.tip && (
                            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-xs text-amber-200">
                              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                              <div className="leading-relaxed">{step.tip}</div>
                            </div>
                          )}

                          {step.codeSnippet && (
                            <div className="relative group rounded-lg overflow-hidden bg-black/60 border border-neutral-800">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950 text-[11px] text-neutral-400 font-mono border-b border-neutral-800">
                                <span>مثال كود تنفيذي</span>
                                <button
                                  onClick={(e) => copyCode(step.id, step.codeSnippet!, e)}
                                  className="flex items-center gap-1 text-neutral-400 hover:text-emerald-400 transition-colors"
                                >
                                  {copiedCodeId === step.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400 font-medium">تم النسخ</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>نسخ الكود</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-3 text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap dir-ltr text-left">
                                {step.codeSnippet}
                              </pre>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            {onAskAiAboutStep && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAskAiAboutStep(step);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                <span>اشرح لي هذه الخطوة أكثر بالـ AI</span>
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2">
            <button
              onClick={copyAllSteps}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">تم نسخ كامل الدليل!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ جميع الخطوات للنوت بوك</span>
                </>
              )}
            </button>

            {skill.sandboxType && skill.sandboxType !== 'none' && onOpenSandbox && (
              <button
                onClick={onOpenSandbox}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950 transition-all"
              >
                <span>🧪 فتح التطبيق العملي</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
