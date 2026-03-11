import { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import HeroBanner from "./components/HeroBanner";
import MovieRow from "./components/MovieRow";
import MovieModal from "./components/MovieModal";
import Player from "./components/Player";
import Footer from "./components/Footer";
import {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getUpcoming,
  getByGenre,
  searchMovies,
  posterUrl,
  getGenreNames,
  getYear,
} from "./api/tmdb";
import type { TMDBMovie } from "./api/tmdb";
import { Loader2 } from "lucide-react";

interface CategoryRow {
  title: string;
  movies: TMDBMovie[];
  showRank?: boolean;
}

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null);
  const [playingMovie, setPlayingMovie] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([]);
  const [heroMovies, setHeroMovies] = useState<TMDBMovie[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [trending, popular, topRated, nowPlaying, upcoming, action, comedy, horror, drama, scifi, animation, documentary] =
          await Promise.all([
            getTrending(),
            getPopular(),
            getTopRated(),
            getNowPlaying(),
            getUpcoming(),
            getByGenre(28),    // Action
            getByGenre(35),    // Comedy
            getByGenre(27),    // Horror
            getByGenre(18),    // Drama
            getByGenre(878),   // Sci-Fi
            getByGenre(16),    // Animation
            getByGenre(99),    // Documentary
          ]);

        setHeroMovies(trending.filter((m) => m.backdrop_path));

        setCategories([
          { title: "🔥 الأكثر رواجاً هذا الأسبوع", movies: trending, showRank: true },
          { title: "🎬 يُعرض الآن في السينما", movies: nowPlaying },
          { title: "⭐ الأفلام الشائعة", movies: popular },
          { title: "🏆 الأعلى تقييماً", movies: topRated },
          { title: "📅 قريباً", movies: upcoming },
          { title: "💥 أفلام أكشن", movies: action },
          { title: "🎭 دراما", movies: drama },
          { title: "😂 كوميدي", movies: comedy },
          { title: "👻 رعب", movies: horror },
          { title: "🚀 خيال علمي", movies: scifi },
          { title: "🎨 رسوم متحركة", movies: animation },
          { title: "📖 أفلام وثائقية", movies: documentary },
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Search handler with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleShowDetails = useCallback((movie: TMDBMovie) => {
    setSelectedMovie(movie);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedMovie(null);
    document.body.style.overflow = "auto";
  }, []);

  const handlePlay = useCallback((movie: TMDBMovie) => {
    setPlayingMovie({ id: movie.id, title: movie.title || movie.original_title });
    setSelectedMovie(null);
  }, []);

  const handleClosePlayer = useCallback(() => {
    setPlayingMovie(null);
    document.body.style.overflow = "auto";
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center font-['Cairo',sans-serif]">
        <h1 className="text-red-600 text-5xl md:text-7xl font-black tracking-wider mb-8 animate-pulse">
          NETFLIX
        </h1>
        <Loader2 size={48} className="text-red-600 animate-spin mb-4" />
        <p className="text-gray-400 text-lg">جاري تحميل الأفلام...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] font-['Cairo',sans-serif]">
      {/* Navbar */}
      <Navbar onSearch={handleSearch} />

      {/* Main Content */}
      {isSearching ? (
        <div className="pt-24 px-4 md:px-12 min-h-screen" dir="rtl">
          <h2 className="text-white text-2xl font-bold mb-6">
            نتائج البحث عن "{searchQuery}"
          </h2>
          {searching ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={36} className="text-red-600 animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="cursor-pointer group"
                  onClick={() => handleShowDetails(movie)}
                >
                  <div className="relative rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-black/60 shadow-lg">
                    <img
                      src={posterUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover bg-gray-900"
                      loading="lazy"
                    />
                    {/* Rating */}
                    <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-1">
                      <span className="text-yellow-500 text-xs">⭐</span>
                      <span className="text-white text-xs font-bold">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>

                    {/* Hover Play Button */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(movie);
                        }}
                        className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
                      >
                        <svg
                          className="w-8 h-8 text-white"
                          fill="white"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                      <h3 className="text-white text-sm font-bold line-clamp-1">
                        {movie.title || movie.original_title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-green-500 text-xs font-bold">
                          {Math.round(movie.vote_average * 10)}%
                        </span>
                        <span className="text-gray-400 text-xs">
                          {getYear(movie.release_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {getGenreNames(movie.genre_ids)
                          .slice(0, 2)
                          .map((g, i) => (
                            <span
                              key={i}
                              className="text-gray-400 text-[10px] bg-gray-800/80 px-1.5 py-0.5 rounded"
                            >
                              {g}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-400 text-lg mb-2">لم يتم العثور على نتائج</p>
              <p className="text-gray-600 text-sm">حاول البحث بكلمات مختلفة</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero Banner */}
          <HeroBanner
            movies={heroMovies}
            onShowDetails={handleShowDetails}
            onPlay={handlePlay}
          />

          {/* Movie Rows */}
          <div className="-mt-20 md:-mt-28 relative z-10">
            {categories.map((category, index) => (
              <MovieRow
                key={index}
                title={category.title}
                movies={category.movies}
                showRank={category.showRank}
                onShowDetails={handleShowDetails}
                onPlay={handlePlay}
              />
            ))}
          </div>
        </>
      )}

      {/* Footer */}
      <Footer />

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={handleCloseModal}
          onPlay={handlePlay}
        />
      )}

      {/* Video Player */}
      {playingMovie && (
        <Player
          movieId={playingMovie.id}
          movieTitle={playingMovie.title}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  );
}
