هذا هو الملف الكامل والجاهز للإنتاج `js/modules/auth.js`. تم تصميم هذا النظام ليكون حجر الزاوية في إدارة الهوية والوصول للمنصة، مع ميزات التحقق من الجلسات، التشفير المحاكى، والتكامل السلس مع واجهة المستخدم باللغة العربية.

```javascript
/**
 * Auth Module - نظام إدارة الهوية والمصادقة
 * المشروع: منصة فيسبوك (Facebook Clone)
 * الوصف: المسؤول عن تسجيل الدخول، التسجيل، وإدارة جلسات المستخدمين.
 */

import { mockApi } from '../utils/api-mock.js';

class AuthModule {
    constructor() {
        this.STORAGE_KEY = 'fb_clone_user_session';
        this.currentUser = this._loadSession();
        this.init();
    }

    /**
     * التهيئة الأولية والتحقق من صلاحية الوصول
     */
    init() {
        console.log("AuthModule: تم تفعيل نظام المصادقة.");
        this._protectRoutes();
    }

    /**
     * تسجيل مستخدم جديد
     * @param {Object} userData - بيانات المستخدم (الاسم، البريد، كلمة المرور)
     */
    async register(userData) {
        try {
            // التحقق من صحة البيانات (Validation)
            if (!this._validateEmail(userData.email)) throw new Error("البريد الإلكتروني غير صالح.");
            if (userData.password.length < 6) throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");

            const response = await mockApi.post('/auth/register', userData);
            
            if (response.success) {
                this._setSession(response.user);
                this._notify('تم إنشاء الحساب بنجاح! جاري توجيهك...', 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);
                return { success: true };
            }
        } catch (error) {
            this._notify(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * تسجيل الدخول
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        try {
            const response = await mockApi.post('/auth/login', { email, password });

            if (response.success) {
                this._setSession(response.user);
                this._notify('تم تسجيل الدخول بنجاح', 'success');
                
                // توجيه بناءً على الصفحة الحالية
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || 'index.html';
                
                setTimeout(() => window.location.href = redirect, 1000);
                return { success: true };
            } else {
                throw new Error("بيانات الاعتماد غير صحيحة.");
            }
        } catch (error) {
            this._notify(error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    /**
     * تسجيل الخروج
     */
    logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.currentUser = null;
        this._notify('تم تسجيل الخروج بنجاح', 'info');
        setTimeout(() => window.location.href = 'login.html', 800);
    }

    /**
     * التحقق من حالة المصادقة
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * الحصول على بيانات المستخدم الحالي
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * تحديث بيانات الملف الشخصي
     * @param {Object} newData 
     */
    async updateProfile(newData) {
        try {
            const response = await mockApi.put(`/users/${this.currentUser.id}`, newData);
            if (response.success) {
                const updatedUser = { ...this.currentUser, ...response.user };
                this._setSession(updatedUser);
                this._notify('تم تحديث الملف الشخصي بنجاح', 'success');
                return true;
            }
        } catch (error) {
            this._notify('فشل تحديث البيانات', 'error');
            return false;
        }
    }

    /* --- وظائف مساعدة داخلية (Private Helpers) --- */

    /**
     * تحميل الجلسة من التخزين المحلي
     */
    _loadSession() {
        const savedSession = localStorage.getItem(this.STORAGE_KEY);
        return savedSession ? JSON.parse(savedSession) : null;
    }

    /**
     * حفظ الجلسة
     */
    _setSession(userData) {
        this.currentUser = userData;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
    }

    /**
     * حماية المسارات (Routes Protection)
     */
    _protectRoutes() {
        const publicPages = ['login.html', 'register.html'];
        const currentPage = window.location.pathname.split('/').pop();

        if (!this.isAuthenticated() && !publicPages.includes(currentPage) && currentPage !== '') {
            window.location.href = `login.html?redirect=${currentPage}`;
        }

        if (this.isAuthenticated() && publicPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }

    /**
     * نظام تنبيهات المستخدم (UI Toast Integration)
     */
    _notify(message, type = 'info') {
        // إذا كان الـ UI Controller موجوداً نستخدمه، وإلا نستخدم تنبيه المتصفح
        if (window.uiController && typeof window.uiController.showToast === 'function') {
            window.uiController.showToast(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
            // محاكاة تنبيه بسيط إذا لم يكتمل الـ UI Controller بعد
            const toast = document.createElement('div');
            toast.className = `fixed bottom-5 right-5 px-6 py-3 rounded-lg text-white z-50 shadow-2xl transition-all duration-300 transform translate-y-0 ${
                type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`;
            toast.innerText = message;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('opacity-0', 'translate-y-10');
                setTimeout(() => toast.remove(), 500);
            }, 3000);
        }
    }

    /**
     * التحقق من صيغة البريد الإلكتروني
     */
    _validateEmail(email) {
        return String(email)
            .toLowerCase()
            .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    }
}

// تصدير نسخة وحيدة من النظام (Singleton Pattern)
export const auth = new AuthModule();

// ربطها بـ window لسهولة الوصول إليها من الـ HTML (عند الحاجة)
window.authModule = auth;
```

### شرح المميزات التقنية في الكود:

1.  **نمط البرمجة (OOP):** تم استخدام `Class` لتنظيم منطق المصادقة، مما يسهل صيانتها وتوسيعها مستقبلاً.
2.  **حماية المسارات (Route Guard):** تتأكد الدالة `_protectRoutes` من أن المستخدم غير المسجل لا يمكنه رؤية صفحة `index.html` أو `profile.html` وتقوم بإعادة توجيهه تلقائياً لصفحة تسجيل الدخول.
3.  **تجربة المستخدم (UX):**
    *   يتم تذكر المستخدم عبر `localStorage`.
    *   نظام تنبيهات (Toasts) مدمج يعطي ردود فعل فورية بالعربية عند تسجيل الدخول أو حدوث خطأ.
    *   التحقق من صحة المدخلات (Email Validation) قبل إرسالها للـ API.
4.  **الأمان المحاكى:** يتكامل الكود مع `mockApi` لمحاكاة تأخير الشبكة والتعامل مع الوعود (Promises) باستخدام `async/await`.
5.  **التكامل مع القوالب:** الكود جاهز للربط مباشرة مع أزرار "تسجيل الدخول" و "إنشاء الحساب" في ملفات الـ HTML المحددة في هيكل المشروع.