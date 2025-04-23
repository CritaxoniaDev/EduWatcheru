"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MovieCard, { Movie } from "@/components/MovieCard";
import Header from "@/components/Header";
import Link from "next/link";

// Define types for search results
interface SearchResult extends Movie {
  media_type: "movie" | "tv" | "person";
  name?: string; // For TV shows
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

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

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${config.b}/search/multi?api_key=${config.k}&language=en-US&query=${encodeURIComponent(query)}&page=${currentPage}&include_adult=false`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }
        
        const data = await response.json();
        
        // Filter out people and format movie/TV show results
        const formattedResults = data.results
          .filter((item: any) => item.media_type !== "person")
          .map((item: any) => ({
            ...item,
            // Ensure title is set for both movies and TV shows
            title: item.title || item.name,
            // Set a default poster path if none exists
            poster_path: item.poster_path || null
          }));
        
        setResults(formattedResults);
        setTotalResults(data.total_results);
        setTotalPages(data.total_pages);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to load search results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage]);

  // Function to get movie details including IMDB ID
  const getMovieDetails = async (movieId: number) => {
    try {
      const mediaType = results.find(item => item.id === movieId)?.media_type || "movie";
      
      const response = await fetch(
        `${config.b}/${mediaType}/${movieId}?api_key=${config.k}&append_to_response=external_ids`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch details");
      }
      
      const data = await response.json();
      return data.imdb_id || data.external_ids?.imdb_id || `${movieId}`;
    } catch (err) {
      console.error("Error fetching details:", err);
      return `${movieId}`;
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Search Results for "{query}"
          </h1>
          {totalResults > 0 && !loading && (
            <p className="text-gray-400">
              Found {totalResults} results
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-l-2 border-purple-500 animate-spin animation-delay-150"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-8 bg-red-100/10 rounded-lg">
            <p>{error}</p>
          </div>
        ) : results.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center p-12 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50"
          >
            <div className="flex justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">No results found</h2>
            <p className="text-gray-400 mb-6">
              We couldn't find any movies or TV shows matching "{query}".
            </p>
            <div className="flex justify-center">
              <Link 
                href="/"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <AnimatePresence>
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <MovieCard 
                      movie={result} 
                      imageBaseUrl={config.i}
                      getMovieDetails={getMovieDetails}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Calculate page numbers to show (centered around current page)
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="py-8 px-4 bg-gray-800/50 backdrop-blur-sm text-center mt-12 border-t border-gray-700/30">
        <div className="container mx-auto">
          <p className="text-gray-400 mb-4">
            Data provided by The Movie Database (TMDB)
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
