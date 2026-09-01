import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  AtSign, 
  LogIn, 
  UserPlus, 
  Phone, 
  ShieldCheck, 
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';
import { auth } from '../services/firebase';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Common Arab and International country dial codes
const COUNTRY_CODES = [
  { code: '+966', country: 'السعودية', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: '+971', country: 'الإمارات', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: '+20', country: 'مصر', flag: '🇪🇬', placeholder: '10 1234 5678' },
  { code: '+965', country: 'الكويت', flag: '🇰🇼', placeholder: '9123 4567' },
  { code: '+974', country: 'قطر', flag: '🇶🇦', placeholder: '3312 3456' },
  { code: '+968', country: 'عُمان', flag: '🇴🇲', placeholder: '9123 4567' },
  { code: '+973', country: 'البحرين', flag: '🇧🇭', placeholder: '3912 3456' },
  { code: '+962', country: 'الأردن', flag: '🇯🇴', placeholder: '7 9123 4567' },
  { code: '+964', country: 'العراق', flag: '🇮🇶', placeholder: '780 123 4567' },
  { code: '+970', country: 'فلسطين', flag: '🇵🇸', placeholder: '59 123 4567' },
  { code: '+961', country: 'لبنان', flag: '🇱🇧', placeholder: '70 123 456' },
  { code: '+212', country: 'المغرب', flag: '🇲🇦', placeholder: '6 12 34 56 78' },
  { code: '+213', country: 'الجزائر', flag: '🇩🇿', placeholder: '5 12 34 56 78' },
  { code: '+216', country: 'تونس', flag: '🇹🇳', placeholder: '20 123 456' },
  { code: '+249', country: 'السودان', flag: '🇸🇩', placeholder: '91 234 5678' },
  { code: '+967', country: 'اليمن', flag: '🇾🇪', placeholder: '77 123 4567' },
  { code: '+90', country: 'تركيا', flag: '🇹🇷', placeholder: '532 123 4567' },
  { code: '+1', country: 'أمريكا / كندا', flag: '🇺🇸', placeholder: '555 123 4567' },
  { code: '+44', country: 'بريطانيا', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: '+49', country: 'ألمانيا', flag: '🇩🇪', placeholder: '151 12345678' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    loginWithEmail, 
    registerWithEmail, 
    sendPasswordReset, 
    sendPhoneOtp, 
    confirmPhoneOtp, 
    loginWithGoogle 
  } = useAuth();

  // Mode: Sign In vs Sign Up
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  // Method: 'phone' | 'email'
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  // Sub-view for password reset
  const [isForgotPassView, setIsForgotPassView] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Phone Auth State
  const [countryCode, setCountryCode] = useState('+966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [phoneStep, setPhoneStep] = useState<'input' | 'otp'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // User Profile Fields (for Sign Up)
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');

  // Status & Error handling
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Reset errors when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setPhoneStep('input');
      setOtpCode('');
    }
  }, [isOpen]);

  // Timer for OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phoneStep === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [phoneStep, countdown]);

  // Clean up reCAPTCHA verifier on modal close or unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const mapAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-phone-number':
        return 'رقم الهاتف غير صحيح، يرجى التأكد من الرقم والمحاولة مجدداً.';
      case 'auth/missing-phone-number':
        return 'يرجى إدخال رقم الهاتف.';
      case 'auth/quota-exceeded':
        return 'تم تجاوز حد الرسائل مؤقتاً، يرجى المحاولة لاحقاً أو تسجيل الدخول بالبريد.';
      case 'auth/invalid-verification-code':
        return 'رمز التحقق غير صحيح، يرجى التأكد والمحاولة مجدداً.';
      case 'auth/code-expired':
        return 'انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد.';
      case 'auth/email-already-in-use':
        return 'البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة.';
      case 'auth/invalid-email':
        return 'عنوان البريد الإلكتروني غير صحيح.';
      case 'auth/weak-password':
        return 'كلمة المرور يجب أن تكون من 6 خانات على الأقل.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'بيانات الدخول غير صحيحة، يرجى التحقق وإعادة المحاولة.';
      case 'auth/user-disabled':
        return 'هذا الحساب معطل حالياً.';
      case 'auth/too-many-requests':
        return 'محاولات كثيرة، يرجى الانتظار قليلاً ثم المحاولة.';
      case 'auth/popup-closed-by-user':
        return 'تم إلغاء تسجيل الدخول.';
      case 'auth/network-request-failed':
        return 'تعذر الاتصال، يرجى التحقق من اتصال الإنترنت.';
      default:
        return 'تعذر تسجيل الدخول، يرجى المحاولة مرة أخرى.';
    }
  };

  // Initialize reCAPTCHA verifier for Phone Auth
  const getRecaptchaVerifier = (): RecaptchaVerifier => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError('تعذر التحقق، يرجى إعادة المحاولة.');
        },
      });
    }
    return recaptchaVerifierRef.current;
  };

  // 1. Phone Auth: Send SMS OTP
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 7) {
      setError('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    if (authMode === 'register' && !name.trim()) {
      setError('يرجى إدخال اسمك الكريم لإكمال إنشاء الحساب');
      return;
    }

    // Format to E.164 standard: e.g. +966501234567
    const fullPhone = `${countryCode}${cleanNum.startsWith('0') ? cleanNum.slice(1) : cleanNum}`;

    setIsLoading(true);
    sound.playPop();

    try {
      const verifier = getRecaptchaVerifier();
      const confirmation = await sendPhoneOtp(fullPhone, verifier);
      setConfirmationResult(confirmation);
      setPhoneStep('otp');
      setCountdown(60);
      setCanResend(false);
      sound.playSuccess();
    } catch (err: any) {
      console.error('Phone send OTP error:', err);
      // Reset reCAPTCHA if failed
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Phone Auth: Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setError('يرجى طلب رمز تحقق جديد.');
      return;
    }

    if (!otpCode || otpCode.trim().length < 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setError(null);
    setIsLoading(true);
    sound.playPop();

    try {
      await confirmPhoneOtp(
        confirmationResult, 
        otpCode.trim(), 
        name.trim() || undefined,
        handle.trim() || undefined
      );
      sound.playLevelUp();
      onClose();
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Email Auth: Sign In or Register
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    sound.playPop();

    try {
      if (authMode === 'login') {
        if (!email.trim() || !password) {
          setError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
          setIsLoading(false);
          return;
        }
        await loginWithEmail(email, password);
      } else {
        if (!email.trim() || !password || !name.trim()) {
          setError('يرجى ملء جميع الحقول المطلوبة');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('كلمة المرور يجب أن تتكون من 6 خانات على الأقل');
          setIsLoading(false);
          return;
        }
        const userHandle = handle.trim() 
          ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`)
          : `@${name.trim().toLowerCase().replace(/\s+/g, '_')}`;

        await registerWithEmail(email, password, name.trim(), userHandle);
      }
      sound.playLevelUp();
      onClose();
    } catch (err: any) {
      console.error('Email auth error:', err);
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Email Auth: Password Reset Link
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('يرجى إدخال بريدك الإلكتروني لإرسال رابط إعادة التعيين');
      return;
    }
    setError(null);
    setIsLoading(true);
    sound.playPop();

    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
      sound.playSuccess();
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Google Sign-In
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    sound.playPop();

    try {
      await loginWithGoogle();
      sound.playLevelUp();
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(mapAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto no-scrollbar"
        >
          {/* Container for invisible reCAPTCHA */}
          <div id="recaptcha-container" />

          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              sound.playPop();
              setError(null);
              onClose();
            }}
            className="absolute top-4 left-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Branding */}
          <div className="text-center mb-4 pt-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 text-black font-black text-xl mb-2 shadow-lg shadow-emerald-950/40">
              م
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {isForgotPassView 
                ? 'استعادة كلمة المرور' 
                : authMode === 'login' 
                  ? 'تسجيل الدخول إلى مهارة' 
                  : 'إنشاء حساب جديد في مهارة'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              {isForgotPassView 
                ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور'
                : authMode === 'login' 
                  ? 'اختر الطريقة المناسبة للوصول إلى حسابك ومتابعة تقدمك' 
                  : 'انضم لمجتمع مهارة وشارك وتعلّم المهارات العملية'}
            </p>
          </div>

          {/* Clean User-Facing Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 py-2.5 px-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="flex-1 leading-snug">{error}</span>
            </motion.div>
          )}

          {/* Forgot Password Flow */}
          {isForgotPassView ? (
            <div className="space-y-4">
              {resetSent ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-sm text-emerald-300">تم إرسال رابط الاستعادة بنجاح</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    تحقق من صندوق الوارد في بريدك الإلكتروني <strong className="text-white font-mono">{email}</strong> واتبع الرابط لتعيين كلمة مرور جديدة.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassView(false);
                      setResetSent(false);
                      setAuthMode('login');
                    }}
                    className="mt-3 w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    العودة لتسجيل الدخول
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                      البريد الإلكتروني المسجل
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl pr-9 pl-3 py-2.5 text-xs text-white placeholder-neutral-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>إرسال رابط إعادة التعيين</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassView(false);
                      setError(null);
                    }}
                    className="w-full py-2 text-neutral-400 hover:text-white text-xs transition-colors"
                  >
                    إلغاء والعودة
                  </button>
                </form>
              )}
            </div>
          ) : (
            <>
              {/* Top Mode Switcher: Sign In vs Sign Up */}
              <div className="flex bg-neutral-950 p-1 rounded-2xl mb-4 border border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setAuthMode('login');
                    setError(null);
                    setPhoneStep('input');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    authMode === 'login'
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setAuthMode('register');
                    setError(null);
                    setPhoneStep('input');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    authMode === 'register'
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  حساب جديد
                </button>
              </div>

              {/* Method Selector Tabs (Phone vs Email) */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setMethod('phone');
                    setError(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    method === 'phone'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>رقم الهاتف</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setMethod('email');
                    setError(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    method === 'email'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>البريد الإلكتروني</span>
                </button>
              </div>

              {/* METHOD 1: PHONE AUTHENTICATION */}
              {method === 'phone' && (
                <div className="space-y-3">
                  {phoneStep === 'input' ? (
                    <form onSubmit={handleSendPhoneOtp} className="space-y-3">
                      {/* Name & Handle (only in Sign Up mode) */}
                      {authMode === 'register' && (
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
                                placeholder="مثال: يوسف المنصور"
                                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                              اسم المستخدم (اختياري)
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

                      {/* Country Code & Phone Input */}
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                          رقم الهاتف المحمول
                        </label>
                        <div className="flex gap-2">
                          {/* Country Selector Dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                              className="h-[38px] px-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl flex items-center gap-1.5 text-xs text-white"
                            >
                              <span className="text-base">{currentCountry.flag}</span>
                              <span className="font-mono text-[11px] text-neutral-300" dir="ltr">{currentCountry.code}</span>
                              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                            </button>

                            {/* Dropdown Menu */}
                            {isCountryDropdownOpen && (
                              <div className="absolute z-50 top-full mt-1 right-0 w-60 max-h-52 overflow-y-auto bg-neutral-950 border border-neutral-800 rounded-xl shadow-xl py-1 no-scrollbar">
                                {COUNTRY_CODES.map((c) => (
                                  <button
                                    key={c.code + c.country}
                                    type="button"
                                    onClick={() => {
                                      setCountryCode(c.code);
                                      setIsCountryDropdownOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 text-right flex items-center justify-between text-xs hover:bg-neutral-800/70 transition-colors ${
                                      countryCode === c.code ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-neutral-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">{c.flag}</span>
                                      <span>{c.country}</span>
                                    </div>
                                    <span className="font-mono text-[11px] text-neutral-400" dir="ltr">{c.code}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Phone number input */}
                          <div className="relative flex-1">
                            <input
                              type="tel"
                              required
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder={currentCountry.placeholder}
                              className="w-full h-[38px] bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 text-xs text-white placeholder-neutral-500 font-mono text-left"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Phone className="w-4 h-4" />
                            <span>إرسال رمز التحقق (SMS)</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Step 2: OTP Verification */
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div className="p-3 bg-neutral-950 rounded-2xl border border-neutral-800 text-center space-y-1">
                        <span className="text-[11px] text-neutral-400 block">تم إرسال رمز التحقق إلى:</span>
                        <div className="font-mono text-xs font-bold text-emerald-400" dir="ltr">
                          {countryCode} {phoneNumber}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneStep('input');
                            setError(null);
                          }}
                          className="text-[11px] text-neutral-400 hover:text-white underline mt-1 inline-block"
                        >
                          تغيير الرقم
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-300 mb-1 text-center">
                          أدخل رمز التحقق (6 أرقام)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="------"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:outline-none rounded-xl py-2.5 text-center text-lg font-mono tracking-widest text-white placeholder-neutral-600"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || otpCode.length < 6}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تأكيد الرمز وتسجيل الدخول</span>
                          </>
                        )}
                      </button>

                      {/* Resend timer */}
                      <div className="text-center text-[11px] text-neutral-400 pt-1">
                        {canResend ? (
                          <button
                            type="button"
                            onClick={() => handleSendPhoneOtp()}
                            className="text-emerald-400 hover:underline font-bold"
                          >
                            إعادة إرسال رمز جديد الآن
                          </button>
                        ) : (
                          <span>يمكنك إعادة طلب الرمز بعد ({countdown}) ثانية</span>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* METHOD 2: EMAIL & PASSWORD AUTHENTICATION */}
              {method === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  {authMode === 'register' && (
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-neutral-300">
                        كلمة المرور
                      </label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playPop();
                            setIsForgotPassView(true);
                            setError(null);
                          }}
                          className="text-[10px] text-emerald-400 hover:underline"
                        >
                          نسيت كلمة المرور؟
                        </button>
                      )}
                    </div>
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
                    className="w-full mt-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : authMode === 'login' ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>دخول إلى حسابي</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>إنشاء الحساب بالبريد</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* METHOD 3: GOOGLE AUTHENTICATION (Prominent Separator & Button) */}
              <div className="relative flex items-center justify-center my-3.5">
                <div className="border-t border-neutral-800 w-full" />
                <span className="bg-neutral-900 px-3 text-[11px] text-neutral-500 whitespace-nowrap">أو المتابعة عبر</span>
                <div className="border-t border-neutral-800 w-full" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 border border-neutral-200 disabled:opacity-50"
              >
                {/* Official Google 'G' Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>المتابعة باستخدام Google</span>
              </button>
            </>
          )}

          {/* Footer Security Badge */}
          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>تسجيل آمن ومشفر</span>
            </span>

            <span className="text-[10px] text-neutral-500 font-medium">
              منصة مهارة
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
