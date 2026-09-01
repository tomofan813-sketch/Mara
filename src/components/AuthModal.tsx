import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  AtSign, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  ExternalLink,
  Chrome
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const mapAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/operation-not-allowed':
        setIsOperationNotAllowed(true);
        return 'تسجيل الدخول بالبريد الإلكتروني (Email/Password) غير مفعّل بعد في إعدادات Firebase Console لهذا المشروع. يرجى تفعيله من لوحة تحكم Firebase.';
      case 'auth/email-already-in-use':
        return 'هذا البريد الإلكتروني مسجل مسبقاً. يرجى التبديل إلى "تسجيل الدخول".';
      case 'auth/invalid-email':
        return 'عنوان البريد الإلكتروني غير صالح. يرجى كتابة بريد إلكتروني صحيح.';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة. يجب أن تتكون من 6 خانات على الأقل.';
      case 'auth/user-not-found':
        return 'لم يتم العثور على أي حساب مسجل بهذا البريد الإلكتروني.';
      case 'auth/wrong-password':
        return 'كلمة المرور غير صحيحة. يرجى التأكد وإعادة المحاولة.';
      case 'auth/invalid-credential':
        return 'بيانات الدخول غير صحيحة. يرجى التحقق من البريد وكلمة المرور.';
      case 'auth/user-disabled':
        return 'تم إيقاف هذا الحساب من قبل إدارة المنصة.';
      case 'auth/too-many-requests':
        return 'تم حظر المحاولات مؤقتاً بسبب كثرة الطلبات. يرجى الانتظار دقيقة ثم المحاولة مجدداً.';
      case 'auth/network-request-failed':
        return 'تعذر الاتصال بخوادم Firebase. يرجى التأكد من اتصالك بالإنترنت.';
      case 'auth/popup-closed-by-user':
        return 'تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية.';
      default:
        return err?.message || 'حدث خطأ أثناء الاتصال بنظام المصادقة. يرجى المحاولة لاحقاً.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsOperationNotAllowed(false);
    setIsLoading(true);
    sound.playPop();

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
          setIsLoading(false);
          return;
        }
        await loginWithEmail(email, password);
      } else {
        if (!email.trim() || !password || !name.trim()) {
          setError('يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، كلمة المرور)');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('كلمة المرور يجب ألا تقل عن 6 خانات');
          setIsLoading(false);
          return;
        }
        await registerWithEmail(
          email, 
          password, 
          name, 
          handle || `@${name.toLowerCase().replace(/\s+/g, '_')}`
        );
      }
      sound.playLevelUp();
      onClose();
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      const friendlyMsg夺 = mapAuthError(err);
      setError(friendlyMsg夺);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    sound.playPop();
    setError(null);
    setIsOperationNotAllowed(false);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      sound.playSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickGuest = async () => {
    sound.playPop();
    setError(null);
    setIsOperationNotAllowed(false);
    setIsLoading(true);
    try {
      await loginGuest();
      sound.playSuccess();
      onClose();
    } catch (err: any) {
      console.error('Guest login error:', err);
      setError(mapAuthError(err));
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
          className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
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
          <div className="text-center mb-5 pt-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 text-black font-black text-xl mb-2.5 shadow-lg shadow-emerald-950">
              م
            </div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? 'تسجيل الدخول إلى مهارة' : 'إنشاء حساب جديد في مهارة'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              شارك مهاراتك وتفاعل مع مجتمع المتعلمين وصناع المحتوى
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs font-medium space-y-2"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>

              {/* Instructions if operation not allowed */}
              {isOperationNotAllowed && (
                <div className="p-3 bg-neutral-950/80 rounded-xl border border-rose-500/20 text-neutral-300 text-[11px] space-y-1.5 mt-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1">
                    <span>💡 خطوات تفعيل البريد وكلمة المرور في Firebase:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-300 pr-1 leading-normal">
                    <li>افتح <strong>Firebase Console</strong> لمشروعك.</li>
                    <li>من القائمة الجانبية اختر <strong>Authentication</strong>.</li>
                    <li>انقر على تبويب <strong>Sign-in method</strong>.</li>
                    <li>اختر <strong>Email/Password</strong> وقم بتفعيل خيار <strong>Enable</strong> ثم احفظ التغييرات (Save).</li>
                  </ol>
                </div>
              )}
            </motion.div>
          )}

          {/* Google Sign In Direct Option */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full mb-3.5 py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-neutral-200"
          >
            <Chrome className="w-4 h-4 text-indigo-600" />
            <span>المتابعة باستخدام حساب Google</span>
          </button>

          <div className="relative flex items-center justify-center my-3.5">
            <div className="border-t border-neutral-800 w-full" />
            <span className="bg-neutral-900 px-3 text-[11px] text-neutral-500 whitespace-nowrap">أو عبر البريد الإلكتروني</span>
            <div className="border-t border-neutral-800 w-full" />
          </div>

          {/* Tabs */}
          <div className="flex bg-neutral-950/80 p-1 rounded-2xl mb-4 border border-neutral-800">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setMode('login');
                setError(null);
                setIsOperationNotAllowed(false);
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
                setIsOperationNotAllowed(false);
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
          <form onSubmit={handleSubmit} className="space-y-3">
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
              className="w-full mt-3 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

          {/* Quick Demo Login Hint & Status */}
          <div className="mt-4 pt-3.5 border-t border-neutral-800 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleQuickGuest}
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>متابعة كزائر</span>
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
