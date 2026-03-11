import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";
import type { TMDBMovie } from "../api/tmdb";

interface MovieRowProps {
  title: string;
  movies: TMDBMovie[];
  showRank?: boolean;
  onShowDetails: (movie: TMDBMovie) => void;
  onPlay: (movie: TMDBMovie) => void;
}

export default function MovieRow({
  title,
  movies,
  showRank,
  onShowDetails,
  onPlay,
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      const newScrollLeft =
        direction === "left"
          ? rowRef.current.scrollLeft - scrollAmount
          : rowRef.current.scrollLeft + scrollAmount;

      rowRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      setShowLeftArrow(rowRef.current.scrollLeft > 20);
      setShowRightArrow(
        rowRef.current.scrollLeft <
          rowRef.current.scrollWidth - rowRef.current.clientWidth - 20
      );
    }
  };

  if (!movies.length) return null;

  return (
    <div className="mb-8 md:mb-10 relative group/row">
      {/* Title */}
      <h2
        className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 md:mb-4 px-4 md:px-12 flex items-center gap-2"
        dir="rtl"
      >
        {title}
        <span className="text-red-500 text-sm font-normal opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer">
          عرض الكل ❯
        </span>
      </h2>

      {/* Row Container */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 md:w-14 bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-r-md"
          >
            <ChevronLeft size={36} className="text-white" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 md:w-14 bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-l-md"
          >
            <ChevronRight size={36} className="text-white" />
          </button>
        )}

        {/* Scrollable Row */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          dir="ltr"
        >
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              index={index}
              showRank={showRank}
              onShowDetails={onShowDetails}
              onPlay={onPlay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
