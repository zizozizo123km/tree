هذا هو الكود المصدري الكامل والاحترافي لملف `js/modules/messaging.js`. تم تصميم هذا الملف ليعمل بنظام الوحدات (ES6 Modules) ويوفر تجربة دردشة متكاملة وسلسة تشبه تطبيق Messenger، مع دعم كامل للغة العربية والواجهات المتجاوبة.

```javascript
/**
 * Messaging Module - نظام المراسلة المتقدم
 * المشروع: موقع فيسبوك html
 * الوصف: إدارة المحادثات، إرسال الرسائل، والبحث عن جهات الاتصال.
 */

import { APIMock } from '../utils/api-mock.js';
import { UIController } from './ui-controller.js';

const Messaging = (() => {
    // --- حالة التطبيق الداخلية (Internal State) ---
    const state = {
        conversations: [],
        activeChatId: null,
        currentUser: null,
        searchQuery: ''
    };

    // --- العناصر المستهدفة في DOM ---
    const selectors = {
        chatList: '#chat-list',
        messageContainer: '#message-container',
        messageForm: '#message-form',
        messageInput: '#message-input',
        chatHeader: '#chat-header',
        searchContacts: '#search-contacts',
        noChatSelected: '#no-chat-selected',
        activeChatArea: '#active-chat-area'
    };

    /**
     * تهيئة الوحدة
     */
    const init = async () => {
        console.log('جاري تهيئة وحدة المراسلة...');
        
        try {
            state.currentUser = await APIMock.getCurrentUser();
            await loadConversations();
            setupEventListeners();
            
            // التحقق من وجود معرف محادثة في الرابط (Query Params)
            const urlParams = new URLSearchParams(window.location.search);
            const chatId = urlParams.get('id');
            if (chatId) {
                openConversation(chatId);
            }
        } catch (error) {
            console.error('خطأ في تهيئة المراسلة:', error);
        }
    };

    /**
     * تحميل المحادثات من الخادم الوهمي
     */
    const loadConversations = async () => {
        try {
            state.conversations = await APIMock.getConversations();
            renderConversationList();
        } catch (error) {
            UIController.showToast('فشل تحميل المحادثات', 'error');
        }
    };

    /**
     * رسم قائمة المحادثات في الجانب الأيمن
     */
    const renderConversationList = () => {
        const listElement = document.querySelector(selectors.chatList);
        if (!listElement) return;

        const filtered = state.conversations.filter(conv => 
            conv.participant.name.toLowerCase().includes(state.searchQuery.toLowerCase())
        );

        if (filtered.length === 0) {
            listElement.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <p>لا توجد نتائج للبحث</p>
                </div>
            `;
            return;
        }

        listElement.innerHTML = filtered.map(conv => `
            <div 
                data-chat-id="${conv.id}"
                class="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-light transition-all duration-200 rounded-lg mx-2 mb-1 ${state.activeChatId === conv.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-600' : ''}"
                onclick="Messaging.openConversation('${conv.id}')"
            >
                <div class="relative">
                    <img src="${conv.participant.avatar}" alt="${conv.participant.name}" class="w-12 h-12 rounded-full object-cover">
                    ${conv.participant.isOnline ? '<span class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-dark rounded-full"></span>' : ''}
                </div>
                <div class="mr-3 flex-1 overflow-hidden">
                    <div class="flex justify-between items-baseline">
                        <h4 class="font-bold text-gray-900 dark:text-white truncate text-sm">${conv.participant.name}</h4>
                        <span class="text-xs text-gray-500">${conv.lastMessageTime}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <p class="text-xs text-gray-500 truncate ${conv.unread ? 'font-bold text-blue-600 dark:text-blue-400' : ''}">
                            ${conv.lastMessage}
                        </p>
                        ${conv.unread ? `<span class="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full mr-2">${conv.unreadCount}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    };

    /**
     * فتح محادثة محددة
     */
    const openConversation = async (chatId) => {
        state.activeChatId = chatId;
        
        // تحديث UI القائمة (التركيز)
        renderConversationList();

        // إظهار منطقة الدردشة وإخفاء رسالة "لم يتم اختيار دردشة"
        document.querySelector(selectors.noChatSelected)?.classList.add('hidden');
        document.querySelector(selectors.activeChatArea)?.classList.remove('hidden');

        try {
            const chatData = await APIMock.getChatDetails(chatId);
            renderChatHeader(chatData.participant);
            renderMessages(chatData.messages);
            scrollToBottom();
            
            // تحديث حالة القراءة
            await APIMock.markAsRead(chatId);
        } catch (error) {
            console.error('خطأ في تحميل تفاصيل المحادثة:', error);
        }
    };

    /**
     * رسم رأس الدردشة
     */
    const renderChatHeader = (participant) => {
        const header = document.querySelector(selectors.chatHeader);
        if (!header) return;

        header.innerHTML = `
            <div class="flex items-center justify-between p-3 border-b dark:border-dark-light bg-white dark:bg-dark-medium">
                <div class="flex items-center">
                    <button class="md:hidden ml-2 p-2 hover:bg-gray-100 rounded-full" onclick="Messaging.backToList()">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <div class="relative">
                        <img src="${participant.avatar}" alt="${participant.name}" class="w-10 h-10 rounded-full object-cover">
                        ${participant.isOnline ? '<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-dark rounded-full"></span>' : ''}
                    </div>
                    <div class="mr-3">
                        <h3 class="font-bold text-gray-900 dark:text-white leading-tight">${participant.name}</h3>
                        <span class="text-xs text-green-500 font-medium">${participant.isOnline ? 'نشط الآن' : 'نشط منذ ' + participant.lastSeen}</span>
                    </div>
                </div>
                <div class="flex gap-2 text-blue-600">
                    <button class="p-2 hover:bg-gray-100 dark:hover:bg-dark-light rounded-full transition"><i class="fas fa-phone"></i></button>
                    <button class="p-2 hover:bg-gray-100 dark:hover:bg-dark-light rounded-full transition"><i class="fas fa-video"></i></button>
                    <button class="p-2 hover:bg-gray-100 dark:hover:bg-dark-light rounded-full transition"><i class="fas fa-info-circle"></i></button>
                </div>
            </div>
        `;
    };

    /**
     * رسم الرسائل
     */
    const renderMessages = (messages) => {
        const container = document.querySelector(selectors.messageContainer);
        if (!container) return;

        container.innerHTML = messages.map(msg => {
            const isMe = msg.senderId === state.currentUser.id;
            return `
                <div class="flex ${isMe ? 'justify-start flex-row-reverse' : 'justify-start'} mb-4 items-end gap-2 group">
                    ${!isMe ? `<img src="${msg.senderAvatar}" class="w-8 h-8 rounded-full object-cover mb-1" />` : ''}
                    <div class="max-w-[70%]">
                        <div class="px-4 py-2 rounded-2xl text-sm shadow-sm ${
                            isMe 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-gray-200 dark:bg-dark-light text-gray-800 dark:text-gray-100 rounded-bl-none'
                        }">
                            ${msg.text}
                        </div>
                        <span class="text-[10px] text-gray-400 mt-1 block px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            ${msg.timestamp}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    };

    /**
     * إرسال رسالة جديدة
     */
    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        
        const input = document.querySelector(selectors.messageInput);
        const text = input.value.trim();

        if (!text || !state.activeChatId) return;

        // تعطيل الإدخال مؤقتاً
        input.value = '';
        
        try {
            const newMessage = await APIMock.sendMessage(state.activeChatId, text);
            appendMessageToUI(newMessage);
            scrollToBottom();
            
            // تحديث القائمة الجانبية بالرسالة الأخيرة
            await loadConversations();
        } catch (error) {
            UIController.showToast('فشل إرسال الرسالة', 'error');
        }
    };

    /**
     * إضافة رسالة للواجهة بدون إعادة تحميل الكل
     */
    const appendMessageToUI = (msg) => {
        const container = document.querySelector(selectors.messageContainer);
        const isMe = msg.senderId === state.currentUser.id;
        
        const msgHtml = `
            <div class="flex ${isMe ? 'justify-start flex-row-reverse' : 'justify-start'} mb-4 items-end gap-2 animate-slide-up">
                <div class="max-w-[70%]">
                    <div class="px-4 py-2 rounded-2xl text-sm shadow-sm bg-blue-600 text-white rounded-br-none">
                        ${msg.text}
                    </div>
                    <span class="text-[10px] text-gray-400 mt-1 block px-1">الآن</span>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', msgHtml);
    };

    /**
     * إعداد مستمعي الأحداث
     */
    const setupEventListeners = () => {
        // البحث عن جهات اتصال
        const searchInput = document.querySelector(selectors.searchContacts);
        searchInput?.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            renderConversationList();
        });

        // نموذج إرسال الرسالة
        const form = document.querySelector(selectors.messageForm);
        form?.addEventListener('submit', handleSendMessage);

        // إرسال عبر Enter
        const input = document.querySelector(selectors.messageInput);
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    };

    /**
     * التمرير لأسفل المحادثة
     */
    const scrollToBottom = () => {
        const container = document.querySelector(selectors.messageContainer);
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    };

    /**
     * العودة للقائمة (للموبايل)
     */
    const backToList = () => {
        document.querySelector(selectors.activeChatArea)?.classList.add('hidden');
        document.querySelector(selectors.noChatSelected)?.classList.remove('hidden');
        state.activeChatId = null;
        renderConversationList();
    };

    // التصدير للاستخدام الخارجي (كـ Module)
    return {
        init,
        openConversation,
        backToList
    };
})();

// تشغيل الوحدة عند تحميل المستند
document.addEventListener('DOMContentLoaded', Messaging.init);

// جعل بعض الوظائف متاحة عالمياً للأزرار التي تستخدم onclick
window.Messaging = Messaging;

export default Messaging;
```

### شرح المميزات التقنية لهذا الملف:

1.  **إدارة الحالة (State Management):** يستخدم الكائن `state` لتتبع المحادثات، المستخدم الحالي، الدردشة النشطة، وكلمات البحث، مما يمنع تضارب البيانات.
2.  **نظام القوالب الديناميكي:** يستخدم `Template Literals` لإنشاء كود HTML نظيف وسريع الاستجابة يعتمد على البيانات القادمة من `api-mock.js`.
3.  **تجربة مستخدم محسنة (UX):**
    *   **التمرير التلقائي:** يتم التمرير لأسفل تلقائياً عند فتح محادثة أو إرسال رسالة.
    *   **مؤشرات الحالة:** يظهر نقطة خضراء للمستخدمين المتصلين (Online).
    *   **رسائل تفاعلية:** يدعم الرسائل "غير المقروءة" مع عداد خاص لكل محادثة.
4.  **التجاوب مع الموبايل:** يتضمن دالة `backToList` للتبديل بين قائمة المحادثات ونافذة الدردشة على الشاشات الصغيرة.
5.  **الأمان والأداء:**
    *   يستخدم `async/await` للتعامل مع العمليات غير المتزامنة لضمان عدم تجميد الواجهة.
    *   منع السلوك الافتراضي للنموذج (Prevent Default) والتحقق من المدخلات قبل الإرسال.
6.  **التصميم الجمالي:** تم استخدام كلاسات Tailwind CSS مع بعض اللمسات المخصصة مثل `animate-slide-up` لجعل ظهور الرسائل يبدو طبيعياً واحترافياً.

هذا الملف جاهز للربط مباشرة مع `index.html` أو `messages.html` ليعمل كنظام مراسلة متكامل.