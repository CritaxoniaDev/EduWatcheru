"use client";

import { useEffect, useState } from "react";
import MovieCard, { Movie } from "@/components/MovieCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Updated categories - only latest and popular
const CATEGORIES = [
  { title: "Popular Movies", endpoint: "/movie/popular" },
  { title: "Latest Releases", endpoint: "/movie/now_playing" }
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
              movies: data.results.slice(0, 12) // Show more movies per category
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
              <motion.div
                className="relative w-full h-[85vh] mb-20 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
              >
                {/* Background Image with Enhanced Overlays */}
                <div className="absolute inset-0">
                  {/* Multi-layered gradient overlays for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10" />

                  {featuredMovie.backdrop_path ? (
                    <Image
                      src={`${config.o}${featuredMovie.backdrop_path}`}
                      alt={featuredMovie.title}
                      fill
                      className="object-cover scale-105 transition-transform duration-[20s] ease-out"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
                  )}
                </div>

                {/* Content Container */}
                <div className="relative z-20 flex flex-col justify-center h-full px-8 md:px-16 max-w-6xl">
                  <motion.div
                    className="space-y-6 max-w-2xl"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    {/* Netflix-style title */}
                    <motion.h1
                      className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight"
                      style={{
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'
                      }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    >
                      {featuredMovie.title}
                    </motion.h1>

                    {/* Compact metadata row */}
                    <motion.div
                      className="flex items-center space-x-4 text-sm md:text-base"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                    >
                      <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-xs uppercase tracking-wide">
                        Featured
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-green-400 font-semibold">
                          {Math.round(featuredMovie.vote_average * 10)}% Match
                        </span>
                      </div>
                      <span className="text-gray-300 font-medium">
                        {featuredMovie.release_date?.split('-')[0] || 'Coming Soon'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-yellow-400 font-semibold">
                          {featuredMovie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    </motion.div>

                    {/* Clean description */}
                    <motion.p
                      className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-xl font-light"
                      style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.9 }}
                    >
                      {truncateText(featuredMovie.overview, 180)}
                    </motion.p>

                    {/* Netflix-style action buttons */}
                    <motion.div
                      className="flex items-center space-x-4 pt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.1 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link
                          href={`/watch/movie/${featuredMovie.id}`}
                          className="bg-white text-black hover:bg-gray-200 transition-all duration-200 px-8 py-3 rounded-md font-bold text-lg flex items-center space-x-3 shadow-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          <span>Play</span>
                        </Link>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <button
                          className="bg-gray-600/70 hover:bg-gray-500/70 backdrop-blur-sm transition-all duration-200 px-6 py-3 rounded-md font-semibold text-white flex items-center space-x-3 border border-gray-500/30"
                          onClick={() => getMovieDetails(featuredMovie.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>More Info</span>
                        </button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Subtle bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent z-15" />
              </motion.div>
            )}

            {/* Movie Categories - Netflix Style */}
            <div className="space-y-16">
              {movieCategories.map((category, index) => (
                <motion.section 
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Category Header */}
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                      {category.title}
                    </h2>
                    <Link 
                      href="#" 
                      className="text-blue-400 hover:text-blue-300 transition-colors text-lg font-medium group"
                    >
                      <span className="flex items-center space-x-2">
                        <span>View All</span>
                        <svg 
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  </div>

                  {/* Movies Grid - Responsive Netflix-style */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {category.movies.map((movie, movieIndex) => (
                      <motion.div
                        key={movie.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: movieIndex * 0.1,
                          ease: "easeOut"
                        }}
                      >
                        <MovieCard
                          movie={movie}
                          imageBaseUrl={config.i}
                          getMovieDetails={getMovieDetails}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>

            {/* Additional Content Section */}
            <motion.section 
              className="mt-20 py-16 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl backdrop-blur-sm border border-gray-700/30"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="text-center px-8">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Discover More Entertainment
                </h3>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Explore thousands of movies and TV shows. From blockbuster hits to hidden gems, 
                  find your next favorite watch.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/search"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Browse All</span>
                  </Link>
                  <Link
                    href="/genres"
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 14H5" />
                    </svg>
                    <span>By Genre</span>
                  </Link>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
