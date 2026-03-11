import { useState, useEffect } from "react";
import { Play, Info, Volume2, VolumeX } from "lucide-react";
import type { TMDBMovie } from "../api/tmdb";
import { backdropUrl, getGenreNames, getYear } from "../api/tmdb";

interface HeroBannerProps {
  movies: TMDBMovie[];
  onShowDetails: (movie: TMDBMovie) => void;
  onPlay: (movie: TMDBMovie) => void;
}

export default function HeroBanner({ movies, onShowDetails, onPlay }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [fade, setFade] = useState(true);

  const movie = movies[currentIndex];

  // Auto-rotate featured movie
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.min(movies.length, 5));
        setFade(true);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movie) return null;

  const matchPercent = Math.round(movie.vote_average * 10);

  return (
    <div className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden">
      {/* Background Image */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src={backdropUrl(movie.backdrop_path)}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/30 to-transparent" />
      </div>

      {/* Content */}
      <div
        className={`absolute bottom-[18%] md:bottom-[22%] right-4 md:right-12 max-w-2xl z-10 transition-all duration-700 ${
          fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        dir="rtl"
      >
        {/* Netflix Original Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-red-600 font-black text-xl tracking-widest">N</span>
          <span className="text-gray-300 text-xs tracking-[0.25em] uppercase font-semibold">
            فيلم مميز
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight drop-shadow-2xl">
          {movie.title || movie.original_title}
        </h2>

        {/* Meta Info */}
        <div className="flex items-center gap-3 mb-4 text-sm flex-wrap">
          <span className="text-green-500 font-bold">مطابقة {matchPercent}%</span>
          <span className="text-gray-400">{getYear(movie.release_date)}</span>
          <span className="border border-gray-500 text-gray-400 px-1.5 py-0.5 text-xs rounded">
            {movie.adult ? "+18" : "+13"}
          </span>
          <span className="flex items-center gap-1 text-yellow-500 font-bold">
            ⭐ {movie.vote_average.toFixed(1)}
          </span>
          <span className="border border-gray-500 text-gray-400 px-1.5 py-0.5 text-xs rounded">
            HD
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-200 text-sm md:text-base mb-5 leading-relaxed max-w-xl line-clamp-3">
          {movie.overview || "لا يوجد وصف متاح لهذا الفيلم."}
        </p>

        {/* Genre Tags */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {getGenreNames(movie.genre_ids).map((g, i) => (
            <span
              key={i}
              className="bg-white/10 backdrop-blur-sm text-gray-300 text-xs px-3 py-1 rounded-full"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlay(movie)}
            className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2.5 md:py-3 rounded-md font-bold text-base md:text-lg hover:bg-gray-200 transition-all shadow-lg active:scale-95"
          >
            <Play size={22} fill="black" />
            تشغيل
          </button>
          <button
            onClick={() => onShowDetails(movie)}
            className="flex items-center gap-2 bg-gray-500/50 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-md font-bold text-base md:text-lg hover:bg-gray-500/30 transition-all backdrop-blur-sm active:scale-95"
          >
            <Info size={22} />
            مزيد من المعلومات
          </button>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="absolute bottom-[18%] md:bottom-[22%] left-4 md:left-12 z-10 flex items-center gap-3">
        {/* Mute Button */}
        <button
          onClick={() => setMuted(!muted)}
          className="border border-gray-400/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:border-white transition-colors bg-black/30 backdrop-blur-sm"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        {/* Maturity Badge */}
        <div className="bg-black/50 border-r-2 border-white/50 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-white text-sm font-semibold">
            {movie.adult ? "+18" : "+13"}
          </span>
        </div>
      </div>

      {/* Dots Indicator */}
      {movies.length > 1 && (
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {movies.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setFade(false);
                setTimeout(() => {
                  setCurrentIndex(i);
                  setFade(true);
                }, 400);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
