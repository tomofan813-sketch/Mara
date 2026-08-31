import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, AtSign, LogIn, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmail, registerWithEmail, loginGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit迷 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    sound.playPop();

    try {
      if (mode === 'login') {
        if (!email || !password) {
          setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
          setIsLoading(false);
          return;
        }
        await loginWithEmail(email, password);
      } else {
        if (!email || !password || !name) {
          setError('يرجى ملء جميع الحقول المطلوبة');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('كلمة المرور يجب ألا تقل عن 6 أحرف');
          setIsLoading(false);
          return;
        }
        await registerWithEmail(email, password, name, handle || `@${name.toLowerCase().replace(/\s+/g, '_')}`);
      }
      sound.playLevelUp();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('بيانات الدخول غير صحيحة، يرجى التحقق وإعادة المحاولة.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد مسجل مسبقاً، يرجى تسجيل الدخول.');
      } else {
        setError(err.message || 'حدث خطأ أثناء عملية المصادقة.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickGuest = async () => {
    sound.playPop();
    setIsLoading(true);
    try {
      await loginGuest();
      sound.playSuccess();
      onClose();
    } catch (e) {
      setError('تعذر تسجيل الدخول كضيف حالياً.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="absolute top-4 left-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 pt-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 text-black font-black text-xl mb-3 shadow-lg shadow-emerald-950">
              م
            </div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? 'تسجيل الدخول إلى مهارة' : 'إنشاء حساب جديد في مهارة'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              شارك مهاراتك وتفاعل مع آلاف المتعلمين وصناع المحتوى
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Tabs */}
          <div className="flex bg-neutral-950/80 p-1 rounded-2xl mb-5 border border-neutral-800">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              تسجيل دخول
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              حساب جديد
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit迷} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: يوسف أحمد"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                    اسم المستخدم (Handle)
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="youssef_dev"
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500 font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>دخول إلى حسابي</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء الحساب والمتابعة</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Hint for Admin */}
          <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleQuickGuest}
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>متابعة كزائر سريع</span>
            </button>

            <span className="text-neutral-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Firebase Auth سحابي حقيقي</span>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
