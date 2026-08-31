# دليل تطبيق أندرويد (Mahara Android App) 📱

تم إعداد هذا المشروع ليتم بناؤه وتصديره كتطبيق Android APK مستقل بالكامل يعمل على جميع هواتف أندرويد (Android 7.0 وما فوق - SDK 24+).

---

## ✨ المميزات المدمجة في نسخة أندرويد:
1. **تطبيق مستقل بالكامل (Standalone)**: تُحزم جميع ملفات التطبيق والمكتبات داخل ملف الـ APK، ليعمل مباشرة على الهاتف بدون الحاجة لخادم خارجي.
2. **ملء الشاشة وتصميم متجاوب (Edge-to-Edge Fullscreen)**: شريط حالة متناسق وتجربة استخدام سريعة وسلسة تشبه TikTok مع إيماءات اللمس.
3. **ذكاء اصطناعي وأوفلاين (Smart Fallbacks & AI Tutor)**: عمل المساعد الذكي، الاختبارات السريعة، وتوليد الدروس بنظام ذكي متجاوب حتى بدون اتصال خادم دائم.
4. **أمان وصلاحيات مدروسة**: طلب الصلاحيات الأساسية فقط (الإنترنت، حالة الشبكة، الاهتزاز، والصوت للممارسات الصوتية).
5. **أتمتة البناء (GitHub Actions CI/CD)**: بناء ملف APK تلقائياً عند كل Push مع نشر GitHub Release جاهز للتنزيل بنقرة واحدة.

---

## 🚀 كيفية الحصول على ملف APK:

### 1. عبر GitHub Actions (تلقائياً وبدون برامج):
- بمجرد رفع الكود (Push) إلى مستودع GitHub الخاص بك:
  1. انتقل إلى تبويب **Releases** في مستودع GitHub.
  2. ستجد أحدث إصدار مع ملف **`Mahara-EduTok-v1.0.apk`** جاهز للتنزيل المباشر والتثبيت.
  3. أو من تبويب **Actions**، اضغط على أحدث تشغيل لـ `Build Android APK & Publish Release` وحمّل الـ Artifacts.

---

### 2. البناء محلياً على جهازك (Local Build):

#### المتطلبات:
- Node.js 18+
- Java JDK 17+
- Android SDK (أو Android Studio)

#### الخطوات:
```bash
# 1. تثبيت الحزم وبناء واجهة التطبيق
npm install
npm run build:android

# 2. الانتقال لمجلد أندرويد وبناء الـ APK
cd android
./gradlew assembleDebug

# أو على أنظمة Windows:
# gradlew.bat assembleDebug
```

ستجد ملف الـ APK الناتج في المسار:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📂 بنية مشروع أندرويد (Structure):
- `android/app/src/main/AndroidManifest.xml`: إعدادات الصلاحيات والـ Activity والشاشة الكاملة.
- `android/app/src/main/java/com/mahara/learntok/MainActivity.kt`: كود تشغيل الـ WebView الذكي، دعم ملء الشاشة، والتعامل مع زر الرجوع والصوت.
- `android/app/src/main/assets/dist/`: الملفات المبنية للواجهة المدمجة داخل الـ APK.
- `android/app/build.gradle`: إعدادات الـ SDK والتبعيات ونسخة التطبيق.
- `.github/workflows/build-apk.yml`: خطة البناء والنشر التلقائي للـ APK عبر GitHub.
