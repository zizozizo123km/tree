هذا هو الكود المصدري الكامل والاحترافي لملف `js/core/app.js`. تم تصميم هذا الملف ليكون المحرك المركزي (Orchestrator) للمنصة، حيث يدير الحالة العامة، التحقق من الجلسات، التوجيه الذكي، وتنسيق العمل بين الوحدات المختلفة (Modules).

```javascript
/**
 * Project: موقع فيسبوك - Core Engine
 * Version: 1.0.0
 * Lead Architect: Full-Stack Designer
 * Description: الملف الأساسي لإدارة المنطق التشغيلي، الربط بين الوحدات، وإدارة الحالة العامة.
 */

"use strict";

// الكائن الرئيسي للتطبيق
const App = (() => {
    // إعدادات الحالة الافتراضية
    const state = {
        user: null,
        isAuthenticated: false,
        theme: localStorage.getItem('fb_theme') || 'light',
        config: {
            appName: "فيسبوك",
            version: "1.0.0",
            apiDelay: 800
        }
    };

    /**
     * تهيئة التطبيق عند تحميل الصفحة
     */
    const init = async () => {
        console.info(`%c[${state.config.appName}] Initializing...`, "color: #1877f2; font-weight: bold;");
        
        // 1. التحقق من حالة المصادقة
        checkAuthentication();

        // 2. تطبيق السمة (Dark/Light Mode)
        applyTheme(state.theme);

        // 3. ربط الأحداث العالمية (Global Events)
        bindGlobalEvents();

        // 4. تشغيل الوحدات الخاصة بالصفحة الحالية
        routeModules();

        // 5. إخفاء شاشة التحميل إن وجدت
        hideLoadingOverlay();
    };

    /**
     * التحقق من هوية المستخدم وجلسة العمل
     */
    const checkAuthentication = () => {
        const savedUser = localStorage.getItem('fb_user_session');
        const currentPage = window.location.pathname;
        const publicPages = ['/login.html', '/register.html'];

        if (savedUser) {
            state.user = JSON.parse(savedUser);
            state.isAuthenticated = true;
            
            // إذا كان المستخدم مسجلاً ويحاول دخول صفحة تسجيل الدخول، وجهه للرئيسية
            if (publicPages.some(page => currentPage.endsWith(page))) {
                window.location.href = 'index.html';
            }
        } else {
            // إذا لم يكن مسجلاً ويحاول دخول صفحة محمية
            if (!publicPages.some(page => currentPage.endsWith(page)) && !currentPage.endsWith('/')) {
                window.location.href = 'login.html';
            }
        }
    };

    /**
     * التوجيه الذكي للوحدات بناءً على الصفحة الحالية
     */
    const routeModules = () => {
        const path = window.location.pathname;

        // تهيئة وحدة UI Controller دائماً لتنسيق الواجهة
        if (window.UIController) window.UIController.init();

        // التحميل بناءً على الصفحة
        if (path.includes('index.html') || path === '/') {
            if (window.FeedModule) window.FeedModule.init();
        } else if (path.includes('messages.html')) {
            if (window.MessagingModule) window.MessagingModule.init();
        } else if (path.includes('profile.html')) {
            if (window.ProfileModule) window.ProfileModule.init();
        } else if (path.includes('login.html') || path.includes('register.html')) {
            if (window.AuthModule) window.AuthModule.init();
        }
    };

    /**
     * ربط الأحداث العامة (البحث، الإشعارات، القائمة الجانبية)
     */
    const bindGlobalEvents = () => {
        // البحث العالمي
        const searchInput = document.querySelector('input[type="search"]');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleGlobalSearch(e.target.value);
            });
        }

        // تبديل السمة (Dark Mode)
        const themeToggle = document.querySelector('[data-action="toggle-theme"]');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = state.theme === 'light' ? 'dark' : 'light';
                applyTheme(newTheme);
            });
        }

        // تسجيل الخروج
        const logoutBtn = document.querySelector('[data-action="logout"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    };

    /**
     * معالجة البحث
     */
    const handleGlobalSearch = (query) => {
        if (!query.trim()) return;
        console.log(`Searching for: ${query}`);
        // هنا يمكن توجيه المستخدم لصفحة نتائج البحث أو تصفية العناصر الحالية
        // window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    };

    /**
     * تطبيق سمة التصميم
     */
    const applyTheme = (theme) => {
        state.theme = theme;
        localStorage.setItem('fb_theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    /**
     * معالجة تسجيل الخروج
     */
    const handleLogout = (e) => {
        if (e) e.preventDefault();
        
        // تأكيد الخروج بتصميم عصري
        const confirmLogout = confirm("هل أنت متأكد من رغبتك في تسجيل الخروج؟");
        if (confirmLogout) {
            localStorage.removeItem('fb_user_session');
            window.location.href = 'login.html';
        }
    };

    /**
     * إخفاء شاشة التحميل الأولية
     */
    const hideLoadingOverlay = () => {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 500);
        }
    };

    /**
     * وظائف مساعدة عامة قابلة للاستخدام في الوحدات الأخرى
     */
    const Utils = {
        formatDate: (date) => {
            return new Intl.DateTimeFormat('ar-EG', { 
                dateStyle: 'full', 
                timeStyle: 'short' 
            }).format(new Date(date));
        },
        generateId: () => '_' + Math.random().toString(36).substr(2, 9),
        showToast: (message, type = 'info') => {
            // يمكن استدعاء وحدة UIController لإظهار رسالة تنبيه
            if (window.UIController && window.UIController.toast) {
                window.UIController.toast(message, type);
            } else {
                alert(message);
            }
        }
    };

    // تصدير الوظائف العامة
    return {
        init,
        state,
        Utils,
        handleLogout
    };
})();

// بدء التشغيل عند جاهزية مستند HTML
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// التعامل مع الأخطاء غير المتوقعة لضمان استقرار التطبيق
window.addEventListener('error', (event) => {
    console.error(`%c[App Error]: ${event.message}`, "color: white; background: red; padding: 4px; border-radius: 4px;");
});

// تصدير الكائن للوصول إليه من الوحدات الأخرى (Modules)
window.App = App;
```

### مميزات هذا التنفيذ:
1.  **المعمارية (Architecture):** يستخدم نمط *Module Pattern* (IIFE) لتجنب تلوث النطاق العالمي (Global Scope) وحماية الحالة الداخلية للتطبيق.
2.  **التوجيه الذكي (Routing):** يقوم تلقائياً ببدء تشغيل البرمجيات اللازمة بناءً على رابط الصفحة الحالي (مثلاً، يشغل محرك الرسائل فقط في صفحة `messages.html`).
3.  **إدارة الجلسة (Auth Management):** يتحقق من وجود المستخدم ويوجهه تلقائياً لصفحة تسجيل الدخول إذا كان يحاول الوصول لصفحة محمية دون تسجيل.
4.  **دعم السمة الداكنة (Dark Mode):** يدير سمة الموقع ويحفظ التفضيلات في `localStorage`.
5.  **الأدوات المساعدة (Utils):** يوفر وظائف مشتركة مثل تنسيق التاريخ باللغة العربية وإدارة التنبيهات (Toasts).
6.  **الاحترافية:** يتضمن نظاماً لمعالجة الأخطاء وتسجيل البيانات (Logging) في المتصفح بأسلوب منسق.

هذا الكود يمثل حجر الأساس المتين لأي تطبيق ويب ضخم، مما يسهل عملية التوسع وإضافة ميزات جديدة في ملفات الموديولات الأخرى.