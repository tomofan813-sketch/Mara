import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Bookmark, CheckCircle2, Flame, Sparkles, Download, Copy, Check, ChevronRight, Layers, FileText } from 'lucide-react';
import { SkillVideo, UserProgress } from '../types';
import { sound } from '../utils/audio';

interface SkillBagModalProps {
  isOpen: boolean;
  onClose: () => void;
  allSkills: SkillVideo[];
  userProgress: UserProgress;
  onSelectSkill: (skill: SkillVideo) => void;
}

export const SkillBagModal: React.FC<SkillBagModalProps> = ({
  isOpen,
  onClose,
  allSkills,
  userProgress,
  onSelectSkill,
}) => {
  const [activeTab, setActiveTab] = useState<'notebook' | 'badges' | 'passport'>('notebook');
  const [selectedNotebookSkill, setSelectedNotebookSkill] = useState<SkillVideo | null>(null);
  const [isCopiedSummary, setIsCopiedSummary] = useState(false);

  if (!isOpen) return null;

  const savedSkills = allSkills.filter(s => userProgress.savedSkillIds.includes(s.id));
  const completedSkills = allSkills.filter(s => userProgress.completedSkillIds.includes(s.id));

  const copyActionPlan = (skill: SkillVideo) => {
    const text = `📘 خطة المهارة المحفوظة: ${skill.title}\n\n` +
      skill.steps.map(s => `🔹 خطوة ${s.stepNumber}: ${s.title}\n${s.description}\n${s.tip ? `💡 نصيحة: ${s.tip}\n` : ''}`).join('\n');
    
    navigator.clipboard.writeText(text);
    sound.playSuccess();
    setIsCopiedSummary(true);
    setTimeout(() => setIsCopiedSummary(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Top Profile Banner */}
          <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-indigo-950/60 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-extrabold text-xl flex items-center justify-center shadow-lg shadow-emerald-950">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-neutral-100">
                    حقيبة مهاراتي ومساري التعليمي
                  </h3>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full">
                    المستوى {userProgress.level}: {userProgress.levelTitle}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Flame className="w-3.5 h-3.5 fill-amber-400" />
                    {userProgress.streakDays} أيام سلسلة
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-purple-400 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    {userProgress.xp} XP خبرة
                  </span>
                  <span>•</span>
                  <span>{completedSkills.length} مهارات مكتملة</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-800 bg-neutral-950 px-4 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('notebook');
                sound.playPop();
              }}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'notebook'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>دفتر الخطوات المحفوظة ({savedSkills.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('badges');
                sound.playPop();
              }}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'badges'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>أوسمة الإنجاز ({userProgress.badges.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('passport');
                sound.playPop();
              }}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'passport'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>جواز المهارات الموثق</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 overflow-y-auto flex-1">
            {/* 1. NOTEBOOK / SAVED ACTION SHEETS */}
            {activeTab === 'notebook' && (
              <div className="space-y-4">
                {savedSkills.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Bookmark className="w-10 h-10 text-neutral-600 mx-auto" />
                    <p className="text-neutral-400 text-xs sm:text-sm">
                      لم تحفظ أي بطاقة خطوات بعد! اضغط على زر 🔖 الحفظ في أي مقطع لتخزين خطة التنفيذ في هذا الدفتر.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedSkills.map((skill) => (
                      <div
                        key={skill.id}
                        onClick={() => setSelectedNotebookSkill(skill)}
                        className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:border-emerald-500/50 cursor-pointer transition-all space-y-2 group"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-medium">
                            {skill.categoryLabel}
                          </span>
                          <span className="text-neutral-400">{skill.steps.length} خطوات</span>
                        </div>
                        <h4 className="font-semibold text-xs sm:text-sm text-neutral-100 group-hover:text-emerald-300 transition-colors line-clamp-2">
                          {skill.title}
                        </h4>
                        <div className="flex items-center justify-between pt-2 border-t border-neutral-700/60 text-[11px] text-neutral-400">
                          <span>بواسطة {skill.creator.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-500 rtl:rotate-180" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Notebook Skill Detail Modal */}
                {selectedNotebookSkill && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-lg w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                            {selectedNotebookSkill.categoryLabel}
                          </span>
                          <h4 className="font-bold text-sm sm:text-base text-white mt-1">
                            {selectedNotebookSkill.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => setSelectedNotebookSkill(null)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {selectedNotebookSkill.steps.map((step) => (
                          <div key={step.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
                            <div className="font-bold text-emerald-400 mb-1">
                              خطوة {step.stepNumber}: {step.title}
                            </div>
                            <p className="text-neutral-300 leading-relaxed">{step.description}</p>
                            {step.tip && (
                              <div className="mt-1.5 text-[11px] text-amber-300 bg-amber-500/10 p-1.5 rounded">
                                💡 {step.tip}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-neutral-800">
                        <button
                          onClick={() => copyActionPlan(selectedNotebookSkill)}
                          className="flex-1 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5"
                        >
                          {isCopiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopiedSummary ? 'تم النسخ' : 'نسخ الخطة'}</span>
                        </button>
                        <button
                          onClick={() => {
                            onSelectSkill(selectedNotebookSkill);
                            setSelectedNotebookSkill(null);
                            onClose();
                          }}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white"
                        >
                          مشاهدة المقطع الآن
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. BADGES & ACHIEVEMENTS */}
            {activeTab === 'badges' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {userProgress.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700/80 text-center space-y-2 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="text-3xl mx-auto">{badge.icon}</div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-neutral-100">{badge.title}</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">{badge.description}</p>
                    </div>
                    <div className="text-[9px] text-emerald-400 font-mono pt-1">
                      حصلت عليه: {badge.earnedAt}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. DIGITAL SKILL PASSPORT */}
            {activeTab === 'passport' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950/40 border-2 border-emerald-500/30 space-y-5 text-neutral-100 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      وثيقة إتقان المهارات المعتمدة • MAHARA SKILL PASSPORT
                    </div>
                    <h3 className="text-lg font-extrabold text-white mt-1">
                      سجل المهارات العملية الموثق
                    </h3>
                  </div>
                  <div className="text-2xl">🎓</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">نقاط الخبرة XP</div>
                    <div className="text-base font-extrabold text-emerald-400 font-mono">{userProgress.xp}</div>
                  </div>
                  <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">المهارات المتقنة</div>
                    <div className="text-base font-extrabold text-purple-400 font-mono">{completedSkills.length}</div>
                  </div>
                  <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">أيام الاستمرار</div>
                    <div className="text-base font-extrabold text-amber-400 font-mono">{userProgress.streakDays}</div>
                  </div>
                  <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800">
                    <div className="text-[10px] text-neutral-400">الأوسمة المحققة</div>
                    <div className="text-base font-extrabold text-cyan-400 font-mono">{userProgress.badges.length}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-neutral-300">المهارات المنجزة المسجلة:</h5>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {completedSkills.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-xs p-2 bg-neutral-900/70 rounded-lg border border-neutral-800/80">
                        <span className="truncate max-w-[80%] text-neutral-200">{s.title}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-neutral-500 text-center border-t border-neutral-800 pt-3">
                  منصة مهارة للتعليم التفاعلي والميكروليرننج • تم التحقق بواسطة نظام التقييم الذكي
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
