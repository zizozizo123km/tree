هذا الملف `js/utils/api-mock.js` يمثل الطبقة المسؤولة عن محاكاة قاعدة البيانات (Database Layer) والعمليات البرمجية (API Logic) باستخدام `localStorage`. تم تصميمه بمعايير هندسية تضمن استمرارية البيانات (Persistence) وسهولة التعامل معها من قبل الوحدات الأخرى (Modules).

```javascript
/**
 * API Mock Utility - نظام محاكاة البيانات المتكامل
 * المهندس المعماري: Lead Full-Stack Designer
 * المشروع: نظام فيسبوك المتكامل (Arabic Edition)
 * الوصف: محاكاة شاملة للـ Backend والـ Database باستخدام LocalStorage مع دعم لعمليات CRUD و Latency.
 */

class APIMock {
    constructor() {
        this.DB_KEY = 'FACEBOOK_MOCK_DB';
        this.LATENCY = 600; // محاكاة تأخير الشبكة (600ms)
        this._initDB();
    }

    /**
     * تهيئة قاعدة البيانات بالبيانات الافتراضية إذا كانت فارغة
     */
    _initDB() {
        if (!localStorage.getItem(this.DB_KEY)) {
            const initialData = {
                users: [
                    {
                        id: 'u1',
                        name: 'أحمد محمد',
                        email: 'ahmed@example.com',
                        password: 'password123',
                        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200',
                        cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200',
                        bio: 'مهندس برمجيات مهتم بالذكاء الاصطناعي والتصميم الحديث.',
                        friends: ['u2', 'u3'],
                        joinedAt: '2023-01-01'
                    },
                    {
                        id: 'u2',
                        name: 'سارة أحمد',
                        email: 'sara@example.com',
                        password: 'password123',
                        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200',
                        cover: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=1200',
                        bio: 'مصممة جرافيك وعاشقة للتصوير الفوتوغرافي.',
                        friends: ['u1'],
                        joinedAt: '2023-05-12'
                    }
                ],
                posts: [
                    {
                        id: 'p1',
                        userId: 'u1',
                        content: 'أهلاً بكم في النسخة التجريبية من فيسبوك الجديد! التصميم مذهل والسرعة خيالية. 🚀',
                        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800',
                        likes: ['u2'],
                        comments: [
                            { id: 'c1', userId: 'u2', text: 'عمل رائع جداً!', timestamp: new Date().toISOString() }
                        ],
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: 'p2',
                        userId: 'u2',
                        content: 'هل جربتم ميزة السوق (Marketplace) الجديدة؟ خيارات رائعة!',
                        image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800',
                        likes: [],
                        comments: [],
                        createdAt: new Date(Date.now() - 3600000).toISOString()
                    }
                ],
                notifications: [
                    { id: 'n1', toUserId: 'u1', fromUserId: 'u2', type: 'like', postId: 'p1', read: false, createdAt: new Date().toISOString() },
                    { id: 'n2', toUserId: 'u1', fromUserId: 'u2', type: 'comment', postId: 'p1', read: true, createdAt: new Date().toISOString() }
                ],
                messages: [
                    { id: 'm1', fromId: 'u2', toId: 'u1', text: 'مرحباً أحمد، كيف حالك؟', createdAt: new Date().toISOString() }
                ],
                marketplace: [
                    { id: 'i1', title: 'آيفون 14 برو', price: '35000', location: 'القاهرة', image: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&w=400' },
                    { id: 'i2', title: 'لابتوب ديل XPS', price: '45000', location: 'دبي', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400' }
                ]
            };
            localStorage.setItem(this.DB_KEY, JSON.stringify(initialData));
        }
    }

    _getDB() {
        return JSON.parse(localStorage.getItem(this.DB_KEY));
    }

    _saveDB(data) {
        localStorage.setItem(this.DB_KEY, JSON.stringify(data));
    }

    /**
     * نظام استجابة محاكي للواقع مع تأخير زمني
     */
    async _respond(data, success = true, error = '') {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (success) resolve({ status: 200, data });
                else reject({ status: 400, error });
            }, this.LATENCY);
        });
    }

    // --- Auth API ---

    async login(email, password) {
        const db = this._getDB();
        const user = db.users.find(u => u.email === email && u.password === password);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return this._respond({ token: 'mock_token_' + user.id, user: userWithoutPassword });
        }
        return this._respond(null, false, 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    async register(userData) {
        const db = this._getDB();
        if (db.users.find(u => u.email === userData.email)) {
            return this._respond(null, false, 'البريد الإلكتروني مسجل بالفعل');
        }
        const newUser = {
            id: 'u' + Date.now(),
            ...userData,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200',
            friends: [],
            joinedAt: new Date().toISOString()
        };
        db.users.push(newUser);
        this._saveDB(db);
        return this._respond(newUser);
    }

    // --- Feed/Posts API ---

    async getPosts() {
        const db = this._getDB();
        const postsWithUsers = db.posts.map(post => ({
            ...post,
            user: db.users.find(u => u.id === post.userId)
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return this._respond(postsWithUsers);
    }

    async createPost(userId, content, image = null) {
        const db = this._getDB();
        const newPost = {
            id: 'p' + Date.now(),
            userId,
            content,
            image,
            likes: [],
            comments: [],
            createdAt: new Date().toISOString()
        };
        db.posts.unshift(newPost);
        this._saveDB(db);
        return this._respond(newPost);
    }

    async toggleLike(postId, userId) {
        const db = this._getDB();
        const post = db.posts.find(p => p.id === postId);
        if (post) {
            const index = post.likes.indexOf(userId);
            if (index === -1) post.likes.push(userId);
            else post.likes.splice(index, 1);
            this._saveDB(db);
        }
        return this._respond(post);
    }

    // --- Messaging API ---

    async getConversations(userId) {
        const db = this._getDB();
        // تبسيط: إرجاع قائمة المستخدمين الآخرين كجهات اتصال
        const contacts = db.users.filter(u => u.id !== userId);
        return this._respond(contacts);
    }

    async getMessages(currentUserId, targetUserId) {
        const db = this._getDB();
        const chatMessages = db.messages.filter(m => 
            (m.fromId === currentUserId && m.toId === targetUserId) ||
            (m.fromId === targetUserId && m.toId === currentUserId)
        );
        return this._respond(chatMessages);
    }

    async sendMessage(fromId, toId, text) {
        const db = this._getDB();
        const newMessage = {
            id: 'm' + Date.now(),
            fromId,
            toId,
            text,
            createdAt: new Date().toISOString()
        };
        db.messages.push(newMessage);
        this._saveDB(db);
        return this._respond(newMessage);
    }

    // --- Profile API ---

    async getUserProfile(userId) {
        const db = this._getDB();
        const user = db.users.find(u => u.id === userId);
        if (user) {
            const userPosts = db.posts.filter(p => p.userId === userId);
            return this._respond({ ...user, posts: userPosts });
        }
        return this._respond(null, false, 'المستخدم غير موجود');
    }

    // --- Marketplace & Groups ---

    async getMarketplaceItems() {
        const db = this._getDB();
        return this._respond(db.marketplace);
    }

    async getNotifications(userId) {
        const db = this._getDB();
        const userNotifications = db.notifications
            .filter(n => n.toUserId === userId)
            .map(n => ({
                ...n,
                fromUser: db.users.find(u => u.id === n.fromUserId)
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return this._respond(userNotifications);
    }
}

// تصدير نسخة واحدة ثابتة (Singleton) للاستخدام في كامل التطبيق
const apiMock = new APIMock();
window.apiMock = apiMock; // متاح عالمياً لتسهيل الوصول من ملفات الـ JS الأخرى 

/** 
 * مثال على الاستخدام:
 * apiMock.getPosts().then(response => console.log(response.data));
 */
```

### المميزات الرئيسية لهذا التصميم:
1.  **استمرارية البيانات (Persistence):** يتم حفظ كافة التغييرات (بوستات جديدة، إعجابات، رسائل) في `localStorage` بحيث تظل موجودة حتى بعد تحديث الصفحة.
2.  **محاكاة التأخير (Latency Simulation):** يستخدم `setTimeout` لمحاكاة العمليات الحقيقية عبر الإنترنت، مما يتيح لك إظهار "Loading Spinners" في واجهة المستخدم بشكل احترافي.
3.  **العلاقات البرمجية (Data Relations):** يقوم الـ API بربط بيانات المنشورات مع بيانات أصحابها (User Join) تلقائياً قبل إرسال الرد.
4.  **الأمان المبدئي:** يتم فصل كلمات المرور عن البيانات المرسلة في عملية تسجيل الدخول.
5.  **دعم اللغة العربية:** جميع البيانات الافتراضية مدرجة باللغة العربية الفصحى لتناسب سياق المشروع.