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
  ShieldCheck, 
  AlertTriangle,
  Server
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmail, registerWithEmail } = useAuth();
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
        return 'طريقة تسجيل الدخول بالبريد الإلكتروني وكلمة المرور (Email/Password) غير مفعّلة في إعدادات مشروع Firebase. يرجى تفعيلها من Firebase Console.';
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
        return 'تم حظر المحاولات مؤقتاً لكثرة الطلبات. يرجى الانتظار قليلاً ثم المحاولة.';
      case 'auth/network-request-failed':
        return 'تعذر الاتصال بخوادم Firebase. يرجى التأكد من اتصالك بالإنترنت.';
      default:
        return 'حدث خطأ في المصادقة. يرجى التأكد من البيانات والمحاولة مجدداً.';
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
      const friendlyMsg = mapAuthError(err);
      setError(friendlyMsg);
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
              عبر البريد الإلكتروني وكلمة المرور (Firebase Email/Password)
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
                <div className="p-3 bg-neutral-950/90 rounded-xl border border-rose-500/30 text-neutral-300 text-[11px] space-y-2 mt-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1">
                    <span>خطوات تفعيل Email/Password في Firebase Console:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-neutral-300 pr-1 leading-relaxed">
                    <li>
                      الصفحة: افتح <strong>Firebase Console</strong> لمشروعك: <span className="font-mono text-emerald-400 select-all">{firebaseConfig.projectId}</span>
                    </li>
                    <li>
                      المسار: من القائمة الجانبية اختر <strong>Authentication</strong> ثم اضغط على تبويب <strong>Sign-in method</strong>.
                    </li>
                    <li>
                      الموفر: انقر على <strong>Email/Password</strong> من قائمة الموفرين (Sign-in providers).
                    </li>
                    <li>
                      الإجراء: قم بتفعيل مفتاح <strong>Enable</strong> ثم اضغط زر <strong>Save (حفظ)</strong>.
                    </li>
                  </ol>
                </div>
              )}
            </motion.div>
          )}

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

          {/* Project & Connection Info Footer */}
          <div className="mt-4 pt-3.5 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3 text-neutral-400" />
              <span>المشروع: <strong className="font-mono text-neutral-300">{firebaseConfig.projectId}</strong></span>
            </span>

            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Firebase Auth سحابي</span>
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
