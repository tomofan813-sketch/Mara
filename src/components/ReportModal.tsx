import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flag, AlertTriangle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reportVideo } from '../services/dbOperations';
import { sound } from '../utils/audio';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: { id: string; title: string } | null;
  onSuccess: (msg: string) => void;
}

const REPORT_REASONS = [
  'محتوى مضلل أو غير دقيق',
  'محتوى مسيء أو غير لائق',
  'انتهاك حقوق الملكية الفكرية',
  'معلومات خطيرة أو ضارة أثناء التطبيق',
  'محتوى عشوائي أو سبام',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  video,
  onSuccess,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !video) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSubmitting(true);
    sound.playPop();

    try {
      const fullReason = customNotes.trim()
        ? `${selectedReason}: ${customNotes.trim()}`
        : selectedReason;

      await reportVideo(
        video.id,
        video.title,
        {
          uid: currentUser.uid,
          name: userProfile?.name || 'مستخدم مهارة',
        },
        fullReason
      );

      sound.playSuccess();
      onSuccess('تم إرسال البلاغ إلى فريق الإشراف للمراجعة.');
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl text-xs text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Flag className="w-4 h-4" />
              <span>إبلاغ عن فيديو مخالف</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-neutral-400 mb-3 leading-relaxed">
            اختر سبب البلاغ بخصوص فيديو: <span className="text-neutral-200 font-bold">"{video.title}"</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    selectedReason === r
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="accent-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="text-[11px] text-neutral-400 mb-1 block">
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="وضح التفاصيل لمساعدة فريق الإشراف..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-white placeholder-neutral-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 rtl:rotate-180" />
                  <span>إرسال البلاغ</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
