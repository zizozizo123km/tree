const API_KEY = "677d80a0a8bfabdd396f0938c0822f24";
const BEARER_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2NzdkODBhMGE4YmZhYmRkMzk2ZjA5MzhjMDgyMmYyNCIsIm5iZiI6MTc3MzE4OTk2OS44NDUsInN1YiI6IjY5YjBiYjUxZDIxYTQyMGFkZDM3MjZiZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UVrSTaE90gm08ZZ9xvpLbnsFX11OOrUaD6WDWlMp8g0";

const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE = "https://image.tmdb.org/t/p";
export const PLAYER_BASE = "https://cinemaos.tech/player";

const headers = {
  Authorization: `Bearer ${BEARER_TOKEN}`,
  "Content-Type": "application/json;charset=utf-8",
};

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "ar");
  url.searchParams.set("region", "SA");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`TMDB Error: ${res.status}`);
  return res.json();
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  media_type?: string;
}

export interface TMDBMovieDetail extends TMDBMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  imdb_id: string | null;
  tagline: string;
  status: string;
  budget: number;
  revenue: number;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  spoken_languages: { english_name: string; name: string }[];
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBExternalIds {
  imdb_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
}

export interface TMDBCredits {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
  name: string;
}

// Fetch functions
export async function getTrending(): Promise<TMDBMovie[]> {
  const data: TMDBResponse = await fetchTMDB("/trending/movie/week");
  return data.results;
}

export async function getPopular(): Promise<TMDBMovie[]> {
  const data: TMDBResponse = await fetchTMDB("/movie/popular");
  return data.results;
}

export async function getTopRated(): Promise<TMDBMovie[]> {
  const data: TMDBResponse = await fetchTMDB("/movie/top_rated");
  return data.results;
}

export async function getNowPlaying(): Promise<TMDBMovie[]> {
  const data: TMDBResponse = await fetchTMDB("/movie/now_playing");
  return data.results;
}

export async function getUpcoming(): Promise<TMDBMovie[]> {
  const data: TMDBResponse = await fetchTMDB("/movie/upcoming");
  return data.results;
}

export async function getByGenre(genreId: number): Promise<TMDBMovie[]> {
  const data: TMDBResponse = await fetchTMDB("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
  });
  return data.results;
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetail> {
  return fetchTMDB(`/movie/${movieId}`);
}

export async function getExternalIds(movieId: number): Promise<TMDBExternalIds> {
  return fetchTMDB(`/movie/${movieId}/external_ids`);
}

export async function getCredits(movieId: number): Promise<TMDBCredits> {
  return fetchTMDB(`/movie/${movieId}/credits`);
}

export async function getSimilar(movieId: number): Promise<TMDBMovie[]> {
  const data: TMDBResponse = await fetchTMDB(`/movie/${movieId}/similar`);
  return data.results;
}

export async function getVideos(movieId: number): Promise<TMDBVideo[]> {
  const data = await fetchTMDB(`/movie/${movieId}/videos`, { language: "en-US" });
  return data.results || [];
}

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  if (!query.trim()) return [];
  const data: TMDBResponse = await fetchTMDB("/search/movie", { query });
  return data.results;
}

// Helpers
export function posterUrl(path: string | null, size = "w500"): string {
  if (!path) return "https://via.placeholder.com/500x750/1a1a1a/333?text=No+Image";
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = "original"): string {
  if (!path) return "https://via.placeholder.com/1920x1080/1a1a1a/333?text=No+Image";
  return `${IMAGE_BASE}/${size}${path}`;
}

export function playerUrl(imdbId: string): string {
  return `${PLAYER_BASE}/${imdbId}`;
}

export function getYear(date: string): string {
  return date ? date.split("-")[0] : "";
}

// Genre ID map
export const GENRE_MAP: Record<number, string> = {
  28: "أكشن",
  12: "مغامرة",
  16: "رسوم متحركة",
  35: "كوميدي",
  80: "جريمة",
  99: "وثائقي",
  18: "دراما",
  10751: "عائلي",
  14: "خيال",
  36: "تاريخي",
  27: "رعب",
  10402: "موسيقي",
  9648: "غموض",
  10749: "رومانسي",
  878: "خيال علمي",
  10770: "تلفزيوني",
  53: "إثارة",
  10752: "حربي",
  37: "غربي",
};

export function getGenreNames(genreIds: number[]): string[] {
  return genreIds.map((id) => GENRE_MAP[id] || "أخرى").filter(Boolean);
}
