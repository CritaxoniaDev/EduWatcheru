"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface MovieDetails {
  title: string;
  backdrop_path: string | null;
  poster_path: string | null;
  overview: string;
  release_date: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  runtime: number;
  tagline?: string;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);
  
  // Get the movie ID from the URL params
  const id = params.id as string;
  
  // Obfuscated URL construction
  const getEmbedUrl = (id: string): string => {
    if (!id) return "";
    
    // Obfuscated URL parts
    const _0x4e8d = ['e', 'mb', 'vi', 'to', 'ds', 'rc', '.', '/', 'ed', 'mo', 'vi', 'e'];
    const _0x3f7a = (arr: string[]) => arr.join('');
    
    // Construct base URL in an obfuscated way
    const _0x2c9b = _0x3f7a([
      _0x4e8d[2], _0x4e8d[4], _0x4e8d[5], _0x4e8d[6], 
      _0x4e8d[3], _0x4e8d[7], _0x4e8d[0], _0x4e8d[1], 
      _0x4e8d[8], _0x4e8d[7], _0x4e8d[9], _0x4e8d[10], 
      _0x4e8d[0], _0x4e8d[7]
    ]);
    
    // Return the complete URL
    return `https://${_0x2c9b}${id}`;
  };

  const embedUrl = getEmbedUrl(id);

  // Format runtime from minutes to hours and minutes
  const formatRuntime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    if (!dateString) return "Unknown";
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        // Decode the API key
        const _0x2f1a = ['NTJmZjQ2OWFhN2IyYzhiYjNlZjBkMmI3NzQ4NTE2MGY'];
        const apiKey = atob(_0x2f1a[0]);
        
        // Determine if this is an IMDB ID or TMDB ID
        const isImdbId = id.startsWith('tt');
        
        let movieId;
        
        // If it's an IMDB ID, we need to get the TMDB ID first
        if (isImdbId) {
          const findResponse = await fetch(
            `https://api.themoviedb.org/3/find/${id}?api_key=${apiKey}&external_source=imdb_id`
          );
          
          if (!findResponse.ok) {
            throw new Error("Failed to find movie by IMDB ID");
          }
          
          const findData = await findResponse.json();
          
          if (findData.movie_results && findData.movie_results.length > 0) {
            movieId = findData.movie_results[0].id;
          } else {
            throw new Error("No movie found with this IMDB ID");
          }
        } else {
          movieId = id;
        }
        
        // Now get the full movie details with the TMDB ID
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,similar,videos`
        );
        
        if (!detailsResponse.ok) {
          throw new Error("Failed to fetch movie details");
        }
        
        const detailsData = await detailsResponse.json();
        setMovieDetails(detailsData);

        // Set document title
        document.title = `${detailsData.title} - EduWatcheru`;
      } catch (err) {
        console.error("Error fetching movie details:", err);
        // Set minimal movie details if we couldn't fetch them
        setMovieDetails({
          title: "Movie",
          backdrop_path: null,
          poster_path: null,
          overview: "No description available",
          release_date: "",
          genres: [],
          vote_average: 0,
          runtime: 0
        });
        document.title = "Watch Movie - EduWatcheru";
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }

    // Cleanup function
    return () => {
      document.title = "EduWatcheru - Movie Streaming Platform";
    };
  }, [id]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setPlayerLoading(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerRef.current?.requestFullscreen) {
        playerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        setFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  // Toggle movie info display
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Scroll to player
  const scrollToPlayer = () => {
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Hide info after scrolling to player
    setTimeout(() => setShowInfo(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* Header with glass effect */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-4 px-6 bg-black/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-50 border-b border-gray-800/50"
      >
        <div className="flex items-center">
          <button 
            onClick={() => router.back()} 
            className="mr-4 text-gray-400 hover:text-white transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <Link href="/" className="text-xl font-bold">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              EduWatcheru
            </span>
          </Link>
        </div>
        
        <h1 className="text-lg font-medium truncate max-w-md">
          {loading ? (
            <div className="h-6 w-40 bg-gray-700 animate-pulse rounded"></div>
          ) : (
            movieDetails?.title
          )}
        </h1>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleInfo}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            title={showInfo ? "Hide Info" : "Show Info"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={toggleFullscreen}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            title={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {fullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v4a1 1 0 01-1 1H1a1 1 0 010-2h1V5a3 3 0 013-3h4a1 1 0 010 2H5zm10 8h-1v3a1 1 0 01-1 1H9a1 1 0 010-2h3v-2a1 1 0 112 0v4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </motion.header>

      <main className="flex-grow flex flex-col relative">
        {/* Movie backdrop with parallax effect */}
        {movieDetails?.backdrop_path && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 1 }}
              className="h-full w-full"
            >
              <Image
                src={`https://image.tmdb.org/t/p/original${movieDetails.backdrop_path}`}
                alt={movieDetails.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </motion.div>
          </div>
        )}
        
        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black z-10"
            >
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-r-2 border-l-2 border-purple-500 animate-spin animation-delay-150"></div>
                  <div className="absolute inset-4 rounded-full border-t-2 border-b-2 border-pink-500 animate-spin animation-delay-300"></div>
                </div>
                <p className="text-gray-400 mt-6 font-medium">Loading your movie...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Movie info section with animation */}
        <AnimatePresence>
          {movieDetails && showInfo && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-4 py-8 z-10"
            >
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Movie poster with hover effect */}
                {movieDetails.poster_path && (
                  <motion.div 
                    className="w-full md:w-1/4 lg:w-1/5"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
                        alt={movieDetails.title}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                      />
                    </div>
                  </motion.div>
                )}
                
                {/* Movie details with animations */}
                <div className="w-full md:w-3/4 lg:w-4/5">
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
                  >
                    {movieDetails.title}
                  </motion.h1>
                  
                  {movieDetails.tagline && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-gray-400 italic mb-4"
                    >
                      "{movieDetails.tagline}"
                    </motion.p>
                  )}
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-wrap items-center gap-4 mb-6"
                  >
                    {movieDetails.release_date && (
                      <span className="text-gray-300 bg-gray-800/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(movieDetails.release_date)}
                      </span>
                    )}
                    
                    {movieDetails.runtime > 0 && (
                      <span className="text-gray-300 bg-gray-800/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatRuntime(movieDetails.runtime)}
                      </span>
                    )}
                    
                    {movieDetails.vote_average > 0 && (
                      <span className="flex items-center bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-yellow-500 font-semibold">{movieDetails.vote_average.toFixed(1)}</span>
                        <span className="text-gray-300 ml-1">/10</span>
                      </span>
                    )}
                  </motion.div>
                  
                  {movieDetails.genres && movieDetails.genres.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="flex flex-wrap gap-2 mb-6"
                    >
                      {movieDetails.genres.map((genre, index) => (
                        <motion.span 
                          key={genre.id} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                          className="px-3 py-1 bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-sm rounded-full text-sm border border-blue-500/20"
                        >
                          {genre.name}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-gray-300 mb-8 leading-relaxed"
                  >
                    {movieDetails.overview || "No description available for this movie."}
                  </motion.p>
                  
                  {/* Production companies */}
                  {movieDetails.production_companies && movieDetails.production_companies.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="mb-8"
                    >
                      <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Production</h3>
                      <div className="flex flex-wrap gap-6">
                        {movieDetails.production_companies.slice(0, 4).map((company) => (
                          company.logo_path ? (
                            <div key={company.id} className="h-12 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center">
                              <div className="relative h-8 w-16">
                                <Image
                                  src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                                  alt={company.name}
                                  fill
                                  className="object-contain"
                                  unoptimized
                                />
                              </div>
                            </div>
                          ) : (
                            <div key={company.id} className="h-12 bg-white/10 backdrop-blur-sm rounded-lg px-4 flex items-center">
                              <span className="text-sm text-gray-300">{company.name}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    onClick={scrollToPlayer}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center shadow-lg shadow-red-600/20 hover:shadow-red-600/40"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Watch Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Video player section with enhanced UI */}
        <div 
          id="movie-player"
          ref={playerRef}
          className="w-full aspect-video bg-black relative mt-auto"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Player loading overlay */}
          <AnimatePresence>
            {playerLoading && (
              <motion.div 
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center bg-black z-10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-blue-400">Loading player...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Ad blocker */}
          <div className="absolute inset-0 pointer-events-none z-[5]"></div>
          
          {/* The iframe */}
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allowFullScreen
            onLoad={handleIframeLoad}
            style={{ backgroundColor: "#000" }}
          ></iframe>
        </div>
        
        {/* Ad blocker notification */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-md p-4 text-center">
          <p className="text-sm text-blue-200">
            <span className="font-semibold">✓ Ad-Free Experience Enabled</span> - Enjoy your movie without interruptions!
          </p>
        </div>
      </main>

      <footer className="py-4 px-6 bg-black/80 backdrop-blur-md text-center text-gray-400 text-sm border-t border-gray-800/30">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} EduWatcheru. For educational purposes only.</p>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            <span className="text-xs px-2 py-1 bg-blue-900/30 rounded-full">Ad-Free</span>
            <span className="text-xs px-2 py-1 bg-green-900/30 rounded-full">HD Quality</span>
            <span className="text-xs px-2 py-1 bg-purple-900/30 rounded-full">No Sign-up</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
