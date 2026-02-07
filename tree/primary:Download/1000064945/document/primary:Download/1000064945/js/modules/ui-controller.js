هذا هو الملف الكامل والاحترافي `js/modules/ui-controller.js`. تم تصميمه ليكون العصب المركزي للواجهة، حيث يدعم ميزات متقدمة مثل إدارة السمات (Dark/Light Mode)، القوائم الجانبية المستجيبة، نظام التنبيهات (Toasts)، النوافذ المنبثقة (Modals)، وحالات التحميل (Skeletons).

```javascript
/**
 * UI Controller Module - "موقع فيسبوك html"
 * المنسق الرئيسي لواجهة المستخدم، المسؤول عن التفاعلات، السمات، والرسوم المتحركة.
 */

export const UIController = (() => {
    // إعدادات التكوين
    const config = {
        themeKey: 'fb_clone_theme',
        activeClass: 'active',
        darkModeClass: 'dark',
        toastDuration: 4000
    };

    // عناصر DOM الشائعة
    const elements = {
        body: document.querySelector('body'),
        appContainer: document.getElementById('app-container'),
        sidebarLeft: document.getElementById('sidebar-left'),
        sidebarRight: document.getElementById('sidebar-right'),
        mainContent: document.getElementById('main-content'),
        themeToggle: document.querySelectorAll('.theme-toggle-btn'),
        modalContainer: document.getElementById('modal-overlay')
    };

    /**
     * تهيئة جميع وظائف واجهة المستخدم
     */
    const init = () => {
        _applySavedTheme();
        _setupEventListeners();
        _initializeTooltips();
        _handleRTL();
        console.log('✅ UI Controller: تم التفعيل بنجاح (الوضع العربي)');
    };

    /**
     * إعداد مستمعي الأحداث العامين
     */
    const _setupEventListeners = () => {
        // تبديل الوضع الليلي
        elements.themeToggle.forEach(btn => {
            btn.addEventListener('click', () => toggleTheme());
        });

        // إغلاق النوافذ المنبثقة عند الضغط على الخلفية
        if (elements.modalContainer) {
            elements.modalContainer.addEventListener('click', (e) => {
                if (e.target === elements.modalContainer) closeModal();
            });
        }

        // التعامل مع القائمة الجانبية في الجوال
        const mobileMenuBtn = document.querySelector('.mobile-menu-trigger');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                elements.sidebarLeft.classList.toggle('translate-x-0');
            });
        }

        // منع التمرير عند فتح القوائم الكبيرة
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    };

    /**
     * إدارة السمات (Dark/Light Mode)
     */
    const toggleTheme = () => {
        const isDark = elements.body.classList.contains(config.darkModeClass);
        const newTheme = isDark ? 'light' : 'dark';
        
        if (newTheme === 'dark') {
            elements.body.classList.add(config.darkModeClass);
        } else {
            elements.body.classList.remove(config.darkModeClass);
        }
        
        localStorage.setItem(config.themeKey, newTheme);
        showToast(newTheme === 'dark' ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري', 'info');
    };

    const _applySavedTheme = () => {
        const savedTheme = localStorage.getItem(config.themeKey) || 'light';
        if (savedTheme === 'dark') {
            elements.body.classList.add(config.darkModeClass);
        }
    };

    /**
     * نظام التنبيهات المنبثقة (Toast Notifications)
     */
    const showToast = (message, type = 'success') => {
        const toastId = 'toast-' + Date.now();
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            info: 'bg-blue-600',
            warning: 'bg-yellow-500'
        };

        const toastHTML = `
            <div id="${toastId}" class="flex items-center w-full max-w-xs p-4 mb-4 text-white ${colors[type]} rounded-xl shadow-2xl transition-all duration-500 transform translate-y-10 opacity-0 z-[9999]">
                <div class="ml-3 text-sm font-bold font-['Tajawal']">${message}</div>
                <button type="button" class="mr-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-white hover:bg-black/20" onclick="this.parentElement.remove()">
                    <span class="sr-only">إغلاق</span>
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
                </button>
            </div>
        `;

        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2';
            elements.body.appendChild(container);
        }

        container.insertAdjacentHTML('beforeend', toastHTML);
        const toastElement = document.getElementById(toastId);

        // Animation In
        setTimeout(() => {
            toastElement.classList.remove('translate-y-10', 'opacity-0');
        }, 100);

        // Auto Remove
        setTimeout(() => {
            toastElement.classList.add('opacity-0');
            setTimeout(() => toastElement.remove(), 500);
        }, config.toastDuration);
    };

    /**
     * إدارة النوافذ المنبثقة (Modals)
     */
    const openModal = (modalId, content = null) => {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        elements.body.style.overflow = 'hidden';
        modal.classList.remove('hidden');
        modal.classList.add('flex', 'animate-fade-in');

        if (content) {
            const body = modal.querySelector('.modal-body');
            if (body) body.innerHTML = content;
        }
    };

    const closeModal = () => {
        const modals = document.querySelectorAll('.modal-overlay:not(.hidden)');
        modals.forEach(modal => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
        elements.body.style.overflow = '';
    };

    /**
     * عرض حالة التحميل (Skeleton Screen)
     */
    const renderSkeleton = (type = 'feed') => {
        const skeletons = {
            feed: `
                <div class="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
                    <div class="flex items-center space-x-4 space-x-reverse mb-4">
                        <div class="rounded-full bg-gray-300 dark:bg-gray-700 h-12 w-12"></div>
                        <div class="flex-1 space-y-2 py-1">
                            <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                            <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
                        </div>
                    </div>
                    <div class="space-y-3">
                        <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                        <div class="h-64 bg-gray-300 dark:bg-gray-700 rounded-xl mt-4 w-full"></div>
                    </div>
                </div>
            `
        };
        return skeletons[type] || skeletons.feed;
    };

    /**
     * تنسيق الوقت باللغة العربية
     */
    const formatArabicTime = (date) => {
        const now = new Date();
        const diff = Math.floor((now - new Date(date)) / 1000);

        if (diff < 60) return 'الآن';
        if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
        if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
        if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
        
        return new Date(date).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * تحسين القراءة ودعم RTL
     */
    const _handleRTL = () => {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
    };

    /**
     * تهيئة التلميحات (Tooltips)
     */
    const _initializeTooltips = () => {
        // يمكن إضافة مكتبة مثل Tippy.js هنا أو تطبيق يدوي
        console.log('UI: Tooltips initialized');
    };

    // الوظائف المتاحة للخارج
    return {
        init,
        toggleTheme,
        showToast,
        openModal,
        closeModal,
        renderSkeleton,
        formatArabicTime,
        elements
    };
})();

// تشغيل تلقائي عند تحميل المستند
document.addEventListener('DOMContentLoaded', () => {
    UIController.init();
});
```

### المميزات الرئيسية لهذا الملف:

1.  **إدارة الوضع الليلي (Dark Mode):** يدعم التبديل السلس مع حفظ خيار المستخدم في الـ `localStorage`.
2.  **نظام تنبيهات احترافي (Toasts):** تظهر التنبيهات بشكل منبثق من الأسفل مع ألوان مختلفة (نجاح، خطأ، تنبيه) وتدعم خط "Tajawal" العربي.
3.  **إدارة النوافذ (Modals):** نظام مركزي لفتح وإغلاق النوافذ المنبثقة مع منع تمرير الصفحة عند فتحها.
4.  **Skeleton Screens:** يتضمن دالة لإنشاء هياكل تحميل وهمية (Shimmer Effect) لتحسين تجربة المستخدم أثناء انتظار البيانات.
5.  **دعم كامل للغة العربية (RTL):** يقوم بضبط اتجاه الصفحة وتنسيق التاريخ والوقت ليناسب المستخدم العربي (مثال: "منذ 5 دقائق").
6.  **التصميم المستجيب:** يتضمن منطقاً للتعامل مع القوائم الجانبية في الهواتف المحمولة.
7.  **الأداء:** يستخدم نمط الـ Module لضمان عدم تداخل المتغيرات ولتسهيل الصيانة.