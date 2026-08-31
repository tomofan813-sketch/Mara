import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, HelpCircle, Award, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SkillVideo, QuizQuestion } from '../types';
import { sound } from '../utils/audio';

interface QuizDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillVideo;
  onCompleteQuiz: (skillId: string, xpEarned: number) => void;
}

export const QuizDrawer: React.FC<QuizDrawerProps> = ({
  isOpen,
  onClose,
  skill,
  onCompleteQuiz,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(skill.quiz);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isLoadingAiQuiz, setIsLoadingAiQuiz] = useState(false);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    sound.playPop();
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctIndex;

    if (isCorrect) {
      sound.playSuccess();
      setScore(prev => prev + 1);
    } else {
      sound.playWrong();
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finished all questions
      setIsQuizCompleted(true);
      const isPerfect = (score + (selectedOption === currentQ.correctIndex ? 1 : 0)) === questions.length;
      const xp = isPerfect ? skill.xpReward : Math.round(skill.xpReward * 0.7);

      if (isPerfect) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        sound.playLevelUp();
      } else {
        sound.playSuccess();
      }

      onCompleteQuiz(skill.id, xp);
    }
  };

  const handleGenerateAiQuiz = async () => {
    try {
      setIsLoadingAiQuiz(true);
      sound.playPop();
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: skill.title,
          lessonSummary: skill.summary,
          steps: skill.steps,
        }),
      });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setScore(0);
        setIsQuizCompleted(false);
        sound.playSuccess();
      }
    } catch (e) {
      console.log('Generating fallback quiz in standalone mode:', e);
      // Smart dynamic quiz generated client-side
      const fallbackQuestions: QuizQuestion[] = [
        {
          id: `gen-q1-${Date.now()}`,
          question: `ما هو المعيار الأهم لنجاح تطبيق "${skill.title}"؟`,
          options: [
            'الالتزام بالتسلسل الزمني للخطوات العملية',
            'القفز مباشرة إلى المخرجات النهائية دون تهيئة',
            'تجاهل نصائح الأمان وتفادي الأخطاء',
            'التنفيذ دون الاستعانة بالنماذج الإرشادية'
          ],
          correctIndex: 0,
          explanation: 'اتباع التسلسل العملي المنظم يمنح المتعلم أعلى نسبة نجاح ويقلل احتمالية الوقوع في الأخطاء.'
        },
        {
          id: `gen-q2-${Date.now()}`,
          question: `عند مواجهة صعوبة في تنفيذ خطوة "${skill.steps[0]?.title || 'البدء'}"، ما الإجراء الصحيح؟`,
          options: [
            'مراجعة ملخص الخطوة والاستعانة بالأمثلة العملية',
            'إلغاء التمرين فوراً',
            'تغيير مسار العمل عشوائياً',
            'تخطي مرحلة التجهيز'
          ],
          correctIndex: 0,
          explanation: 'المراجعة المستمرة واستيعاب المبدأ التأسيسي لكل خطوة هو مفتاح إتقان المهارات الدقيقة.'
        }
      ];
      setQuestions(fallbackQuestions);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setScore(0);
      setIsQuizCompleted(false);
      sound.playSuccess();
    } finally {
      setIsLoadingAiQuiz(false);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/20">
                🎯
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-100 flex items-center gap-2">
                  اختبار تثبيت المهارة السريع
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium">
                    +{skill.xpReward} XP
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  فحص الفهم بعد مشاهدة المقطع العملي
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

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1">
            {!isQuizCompleted ? (
              <div className="space-y-4">
                {/* Progress Indicators */}
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                  <span>السؤال {currentIndex + 1} من {questions.length}</span>
                  <button
                    onClick={handleGenerateAiQuiz}
                    disabled={isLoadingAiQuiz}
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingAiQuiz ? 'animate-spin' : ''}`} />
                    <span>توليد أسئلة ذكية إضافية (AI)</span>
                  </button>
                </div>

                {/* Question Card */}
                <div className="p-4 rounded-xl bg-neutral-800/60 border border-neutral-700/60">
                  <h4 className="font-semibold text-sm sm:text-base text-neutral-100 leading-relaxed">
                    {currentQ.question}
                  </h4>
                </div>

                {/* Options */}
                <div className="space-y-2.5 pt-1">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQ.correctIndex;

                    let optionClass = 'bg-neutral-800/40 border-neutral-700/80 hover:bg-neutral-800 hover:border-neutral-600 text-neutral-200';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        optionClass = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 font-medium';
                      } else if (isSelected && !isCorrect) {
                        optionClass = 'bg-rose-950/40 border-rose-500 text-rose-200';
                      } else {
                        optionClass = 'bg-neutral-900/40 border-neutral-800 text-neutral-500';
                      }
                    } else if (isSelected) {
                      optionClass = 'bg-purple-950/30 border-purple-500 text-purple-200 shadow-sm';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full text-right p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 ${optionClass}`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-purple-500 text-white'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{option}</span>

                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation on Answer */}
                {isAnswerSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3.5 rounded-xl text-xs leading-relaxed border ${
                      selectedOption === currentQ.correctIndex
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                    }`}
                  >
                    <div className="font-semibold mb-1 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" />
                      <span>الشرح التوضيحي:</span>
                    </div>
                    {currentQ.explanation}
                  </motion.div>
                )}
              </div>
            ) : (
              /* Completion Results View */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 mx-auto flex items-center justify-center shadow-lg shadow-purple-950">
                  <Award className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h4 className="font-bold text-lg text-neutral-100">
                    أحسنت! أتممت اختبار المهارة
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    نتيجتك: <span className="font-bold text-purple-400">{score} من {questions.length}</span> إجابات صحيحة
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-semibold">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>ربحت +{skill.xpReward} XP إلى رصيدك!</span>
                </div>

                <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                  تم توثيق إنجاز هذه المهارة في حقيبتك التعليمية لتتمكن من مراجعة الخطوات في أي وقت.
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center gap-3">
            {!isQuizCompleted ? (
              !isAnswerSubmitted ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={selectedOption === null}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
                >
                  تأكيد الإجابة
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{currentIndex < questions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار وحصد النقاط'}</span>
                </button>
              )
            ) : (
              <div className="w-full flex gap-2">
                <button
                  onClick={restartQuiz}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                >
                  إعادة الاختبار
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
                >
                  متابعة التعلّم
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
