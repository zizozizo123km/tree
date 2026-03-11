import { useState } from "react";
import { Play, Plus, ThumbsUp, ChevronDown, Check } from "lucide-react";
import type { TMDBMovie } from "../api/tmdb";
import { posterUrl, getGenreNames, getYear } from "../api/tmdb";

interface MovieCardProps {
  movie: TMDBMovie;
  index: number;
  showRank?: boolean;
  onShowDetails: (movie: TMDBMovie) => void;
  onPlay: (movie: TMDBMovie) => void;
}

export default function MovieCard({
  movie,
  index,
  showRank,
  onShowDetails,
  onPlay,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [inList, setInList] = useState(false);
  const [liked, setLiked] = useState(false);

  const matchPercent = Math.round(movie.vote_average * 10);

  return (
    <div
      className="relative flex-shrink-0 w-[140px] md:w-[200px] lg:w-[220px] cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onShowDetails(movie)}
    >
      {/* Rank Number */}
      {showRank && (
        <div className="absolute -right-2 bottom-0 z-10 pointer-events-none">
          <span
            className="text-7xl md:text-8xl font-black text-transparent select-none"
            style={{
              WebkitTextStroke: "2px rgba(255,255,255,0.25)",
            }}
          >
            {index + 1}
          </span>
        </div>
      )}

      {/* Card Image */}
      <div className="relative rounded-md overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:z-30 shadow-lg group-hover:shadow-2xl group-hover:shadow-black/60">
        <img
          src={posterUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover bg-gray-900"
          loading="lazy"
        />

        {/* Rating Badge */}
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 flex items-center gap-1">
          <span className="text-yellow-500 text-xs">⭐</span>
          <span className="text-white text-xs font-bold">
            {movie.vote_average.toFixed(1)}
          </span>
        </div>

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Hover Content */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          dir="rtl"
        >
          <h3 className="text-white text-sm font-bold mb-2 line-clamp-1">
            {movie.title || movie.original_title}
          </h3>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(movie);
              }}
              className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-md"
            >
              <Play size={14} fill="black" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setInList(!inList);
              }}
              className={`border-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                inList
                  ? "border-green-500 text-green-500"
                  : "border-gray-400 text-gray-400 hover:border-white hover:text-white"
              }`}
            >
              {inList ? <Check size={14} /> : <Plus size={14} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLiked(!liked);
              }}
              className={`border-2 rounded-full w-8 h-8 flex items-center justify-center transition-colors ${
                liked
                  ? "border-blue-500 text-blue-500"
                  : "border-gray-400 text-gray-400 hover:border-white hover:text-white"
              }`}
            >
              <ThumbsUp size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowDetails(movie);
              }}
              className="border-2 border-gray-400 text-gray-400 rounded-full w-8 h-8 flex items-center justify-center hover:border-white hover:text-white transition-colors mr-auto"
            >
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-500 font-bold">{matchPercent}%</span>
            <span className="border border-gray-500 text-gray-400 px-1 text-[10px] rounded">
              {movie.adult ? "+18" : "+13"}
            </span>
            <span className="text-gray-400">{getYear(movie.release_date)}</span>
          </div>

          {/* Genres */}
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            {getGenreNames(movie.genre_ids)
              .slice(0, 2)
              .map((g, i) => (
                <span key={i} className="text-gray-400 text-[10px]">
                  {g}
                  {i < 1 && <span className="mx-0.5 text-gray-600">•</span>}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
