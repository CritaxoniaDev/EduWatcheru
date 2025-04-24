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

    return (
        <motion.div
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg h-full flex flex-col"
            whileHover={{
                scale: 1.03,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
            }}
            transition={{ duration: 0.3 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div
                className="relative h-64 overflow-hidden group cursor-pointer"
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
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            unoptimized
                        />
                        <div className={`absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 transition-opacity duration-300 ${showOverview ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="text-sm text-white overflow-y-auto max-h-full scrollbar-thin scrollbar-thumb-gray-500">
                                {truncatedOverview || "No description available."}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                        <span>No Image</span>
                    </div>
                )}

                <div className="absolute top-2 right-2 bg-yellow-500 text-black font-bold rounded-full w-10 h-10 flex items-center justify-center">
                    {movie.vote_average.toFixed(1)}
                </div>

                {/* Media type badge */}
                <div className="absolute top-2 left-2 bg-blue-600/80 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {mediaType === "tv" ? "TV" : "Movie"}
                </div>
            </div>

            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-lg truncate mb-1" title={title}>
                    {title}
                </h3>

                <div className="flex justify-between items-center mt-1 mb-4">
                    <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        {releaseYear}
                    </span>

                    <div className="flex items-center">
                        <span className="text-xs text-gray-400 mr-1">TMDB</span>
                        <span className="text-yellow-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {movie.vote_average.toFixed(1)}
                        </span>
                    </div>
                </div>

                <div className="mt-auto">
                    {imdbId ? (
                        <Link
                            href={getWatchUrl(imdbId)}
                            className={`block w-full text-white text-center py-2 rounded-md transition-colors font-medium ${mediaType === "tv" ? "bg-purple-600 hover:bg-purple-700" : "bg-red-600 hover:bg-red-700"}`}
                        >
                            <span className="flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Watch {mediaType === "tv" ? "Episode" : "Now"}
                            </span>
                        </Link>
                    ) : (
                        <button
                            onClick={handleWatchClick}
                            disabled={loading}
                            className={`w-full text-white py-2 rounded-md transition-colors font-medium ${mediaType === "tv" ? "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800" : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    Get Watch Link
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
