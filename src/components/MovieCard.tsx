"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Types for our movie data
// Update the Movie interface to handle both movies and TV shows
export interface Movie {
    backdrop_path: any;
    id: number;
    title: string;
    name?: string; // For TV shows
    poster_path: string | null;
    overview: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string; // For TV shows
    media_type?: "movie" | "tv" | "person";
    imdb_id?: string;
}

export interface MovieCardProps {
    movie: Movie;
    imageBaseUrl: string;
    getMovieDetails: (id: number) => Promise<string>;
}

export default function MovieCard({ movie, imageBaseUrl, getMovieDetails }: MovieCardProps) {
    const [imdbId, setImdbId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showOverview, setShowOverview] = useState(false);

    // Get the release date (works for both movies and TV shows)
    const releaseDate = movie.release_date || movie.first_air_date;
    const releaseYear = releaseDate?.split('-')[0] || 'N/A';

    // Determine media type (default to movie if not specified)
    const mediaType = movie.media_type || "movie";

    const handleWatchClick = async () => {
        if (imdbId) return; // Already have the ID

        setLoading(true);
        const id = await getMovieDetails(movie.id);
        setImdbId(id);
        setLoading(false);
    };

    // Updated to direct to different pages based on media type
    // For TV shows, we'll include season and episode parameters (default to season 1, episode 1)
    const getWatchUrl = (id: string | null): string => {
        if (!id) return "";
        
        if (mediaType === "tv") {
            // For TV shows, direct to the TV watch page with season 1, episode 1 as default
            return `/watch/tv/${id}`;
        } else {
            // For movies, direct to the movie watch page
            return `/watch/movie/${id}`;
        }
    };

    // Get the title (works for both movies and TV shows)
    const title = movie.title || movie.name || "Unknown Title";

    // Truncate overview text
    const truncatedOverview = movie.overview && movie.overview.length > 120
        ? `${movie.overview.substring(0, 120)}...`
        : movie.overview;

    // Get rating color based on score
    const getRatingColor = (rating: number) => {
        if (rating >= 8) return "from-green-400 to-emerald-500";
        if (rating >= 7) return "from-yellow-400 to-orange-500";
        if (rating >= 6) return "from-orange-400 to-red-500";
        return "from-red-400 to-red-600";
    };

    return (
        <motion.div
            className="group relative bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl overflow-hidden shadow-2xl h-full flex flex-col border border-slate-700/50"
            whileHover={{
                scale: 1.05,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            }}
            transition={{ 
                duration: 0.3,
                ease: "easeOut"
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            
            <div
                className="relative h-72 overflow-hidden cursor-pointer"
                onMouseEnter={() => setShowOverview(true)}
                onMouseLeave={() => setShowOverview(false)}
            >
                {movie.poster_path ? (
                    <>
                        <Image
                            src={`${imageBaseUrl}${movie.poster_path}`}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                            unoptimized
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        {/* Overview overlay */}
                        <motion.div 
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: showOverview ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="text-center">
                                <p className="text-sm text-gray-200 leading-relaxed mb-4 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
                                    {truncatedOverview || "No description available."}
                                </p>
                                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                                    <span>Hover to read more</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-600 flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                    </div>
                )}

                {/* Rating badge with gradient */}
                <div className={`absolute top-3 right-3 bg-gradient-to-r ${getRatingColor(movie.vote_average)} text-white font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-2 border-white/20`}>
                    <span className="text-xs font-extrabold">{movie.vote_average.toFixed(1)}</span>
                </div>

                {/* Media type badge with glow */}
                <div className={`absolute top-3 left-3 ${mediaType === "tv" ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20`}>
                    <span className="flex items-center space-x-1">
                        {mediaType === "tv" ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM4 4v12h12V4H4z"/>
                            </svg>
                        ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span>{mediaType === "tv" ? "TV" : "Movie"}</span>
                    </span>
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col relative">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                </div>
                
                <div className="relative z-10">
                    <h3 className="font-bold text-xl text-white mb-3 line-clamp-2 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300" title={title}>
                        {title}
                    </h3>

                    <div className="flex justify-between items-center mb-6">
                        <span className="text-sm text-gray-300 bg-gradient-to-r from-slate-700 to-slate-600 px-3 py-1.5 rounded-full border border-slate-600/50 shadow-inner">
                            {releaseYear}
                        </span>

                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400 font-medium">TMDB</span>
                            <div className="flex items-center space-x-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="text-yellow-400 font-semibold text-sm">
                                    {movie.vote_average.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        {imdbId ? (
                            <Link
                                href={getWatchUrl(imdbId)}
                                className={`block w-full text-white text-center py-3 rounded-xl transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                    mediaType === "tv" 
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25" 
                                        : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/25"
                                } border border-white/10`}
                            >
                                <span className="flex items-center justify-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    <span>Watch {mediaType === "tv" ? "Episode" : "Now"}</span>
                                </span>
                            </Link>
                        ) : (
                            <motion.button
                                onClick={handleWatchClick}
                                disabled={loading}
                                className={`w-full text-white py-3 rounded-xl transition-all duration-300 font-semibold text-sm shadow-lg border border-white/10 disabled:opacity-70 ${
                                    mediaType === "tv" 
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-purple-700 disabled:to-pink-700 shadow-purple-500/25" 
                                        : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-blue-700 disabled:to-cyan-700 shadow-blue-500/25"
                                }`}
                                whileHover={{ scale: loading ? 1 : 1.05 }}
                                whileTap={{ scale: loading ? 1 : 0.95 }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center space-x-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Loading...</span>
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center space-x-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                        <span>Get Watch Link</span>
                                    </span>
                                )}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating particles effect on hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            </div>
        </motion.div>
    );
}
