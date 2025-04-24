"use client";

import { useEffect, useState } from "react";
import MovieCard, { Movie } from "@/components/MovieCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

// Categories we'll display
const CATEGORIES = [
  { title: "Popular Movies", endpoint: "/movie/popular" },
  { title: "Top Rated Movies", endpoint: "/movie/top_rated" },
  { title: "Now Playing", endpoint: "/movie/now_playing" },
  { title: "Upcoming Movies", endpoint: "/movie/upcoming" }
];

export default function Home() {
  const [movieCategories, setMovieCategories] = useState<{ title: string; movies: Movie[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);

  // Decode the API key
  const _0x2f1a = ['NTJmZjQ2OWFhN2IyYzhiYjNlZjBkMmI3NzQ4NTE2MGY'];
  const getSecureConfig = () => {
    return {
      k: (() => atob(_0x2f1a[0]))(),
      b: 'https://api.themoviedb.org/3',
      i: 'https://image.tmdb.org/t/p/w500',
      o: 'https://image.tmdb.org/t/p/original'
    };
  };

  const config = getSecureConfig();

  useEffect(() => {
    const fetchMovieCategories = async () => {
      try {
        setLoading(true);
        
        const categoriesData = await Promise.all(
          CATEGORIES.map(async (category) => {
            const response = await fetch(
              `${config.b}${category.endpoint}?api_key=${config.k}&language=en-US&page=1`
            );
            
            if (!response.ok) {
              throw new Error(`Failed to fetch ${category.title}`);
            }
            
            const data = await response.json();
            
            // Set featured movie from popular movies
            if (category.endpoint === "/movie/popular" && !featuredMovie) {
              // Pick a random movie from the top 5 popular movies
              const randomIndex = Math.floor(Math.random() * 5);
              setFeaturedMovie(data.results[randomIndex]);
            }
            
            return {
              title: category.title,
              movies: data.results.slice(0, 6) // Limit to 6 movies per category
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

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
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
          <>
            {/* Hero Section - Featured Movie */}
            {featuredMovie && (
              <div className="relative w-full h-[70vh] mb-16 rounded-xl overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
                  {featuredMovie.backdrop_path ? (
                    <Image 
                      src={`${config.o}${featuredMovie.backdrop_path}`}
                      alt={featuredMovie.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                </div>
                
                {/* Content */}
                <div className="relative z-20 flex flex-col justify-end h-full p-8 md:p-16 max-w-3xl">
                  <div className="animate-fadeIn">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow-lg">
                      {featuredMovie.title}
                    </h1>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold">
                        FEATURED
                      </span>
                      <span className="text-green-400 font-semibold">
                        {Math.round(featuredMovie.vote_average * 10)}% Match
                      </span>
                      <span className="text-gray-300">
                        {featuredMovie.release_date?.split('-')[0] || 'Coming Soon'}
                      </span>
                    </div>
                    
                    <p className="text-lg text-gray-200 mb-8 max-w-2xl text-shadow-md">
                      {truncateText(featuredMovie.overview, 200)}
                    </p>
                    
                    <div className="flex flex-wrap gap-4">
                      <Link 
                        href={`/watch/movie/${featuredMovie.id}`}
                        className="bg-white text-black hover:bg-gray-200 transition px-8 py-3 rounded-md font-bold flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Watch Now
                      </Link>
                      <button 
                        className="bg-gray-700/80 hover:bg-gray-600 transition px-6 py-3 rounded-md font-bold flex items-center gap-2"
                        onClick={() => getMovieDetails(featuredMovie.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        More Info
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Movie Categories */}
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
