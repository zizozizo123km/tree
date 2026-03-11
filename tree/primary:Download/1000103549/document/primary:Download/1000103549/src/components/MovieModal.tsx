import { useState, useEffect } from "react";
import { X, Play, Plus, ThumbsUp, Share2, Star, Check, Loader2 } from "lucide-react";
import type { TMDBMovie, TMDBMovieDetail, TMDBCredits } from "../api/tmdb";
import {
  backdropUrl,
  posterUrl,
  getMovieDetails,
  getCredits,
  getSimilar,
  getGenreNames,
  getYear,
} from "../api/tmdb";

interface MovieModalProps {
  movie: TMDBMovie;
  onClose: () => void;
  onPlay: (movie: TMDBMovie) => void;
}

export default function MovieModal({ movie, onClose, onPlay }: MovieModalProps) {
  const [details, setDetails] = useState<TMDBMovieDetail | null>(null);
  const [credits, setCredits] = useState<TMDBCredits | null>(null);
  const [similar, setSimilar] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [inList, setInList] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let cancelled = false;

    Promise.all([
      getMovieDetails(movie.id),
      getCredits(movie.id),
      getSimilar(movie.id),
    ])
      .then(([det, cred, sim]) => {
        if (!cancelled) {
          setDetails(det);
          setCredits(cred);
          setSimilar(sim.slice(0, 9));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      document.body.style.overflow = "auto";
    };
  }, [movie.id]);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const matchPercent = Math.round(movie.vote_average * 10);
  const runtime = details
    ? `${Math.floor(details.runtime / 60)} ساعة ${details.runtime % 60} دقيقة`
    : "";
  const director = credits?.crew.find((c) => c.job === "Director");
  const topCast = credits?.cast.slice(0, 6) || [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto pt-4 md:pt-8 pb-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl mx-3 bg-[#181818] rounded-xl overflow-hidden shadow-2xl animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 bg-[#181818]/80 backdrop-blur-sm rounded-full p-2 hover:bg-gray-700 transition-colors"
        >
          <X size={20} className="text-white" />
        </button>

        {/* Backdrop Image */}
        <div className="relative w-full aspect-video">
          <img
            src={backdropUrl(movie.backdrop_path, "w1280")}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/20 to-transparent" />

          {/* Title Over Image */}
          <div className="absolute bottom-6 right-6 left-6" dir="rtl">
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4 drop-shadow-2xl leading-tight">
              {movie.title || movie.original_title}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => onPlay(movie)}
                className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-md font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
              >
                <Play size={20} fill="black" />
                تشغيل
              </button>
              <button
                onClick={() => setInList(!inList)}
                className={`border-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors ${
                  inList
                    ? "border-green-500 text-green-500 bg-green-500/10"
                    : "border-gray-400 text-white hover:border-white"
                }`}
              >
                {inList ? <Check size={20} /> : <Plus size={20} />}
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className={`border-2 rounded-full w-10 h-10 flex items-center justify-center transition-colors ${
                  liked
                    ? "border-blue-500 text-blue-500 bg-blue-500/10"
                    : "border-gray-400 text-white hover:border-white"
                }`}
              >
                <ThumbsUp size={20} />
              </button>
              <button className="border-2 border-gray-400 text-white rounded-full w-10 h-10 flex items-center justify-center hover:border-white transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 md:p-8" dir="rtl">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="text-red-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Meta Info Row */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-green-500 font-bold text-lg">
                  مطابقة {matchPercent}%
                </span>
                <span className="text-gray-400">{getYear(movie.release_date)}</span>
                <span className="border border-gray-500 text-gray-400 px-2 py-0.5 text-sm rounded">
                  {movie.adult ? "+18" : "+13"}
                </span>
                {runtime && <span className="text-gray-400">{runtime}</span>}
                <span className="border border-gray-500 text-gray-400 px-2 py-0.5 text-sm rounded">
                  HD
                </span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <span className="font-bold">{movie.vote_average.toFixed(1)}</span>
                </div>
              </div>

              {/* Tagline */}
              {details?.tagline && (
                <p className="text-gray-400 text-sm italic mb-3 border-r-2 border-red-600 pr-3">
                  "{details.tagline}"
                </p>
              )}

              {/* Description */}
              <p className="text-gray-200 text-base leading-relaxed mb-6">
                {movie.overview || details?.overview || "لا يوجد وصف متاح."}
              </p>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  {details?.genres && (
                    <p className="text-sm">
                      <span className="text-gray-500">النوع: </span>
                      <span className="text-gray-300">
                        {details.genres.map((g) => g.name).join("، ")}
                      </span>
                    </p>
                  )}
                  {director && (
                    <p className="text-sm">
                      <span className="text-gray-500">المخرج: </span>
                      <span className="text-gray-300">{director.name}</span>
                    </p>
                  )}
                  {runtime && (
                    <p className="text-sm">
                      <span className="text-gray-500">المدة: </span>
                      <span className="text-gray-300">{runtime}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-500">سنة الإنتاج: </span>
                    <span className="text-gray-300">{getYear(movie.release_date)}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">التقييم: </span>
                    <span className="text-gray-300">
                      {movie.vote_average.toFixed(1)}/10 ({movie.vote_count.toLocaleString()} تقييم)
                    </span>
                  </p>
                  {details?.spoken_languages && details.spoken_languages.length > 0 && (
                    <p className="text-sm">
                      <span className="text-gray-500">اللغات: </span>
                      <span className="text-gray-300">
                        {details.spoken_languages.map((l) => l.name || l.english_name).join("، ")}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Cast */}
              {topCast.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white mb-3">طاقم التمثيل</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {topCast.map((actor) => (
                      <div key={actor.id} className="text-center group/actor">
                        <div className="w-14 h-14 mx-auto rounded-full overflow-hidden bg-gray-800 mb-1.5 ring-2 ring-transparent group-hover/actor:ring-red-500 transition-all">
                          {actor.profile_path ? (
                            <img
                              src={posterUrl(actor.profile_path, "w185")}
                              alt={actor.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
                              👤
                            </div>
                          )}
                        </div>
                        <p className="text-white text-xs font-semibold line-clamp-1">
                          {actor.name}
                        </p>
                        <p className="text-gray-500 text-[10px] line-clamp-1">
                          {actor.character}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Movies */}
              {similar.length > 0 && (
                <div className="border-t border-gray-700/50 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4">أفلام مشابهة</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {similar.map((sim) => (
                      <div
                        key={sim.id}
                        className="bg-[#2a2a2a] rounded-lg overflow-hidden hover:bg-[#333] transition-colors cursor-pointer group/sim"
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            // Re-open with new movie - handled by parent
                          }, 100);
                        }}
                      >
                        <div className="relative">
                          <img
                            src={backdropUrl(sim.backdrop_path, "w500")}
                            alt={sim.title}
                            className="w-full aspect-video object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/sim:opacity-100 transition-opacity flex items-center justify-center">
                            <div
                              className="bg-white/20 backdrop-blur-sm rounded-full p-2 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlay(sim);
                              }}
                            >
                              <Play size={20} className="text-white" fill="white" />
                            </div>
                          </div>
                          <div className="absolute top-1.5 left-1.5 bg-black/70 rounded px-1.5 py-0.5">
                            <span className="text-yellow-500 text-xs font-bold">
                              ⭐ {sim.vote_average.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-white text-sm font-semibold mb-1 line-clamp-1">
                            {sim.title || sim.original_title}
                          </p>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-green-500 text-xs font-bold">
                              {Math.round(sim.vote_average * 10)}%
                            </span>
                            <span className="text-gray-500 text-xs">
                              {getYear(sim.release_date)}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs line-clamp-2">
                            {sim.overview || "لا يوجد وصف"}
                          </p>
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            {getGenreNames(sim.genre_ids)
                              .slice(0, 2)
                              .map((g, i) => (
                                <span
                                  key={i}
                                  className="text-gray-500 text-[10px] bg-gray-800 px-1.5 py-0.5 rounded"
                                >
                                  {g}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
