import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Bell, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Sparkles, 
  Check, 
  Trash2 
} from 'lucide-react';
import { db, AppNotification } from '../services/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !isOpen) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      limit(40)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: AppNotification[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as AppNotification);
      });
      // sort client side by createdAt
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setNotifications(list);
      setIsLoading(false);
    });

    return () => unsub();
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const markAllAsRead = async () => {
    sound.playSuccess();
    for (const n of notifications) {
      if (!n.isRead) {
        await updateDoc(doc(db, 'notifications', n.id), { isRead: true });
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative w-full max-w-md h-[80vh] sm:h-[600px] bg-neutral-900 border-t sm:border border-neutral-800 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">مركز الإشعارات والتفاعل</h3>
                <p className="text-[10px] text-neutral-400">تحديثات الإعجابات والمتابعين والتعليقات</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {notifications.some(n => !n.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold px-2 py-1 bg-emerald-500/10 rounded-lg"
                >
                  تحديد الكل كمقروء
                </button>
              )}
              <button
                onClick={() => {
                  sound.playPop();
                  onClose();
                }}
                className="p-1.5 rounded-full bg-neutral-800 text-neutral-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 text-neutral-500 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>لا توجد إشعارات جديدة حالياً.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border flex items-start gap-3 transition-colors ${
                    n.isRead
                      ? 'bg-neutral-950/60 border-neutral-850 opacity-80'
                      : 'bg-neutral-950 border-indigo-500/40 shadow-sm'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={n.fromUserAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover bg-neutral-800"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-neutral-900 border border-neutral-800">
                      {n.type === 'like' && <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />}
                      {n.type === 'comment' && <MessageSquare className="w-2.5 h-2.5 text-emerald-400" />}
                      {n.type === 'follow' && <UserPlus className="w-2.5 h-2.5 text-indigo-400" />}
                      {n.type === 'badge' && <Sparkles className="w-2.5 h-2.5 text-amber-400" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
