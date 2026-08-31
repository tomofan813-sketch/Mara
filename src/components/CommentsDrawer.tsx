import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Send, MessageSquare, Trash2, Reply } from 'lucide-react';
import { VideoDoc, CommentDoc } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { addVideoComment, videosCol } from '../services/dbOperations';
import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  increment, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { sound } from '../utils/audio';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skill: { id: string; title: string; userId?: string; creator?: { name?: string } };
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  skill,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !skill?.id) return;

    const subCol = collection(db, 'videos', skill.id, 'comments');
    const unsub = onSnapshot(subCol, (snap) => {
      const list: CommentDoc[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as CommentDoc);
      });
      // Sort newest first
      list.sort((a, b) => {
        const tA = a.createdAt?.seconds || 0;
        const tB = b.createdAt?.seconds || 0;
        return tB - tA;
      });
      setComments(list);
      setIsLoading(false);
    });

    return () => unsub();
  }, [isOpen, skill?.id]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser || !userProfile) return;

    sound.playPop();
    const textToSend = commentText.trim();
    setCommentText('');

    try {
      await addVideoComment(
        skill.id,
        {
          uid: currentUser.uid,
          name: userProfile.name || 'مستخدم مهارة',
          avatar: userProfile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          badge: userProfile.title || 'متعلم نشط',
        },
        textToSend,
        skill.userId
      );
      sound.playSuccess();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const toggleCommentLike = async (comment: CommentDoc) => {
    if (!currentUser) return;
    sound.playPop();
    const ref = doc(db, 'videos', skill.id, 'comments', comment.id);
    const hasLiked = comment.likedBy?.includes(currentUser.uid);

    if (hasLiked) {
      await updateDoc(ref, {
        likedBy: arrayRemove(currentUser.uid),
        likesCount: increment(-1),
      });
    } else {
      await updateDoc(ref, {
        likedBy: arrayUnion(currentUser.uid),
        likesCount: increment(1),
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('هل تريد حذف هذا التعليق؟')) {
      sound.playPop();
      await deleteDoc(doc(db, 'videos', skill.id, 'comments', commentId));
      await updateDoc(doc(db, 'videos', skill.id), {
        commentsCount: increment(-1),
      });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/20">
                💬
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-neutral-100 flex items-center gap-2">
                  مجتمع النقاش وتبادل الخبرات
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium">
                    {comments.length}
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  اطرح استفساراتك وشارك تجارب تطبيق المهارة
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Comments List */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-neutral-950/40 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-xs">
                كن أول من يشارك تجربة تطبيق هذه المهارة أو يطرح سؤالاً!
              </div>
            ) : (
              comments.map((comment) => {
                const isLiked = currentUser ? comment.likedBy?.includes(currentUser.uid) : false;
                const isOwner = currentUser?.uid === comment.userId || userProfile?.role === 'admin';

                return (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800/90 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={comment.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-700 bg-neutral-800"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-neutral-200">
                              {comment.userName}
                            </span>
                            {comment.userBadge && (
                              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.2 rounded font-medium">
                                {comment.userBadge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-500">الآن في مهارة</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleCommentLike(comment)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                            isLiked
                              ? 'text-rose-400 bg-rose-500/10'
                              : 'text-neutral-400 hover:text-neutral-200'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span>{comment.likesCount || 0}</span>
                        </button>

                        {isOwner && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                            title="حذف التعليق"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
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
