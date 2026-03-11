import { useState, useEffect } from "react";
import { X, Loader2, ArrowRight } from "lucide-react";
import { getExternalIds, playerUrl } from "../api/tmdb";

interface PlayerProps {
  movieId: number;
  movieTitle: string;
  onClose: () => void;
}

export default function Player({ movieId, movieTitle, onClose }: PlayerProps) {
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let cancelled = false;

    getExternalIds(movieId)
      .then((data) => {
        if (!cancelled) {
          if (data.imdb_id) {
            setImdbId(data.imdb_id);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      document.body.style.overflow = "auto";
    };
  }, [movieId]);

  // Handle escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-sm z-10">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowRight size={24} />
          <span className="text-sm font-semibold">رجوع</span>
        </button>
        <h3 className="text-white font-bold text-lg truncate max-w-[60%] text-center">
          {movieTitle}
        </h3>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full p-1.5"
        >
          <X size={20} />
        </button>
      </div>

      {/* Player Area */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <Loader2 size={48} className="text-red-600 animate-spin mb-4" />
            <p className="text-gray-400 text-lg">جاري تحميل المشغل...</p>
            <p className="text-gray-600 text-sm mt-2">{movieTitle}</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <div className="text-center">
              <div className="text-6xl mb-4">😔</div>
              <p className="text-white text-xl font-bold mb-2">
                عذراً، لا يمكن تشغيل هذا الفيلم
              </p>
              <p className="text-gray-400 mb-6">
                لم يتم العثور على معرف IMDB لهذا الفيلم
              </p>
              <button
                onClick={onClose}
                className="bg-red-600 text-white px-8 py-3 rounded-md font-bold hover:bg-red-700 transition-colors"
              >
                رجوع
              </button>
            </div>
          </div>
        )}

        {imdbId && (
          <iframe
            src={playerUrl(imdbId)}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            title={movieTitle}
            onLoad={() => setLoading(false)}
          />
        )}
      </div>
    </div>
  );
}
