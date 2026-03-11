import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const links = [
    "الوصف الصوتي",
    "مركز المساعدة",
    "بطاقات الهدايا",
    "مركز الوسائط",
    "علاقات المستثمرين",
    "الوظائف",
    "شروط الاستخدام",
    "الخصوصية",
    "الإشعارات القانونية",
    "تفضيلات ملفات تعريف الارتباط",
    "معلومات الشركة",
    "اتصل بنا",
  ];

  return (
    <footer
      className="bg-[#141414] text-gray-500 px-4 md:px-12 pt-12 pb-8 border-t border-gray-800/30"
      dir="rtl"
    >
      {/* Social Icons */}
      <div className="flex items-center gap-5 mb-6">
        {[
          { icon: Facebook, label: "Facebook" },
          { icon: Instagram, label: "Instagram" },
          { icon: Twitter, label: "Twitter" },
          { icon: Youtube, label: "Youtube" },
        ].map(({ icon: Icon, label }) => (
          <a
            key={label}
            href="#"
            className="hover:text-white transition-colors"
            aria-label={label}
          >
            <Icon size={22} />
          </a>
        ))}
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {links.map((link, i) => (
          <a
            key={i}
            href="#"
            className="text-xs hover:text-gray-300 underline underline-offset-2 transition-colors"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Service Code */}
      <button className="border border-gray-600 text-xs px-3 py-1.5 hover:text-white transition-colors mb-4 rounded">
        رمز الخدمة
      </button>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-gray-600">
          © 2024 نتفلكس - Netflix Clone. بيانات الأفلام من TMDB.
        </p>
        <p className="text-xs text-gray-700">
          Powered by TMDB API & CinemaOS Player
        </p>
      </div>
    </footer>
  );
}
