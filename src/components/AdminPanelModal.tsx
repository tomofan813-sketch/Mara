import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Shield, 
  Users, 
  Video, 
  AlertTriangle, 
  Trash2, 
  Ban, 
  CheckCircle, 
  BarChart3, 
  Search,
  Eye,
  Flag
} from 'lucide-react';
import { db, UserProfile, VideoDoc, ReportDoc } from '../services/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { deleteVideo, setAdminUserStatus } from '../services/dbOperations';
import { sound } from '../utils/audio';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'videos' | 'users' | 'reports'>('stats');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [videos, setVideos] = useState<VideoDoc[]>([]);
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch users
      const usersSnap迷 = await getDocs(query(collection(db, 'users'), limit(50)));
      const uList: UserProfile[] = [];
      usersSnap迷.forEach((d) => uList.push(d.data() as UserProfile));
      setUsers(uList);

      // Fetch videos
      const videosSnap = await getDocs(query(collection(db, 'videos'), limit(50)));
      const vList: VideoDoc[] = [];
      videosSnap.forEach((d) => vList.push(d.data() as VideoDoc));
      setVideos(vList);

      // Fetch reports
      const reportsSnap = await getDocs(query(collection(db, 'reports'), limit(50)));
      const rList: ReportDoc[] = [];
      reportsSnap.forEach((d) => rList.push({ id: d.id, ...d.data() } as ReportDoc));
      setReports(rList);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفيديو كمسؤول؟')) {
      sound.playPop();
      await deleteVideo(videoId);
      setVideos(prev => prev.filter(v => v.id !== videoId));
    }
  };

  const handleToggleBanUser = async (uid: string, currentBanned?: boolean) => {
    sound.playPop();
    const newStatus = !currentBanned;
    await setAdminUserStatus(uid, newStatus);
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: newStatus } : u));
  };

  const handleDismissReport = async (reportId: string) => {
    sound.playPop();
    await deleteDoc(doc(db, 'reports', reportId));
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Admin Header */}
          <div className="p-4 sm:p-5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>لوحة الإدارة والحوكمة</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                    Super Admin
                  </span>
                </h2>
                <p className="text-xs text-neutral-400">إدارة المستخدمين، مراقبة المحتوى، وفحص البلاغات</p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playPop();
                onClose();
              }}
              className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Tabs */}
          <div className="flex border-b border-neutral-800 bg-neutral-950/40 flex-shrink-0 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('stats');
              }}
              className={`flex-1 min-w-[100px] py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'stats'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>الإحصائيات العامة</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('videos');
              }}
              className={`flex-1 min-w-[100px] py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'videos'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>إدارة الفيديوهات ({videos.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('users');
              }}
              className={`flex-1 min-w-[100px] py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'users'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>المستخدمين ({users.length})</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                setActiveTab('reports');
              }}
              className={`flex-1 min-w-[100px] py-3 flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'reports'
                  ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>البلاغات النشطة ({reports.length})</span>
            </button>
          </div>

          {/* Admin Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                        <span className="text-xs text-neutral-400 font-semibold">إجمالي الفيديوهات</span>
                        <h3 className="text-2xl font-black text-white mt-1">{videos.length}</h3>
                      </div>
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                        <span className="text-xs text-neutral-400 font-semibold">المستخدمين المسجلين</span>
                        <h3 className="text-2xl font-black text-emerald-400 mt-1">{users.length}</h3>
                      </div>
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                        <span className="text-xs text-neutral-400 font-semibold">إجمالي المشاهدات</span>
                        <h3 className="text-2xl font-black text-indigo-400 mt-1">
                          {videos.reduce((acc, v) => acc + (v.viewsCount || 0), 0)}
                        </h3>
                      </div>
                      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                        <span className="text-xs text-neutral-400 font-semibold">البلاغات المعلقة</span>
                        <h3 className="text-2xl font-black text-rose-400 mt-1">{reports.length}</h3>
                      </div>
                    </div>

                    {/* Quick System Info */}
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white mb-0.5">قاعدة بيانات Firebase السحابية متصلة</h4>
                        <p>تتم مزامنة المحتوى والتفاعل فورياً وبشكل حي بين جميع أجهزة وهواتف المستخدمين.</p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    </div>
                  </div>
                )}

                {activeTab === 'videos' && (
                  <div className="space-y-3">
                    <div className="relative mb-3">
                      <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ابحث بالعنوان أو اسم الصانع..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      {videos
                        .filter(v => !searchFilter || v.title.toLowerCase().includes(searchFilter.toLowerCase()) || v.creatorName.toLowerCase().includes(searchFilter.toLowerCase()))
                        .map((v) => (
                          <div
                            key={v.id}
                            className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={v.posterUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80'}
                                alt=""
                                className="w-12 h-16 rounded-lg object-cover flex-shrink-0 bg-neutral-800"
                              />
                              <div className="min-w-0">
                                <h4 className="font-bold text-white truncate">{v.title}</h4>
                                <p className="text-[11px] text-neutral-400 mt-0.5">بواسطة: {v.creatorName} ({v.creatorHandle})</p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-500">
                                  <span>{v.viewsCount || 0} مشاهدة</span>
                                  <span>•</span>
                                  <span>{v.likesCount || 0} إعجاب</span>
                                  <span>•</span>
                                  <span className="text-emerald-400">{v.categoryLabel}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteVideo(v.id)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors flex-shrink-0"
                              title="حذف الفيديو المخالف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="space-y-2 text-xs">
                    {users.map((u) => (
                      <div
                        key={u.uid}
                        className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover bg-neutral-800"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.isBanned && (
                                <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded font-bold">
                                  محظور
                                </span>
                              )}
                              {u.role === 'admin' && (
                                <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.2 rounded font-bold">
                                  Admin
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] font-mono text-neutral-400">{u.handle}</p>
                          </div>
                        </div>

                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBanUser(u.uid, u.isBanned)}
                            className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                              u.isBanned
                                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                                : 'bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white'
                            }`}
                          >
                            {u.isBanned ? 'إلغاء الحظر' : 'حظر الحساب'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-2 text-xs">
                    {reports.length === 0 ? (
                      <div className="text-center py-12 text-neutral-500">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                        <p>لا توجد أي بلاغات معلقة حالياً، المحتوى نظيف وآمن.</p>
                      </div>
                    ) : (
                      reports.map((r) => (
                        <div
                          key={r.id}
                          className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-1">
                              <AlertTriangle className="w-4 h-4" />
                              <span>بلاغ عن: "{r.videoTitle}"</span>
                            </div>
                            <p className="text-neutral-300 text-xs">السبب: {r.reason}</p>
                            <p className="text-[11px] text-neutral-500 mt-1">المُبلّغ: {r.reportedByName}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleDeleteVideo(r.videoId)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold"
                            >
                              حذف الفيديو
                            </button>
                            <button
                              onClick={() => handleDismissReport(r.id)}
                              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-bold"
                            >
                              تجاهل
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
