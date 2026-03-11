import { useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, Menu, X } from "lucide-react";

interface NavbarProps {
  onSearch: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const navLinks = ["الرئيسية", "مسلسلات", "أفلام", "جديد ورائج", "قائمتي"];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#141414]/95 backdrop-blur-md shadow-lg shadow-black/30"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-12 py-3">
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Netflix Logo */}
          <h1 className="text-red-600 text-2xl md:text-3xl font-black tracking-wider select-none cursor-pointer">
            NETFLIX
          </h1>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-5">
            {navLinks.map((link, i) => (
              <li key={i}>
                <a
                  href="#"
                  className={`text-sm transition-colors hover:text-gray-300 ${
                    i === 0 ? "text-white font-semibold" : "text-gray-400"
                  }`}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex items-center">
            {searchOpen && (
              <input
                ref={searchRef}
                type="text"
                placeholder="ابحث عن أفلام..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-black/90 border border-white/30 text-white text-sm px-3 py-1.5 pr-9 w-48 md:w-72 rounded focus:outline-none focus:border-red-500 placeholder:text-gray-500 transition-all"
                dir="rtl"
              />
            )}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (searchOpen) {
                  setSearchQuery("");
                  onSearch("");
                }
              }}
              className={`text-white hover:text-gray-300 transition-colors ${
                searchOpen ? "absolute right-2" : ""
              }`}
            >
              <Search size={20} />
            </button>
          </div>

          {/* Notifications */}
          <button className="text-white hover:text-gray-300 transition-colors relative hidden sm:block">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              5
            </span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">م</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-white transition-transform duration-300 ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-52 bg-[#1a1a1a]/95 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-700/50">
                    <p className="text-white text-sm font-semibold text-right">محمد</p>
                    <p className="text-gray-400 text-xs text-right">الملف الشخصي</p>
                  </div>
                  {["إدارة الملفات الشخصية", "الحساب", "مركز المساعدة"].map((item, i) => (
                    <a
                      key={i}
                      href="#"
                      className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 text-right transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                  <a
                    href="#"
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 border-t border-gray-700/50 text-right transition-colors"
                  >
                    تسجيل الخروج
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#141414]/95 backdrop-blur-md border-t border-gray-800/50 px-4 py-4">
          <ul className="flex flex-col gap-3">
            {navLinks.map((link, i) => (
              <li key={i}>
                <a
                  href="#"
                  className={`text-base block text-right py-1 ${
                    i === 0 ? "text-white font-semibold" : "text-gray-400"
                  }`}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
