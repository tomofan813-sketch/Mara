import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Send, MessageSquare, ThumbsUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { SkillVideo, Comment } from '../types';
import { sound } from '../utils/audio';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skill: SkillVideo;
  onAddComment: (skillId: string, text: string) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  skill,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [likesMap, setLikesMap] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    sound.playPop();
    onAddComment(skill.id, commentText.trim());
    setCommentText('');
  };

  const toggleLike = (id: string) => {
    sound.playPop();
    setLikesMap(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/20">
                💬
              </div>
              <div>
                <h3 className="font-bold text-base text-neutral-100 flex items-center gap-2">
                  مجتمع النقاش وتبادل الخبرات
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium">
                    {skill.comments.length} تعليقات
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  اطرح استفساراتك وشارك تجارب تطبيق المهارة
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

          {/* Comments List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3.5 bg-neutral-950/40">
            {skill.comments.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs">
                كن أول من يشارك تجربة تطبيق هذه المهارة أو يطرح سؤالاً!
              </div>
            ) : (
              skill.comments.map((comment) => {
                const isLiked = !!likesMap[comment.id];
                const likeCount = comment.likes + (isLiked ? 1 : 0);

                return (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-xl bg-neutral-800/50 border border-neutral-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-neutral-200">
                              {comment.userName}
                            </span>
                            {comment.badge && (
                              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-medium">
                                {comment.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-500">{comment.timestamp}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleLike(comment.id)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                          isLiked
                            ? 'text-rose-400 bg-rose-500/10'
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                        <span>{likeCount}</span>
                      </button>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed pr-10">
                      {comment.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="اكتب تعليقك أو سؤالك حول تطبيق المهارة..."
              className="flex-1 bg-neutral-950 border border-neutral-700 focus:border-blue-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-neutral-100 placeholder-neutral-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
