"use client";

import { useEffect, useState } from "react";
import MovieCard, { Movie } from "@/components/MovieCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Categories we'll display
const MOVIE_CATEGORIES = [
  { title: "Popular Movies", endpoint: "/movie/popular" },
  { title: "Top Rated Movies", endpoint: "/movie/top_rated" },
  { title: "Now Playing", endpoint: "/movie/now_playing" },
  { title: "Upcoming Movies", endpoint: "/movie/upcoming" }
];

export default function MoviesPage() {
  const [movieCategories, setMovieCategories] = useState<{ title: string; movies: Movie[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decode the API key
  const _0x2f1a = ['NTJmZjQ2OWFhN2IyYzhiYjNlZjBkMmI3NzQ4NTE2MGY'];
  const getSecureConfig = () => {
    return {
      k: (() => atob(_0x2f1a[0]))(),
      b: 'https://api.themoviedb.org/3',
      i: 'https://image.tmdb.org/t/p/w500'
    };
  };

  const config = getSecureConfig();

  useEffect(() => {
    const fetchMovieCategories = async () => {
      try {
        setLoading(true);
        
        const categoriesData = await Promise.all(
          MOVIE_CATEGORIES.map(async (category) => {
            const response = await fetch(
              `${config.b}${category.endpoint}?api_key=${config.k}&language=en-US&page=1`
            );
            
            if (!response.ok) {
              throw new Error(`Failed to fetch ${category.title}`);
            }
            
            const data = await response.json();
            
            // Add media_type to each movie
            const formattedMovies = data.results.map((movie: any) => ({
              ...movie,
              media_type: "movie"
            }));
            
            return {
              title: category.title,
              movies: formattedMovies.slice(0, 6) // Limit to 6 movies per category
            };
          })
        );
        
        setMovieCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieCategories();
  }, []);

  // Function to get movie details including IMDB ID
  const getMovieDetails = async (movieId: number) => {
    try {
      const response = await fetch(
        `${config.b}/movie/${movieId}?api_key=${config.k}&append_to_response=external_ids`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }
      
      const data = await response.json();
      return data.imdb_id || `${movieId}`;
    } catch (err) {
      console.error("Error fetching movie details:", err);
      return `${movieId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-8 bg-red-100/10 rounded-lg">
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-12">
            {movieCategories.map((category, index) => (
              <section key={index}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                  <a href="#" className="text-blue-400 hover:underline text-sm">View All</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {category.movies.map((movie) => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      imageBaseUrl={config.i}
                      getMovieDetails={getMovieDetails}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
