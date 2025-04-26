"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface TVShowDetails {
  name: string;
  backdrop_path: string | null;
  poster_path: string | null;
  overview: string;
  first_air_date: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  episode_run_time: number[];
  tagline?: string;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
  seasons?: {
    id: number;
    name: string;
    episode_count: number;
    poster_path: string | null;
    season_number: number;
    air_date: string | null;
  }[];
  number_of_seasons?: number;
  number_of_episodes?: number;
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string | null;
  air_date: string | null;
}

export default function TVWatchPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [tvDetails, setTVDetails] = useState<TVShowDetails | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const playerRef = useRef<HTMLDivElement>(null);

  // Get the TV show ID from the URL params
  const id = params.id as string;

  // Obfuscated URL construction for TV shows
  const getEmbedUrl = (id: string, season: number, episode: number): string => {
    if (!id) return "";

    // Obfuscated URL parts
    const _0x4e8d = ['v', 'id', 's', 'rc', '.', 'x', 'y', 'z', '/', 'e', 'm', 'b', 'ed', 'tv'];
    const _0x3f7a = (arr: string[]) => arr.join('');

    // Construct base URL in an obfuscated way
    const _0x2c9b = _0x3f7a([
      _0x4e8d[0], _0x4e8d[1], _0x4e8d[2], _0x4e8d[3],
      _0x4e8d[4], _0x4e8d[5], _0x4e8d[6], _0x4e8d[7]
    ]);

    // Create the actual URL with "embed" instead of "ed"
    return `https://${_0x2c9b}/embed/${_0x4e8d[13]}/${id}/${season}/${episode}`;
  };

  // Then modify the component to include:
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl = getEmbedUrl(id, selectedSeason, selectedEpisode);

  // Use an effect to set the iframe src after component mounts
  useEffect(() => {
    if (iframeRef.current) {
      // Small delay to ensure it's not easily traceable
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = embedUrl;
        }
      }, 100);
    }
  }, [embedUrl]);

  // Format runtime from minutes to hours and minutes
  const formatRuntime = (minutes: number): string => {
    if (!minutes) return "Unknown";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Format date to readable format
  const formatDate = (dateString: string): string => {
    if (!dateString) return "Unknown";
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Fetch TV show details
  useEffect(() => {
    const fetchTVDetails = async () => {
      try {
        // Decode the API key
        const _0x2f1a = ['NTJmZjQ2OWFhN2IyYzhiYjNlZjBkMmI3NzQ4NTE2MGY'];
        const apiKey = atob(_0x2f1a[0]);

        // Determine if this is an IMDB ID or TMDB ID
        const isImdbId = id.startsWith('tt');

        let tvId;

        // If it's an IMDB ID, we need to get the TMDB ID first
        if (isImdbId) {
          const findResponse = await fetch(
            `https://api.themoviedb.org/3/find/${id}?api_key=${apiKey}&external_source=imdb_id`
          );

          if (!findResponse.ok) {
            throw new Error("Failed to find TV show by IMDB ID");
          }

          const findData = await findResponse.json();

          if (findData.tv_results && findData.tv_results.length > 0) {
            tvId = findData.tv_results[0].id;
          } else {
            throw new Error("No TV show found with this IMDB ID");
          }
        } else {
          tvId = id;
        }

        // Now get the full TV show details with the TMDB ID
        const detailsResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey}&append_to_response=credits,similar,videos`
        );

        if (!detailsResponse.ok) {
          throw new Error("Failed to fetch TV show details");
        }

        const detailsData = await detailsResponse.json();
        setTVDetails(detailsData);

        // Fetch episodes for the first season by default
        fetchEpisodes(tvId, 1);

        // Set document title
        document.title = `${detailsData.name} - EduWatcheru`;
      } catch (err) {
        console.error("Error fetching TV show details:", err);
        // Set minimal TV show details if we couldn't fetch them
        setTVDetails({
          name: "TV Show",
          backdrop_path: null,
          poster_path: null,
          overview: "No description available",
          first_air_date: "",
          genres: [],
          vote_average: 0,
          episode_run_time: []
        });
        document.title = "Watch TV Show - EduWatcheru";
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTVDetails();
    }

    // Cleanup function
    return () => {
      document.title = "EduWatcheru - TV Streaming Platform";
    };
  }, [id]);

  // Fetch episodes for a specific season
  // Fetch episodes for a specific season
  const fetchEpisodes = async (tvId: string | number, seasonNumber: number) => {
    try {
      setPlayerLoading(true);

      // Decode the API key
      const _0x2f1a = ['NTJmZjQ2OWFhN2IyYzhiYjNlZjBkMmI3NzQ4NTE2MGY'];
      const apiKey = atob(_0x2f1a[0]);

      // Determine if this is an IMDB ID or TMDB ID
      const isImdbId = typeof tvId === 'string' && tvId.startsWith('tt');
      let tmdbId = tvId;

      // If it's an IMDB ID, we need to get the TMDB ID first
      if (isImdbId) {
        const findResponse = await fetch(
          `https://api.themoviedb.org/3/find/${tvId}?api_key=${apiKey}&external_source=imdb_id`
        );

        if (!findResponse.ok) {
          throw new Error("Failed to find TV show by IMDB ID");
        }

        const findData = await findResponse.json();

        if (findData.tv_results && findData.tv_results.length > 0) {
          tmdbId = findData.tv_results[0].id;
        } else {
          throw new Error("No TV show found with this IMDB ID");
        }
      }

      // Now fetch the season episodes with the TMDB ID
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}?api_key=${apiKey}`
      );

      if (!response.ok) {
        console.error(`Failed to fetch season episodes: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch season episodes: ${response.status}`);
      }

      const data = await response.json();

      if (data.episodes && data.episodes.length > 0) {
        setEpisodes(data.episodes);
        // Auto-select first episode when changing seasons
        setSelectedEpisode(1);
      } else {
        setEpisodes([]);
      }
    } catch (err) {
      console.error("Error fetching episodes:", err);
      setEpisodes([]);
    } finally {
      setPlayerLoading(false);
    }
  };

  // Handle season change
  const handleSeasonChange = (seasonNumber: number) => {
    if (seasonNumber === selectedSeason) return;

    setSelectedSeason(seasonNumber);
    if (tvDetails) {
      fetchEpisodes(id, seasonNumber);
    }
  };

  // Handle episode change
  const handleEpisodeChange = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);
    setPlayerLoading(true);
    // Scroll to player when changing episodes
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // Toggle TV show info display
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Scroll to player
  const scrollToPlayer = () => {
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Hide info after scrolling to player
    setTimeout(() => setShowInfo(false), 1000);
  };

  // Get average runtime
  const getAverageRuntime = (): string => {
    if (!tvDetails?.episode_run_time || tvDetails.episode_run_time.length === 0) {
      return "Unknown";
    }

    const sum = tvDetails.episode_run_time.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / tvDetails.episode_run_time.length);
    return formatRuntime(avg);
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
            <>
              {tvDetails?.name}
              <span className="text-purple-400 ml-2">
                S{selectedSeason}:E{selectedEpisode}
              </span>
            </>
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
        {/* TV show backdrop with parallax effect */}
        {tvDetails?.backdrop_path && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ duration: 1 }}
              className="h-full w-full"
            >
              <Image
                src={`https://image.tmdb.org/t/p/original${tvDetails.backdrop_path}`}
                alt={tvDetails.name}
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
                  <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-purple-500 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-r-2 border-l-2 border-blue-500 animate-spin animation-delay-150"></div>
                  <div className="absolute inset-4 rounded-full border-t-2 border-b-2 border-pink-500 animate-spin animation-delay-300"></div>
                </div>
                <p className="text-gray-400 mt-6 font-medium">Loading your TV show...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TV show info section with animation */}
        <AnimatePresence>
          {tvDetails && showInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="container mx-auto px-4 py-8 z-10"
            >
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* TV show poster with hover effect */}
                {tvDetails.poster_path && (
                  <motion.div
                    className="w-full md:w-1/4 lg:w-1/5"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${tvDetails.poster_path}`}
                        alt={tvDetails.name}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                      />
                    </div>
                  </motion.div>
                )}

                {/* TV show details with animations */}
                <div className="w-full md:w-3/4 lg:w-4/5">
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
                  >
                    {tvDetails.name}
                  </motion.h1>

                  {tvDetails.tagline && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-gray-400 italic mb-4"
                    >
                      "{tvDetails.tagline}"
                    </motion.p>
                  )}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-wrap items-center gap-4 mb-6"
                  >
                    {tvDetails.first_air_date && (
                      <span className="text-gray-300 bg-gray-800/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(tvDetails.first_air_date)}
                      </span>
                    )}

                    {tvDetails.episode_run_time && tvDetails.episode_run_time.length > 0 && (
                      <span className="text-gray-300 bg-gray-800/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {getAverageRuntime()} per episode
                      </span>
                    )}

                    {tvDetails.vote_average > 0 && (
                      <span className="flex items-center bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-yellow-500 font-semibold">{tvDetails.vote_average.toFixed(1)}</span>
                        <span className="text-gray-300 ml-1">/10</span>
                      </span>
                    )}

                    {tvDetails.number_of_seasons && (
                      <span className="text-gray-300 bg-purple-800/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {tvDetails.number_of_seasons} {tvDetails.number_of_seasons === 1 ? 'Season' : 'Seasons'}
                      </span>
                    )}

                    {tvDetails.number_of_episodes && (
                      <span className="text-gray-300 bg-blue-800/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        {tvDetails.number_of_episodes} Episodes
                      </span>
                    )}
                  </motion.div>

                  {tvDetails.genres && tvDetails.genres.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="flex flex-wrap gap-2 mb-6"
                    >
                      {tvDetails.genres.map((genre, index) => (
                        <motion.span
                          key={genre.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                          className="px-3 py-1 bg-gradient-to-r from-purple-600/30 to-blue-600/30 backdrop-blur-sm rounded-full text-sm border border-purple-500/20"
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
                    {tvDetails.overview || "No description available for this TV show."}
                  </motion.p>

                  {/* Production companies */}
                  {tvDetails.production_companies && tvDetails.production_companies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="mb-8"
                    >
                      <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-3">Production</h3>
                      <div className="flex flex-wrap gap-6">
                        {tvDetails.production_companies.slice(0, 4).map((company) => (
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
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Watch Episode
                  </motion.button>
                </div>
              </div>

              {/* Season and Episode Selection */}
              {tvDetails.seasons && tvDetails.seasons.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="mb-8 bg-gray-900/60 backdrop-blur-md p-6 rounded-xl border border-gray-800/50"
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Select Season & Episode
                  </h3>

                  {/* Season tabs */}
                  <div className="mb-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pb-2">
                    <div className="flex space-x-2">
                      {tvDetails.seasons
                        .filter(season => season.season_number > 0) // Filter out specials (season 0)
                        .map(season => (
                          <button
                            key={season.id}
                            onClick={() => handleSeasonChange(season.season_number)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${selectedSeason === season.season_number
                              ? 'bg-purple-600 text-white font-medium'
                              : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70'
                              }`}
                          >
                            Season {season.season_number}
                            {season.episode_count > 0 && (
                              <span className="ml-2 text-xs opacity-80">({season.episode_count})</span>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Episode grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {playerLoading && episodes.length === 0 ? (
                      // Loading skeletons for episodes
                      Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-3 animate-pulse">
                          <div className="w-full h-24 bg-gray-700/70 rounded mb-2"></div>
                          <div className="h-4 bg-gray-700/70 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-700/70 rounded w-1/2"></div>
                        </div>
                      ))
                    ) : episodes.length > 0 ? (
                      episodes.map(episode => (
                        <motion.div
                          key={episode.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => handleEpisodeChange(episode.episode_number)}
                          className={`cursor-pointer rounded-lg overflow-hidden border ${selectedEpisode === episode.episode_number
                            ? 'border-purple-500 bg-purple-900/30'
                            : 'border-gray-800 bg-gray-800/50 hover:bg-gray-700/50'
                            }`}
                        >
                          <div className="relative h-24 bg-gray-900">
                            {episode.still_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                                alt={episode.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
                              EP {episode.episode_number}
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-sm truncate" title={episode.name}>
                              {episode.name}
                            </h4>
                            {episode.air_date && (
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(episode.air_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8 text-gray-400">
                        No episodes found for this season.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video player section with enhanced UI */}
        <div
          id="tv-player"
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
                  <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-purple-400">Loading episode...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ad blocker */}
          <div className="absolute inset-0 pointer-events-none z-[5]"></div>

          {/* The iframe */}
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            allowFullScreen
            onLoad={handleIframeLoad}
            style={{ backgroundColor: "#000" }}
          // src is intentionally omitted here and set via JavaScript
          ></iframe>

          {/* Custom player controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between z-20"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium bg-purple-900/70 px-2 py-1 rounded">
                    S{selectedSeason}:E{selectedEpisode}
                  </span>
                  <span className="text-sm hidden sm:inline">
                    {episodes.find(ep => ep.episode_number === selectedEpisode)?.name || "Episode"}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {selectedEpisode > 1 && (
                    <button
                      onClick={() => handleEpisodeChange(selectedEpisode - 1)}
                      className="text-white hover:text-purple-400 transition-colors"
                      title="Previous Episode"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}

                  {episodes.length > 0 && selectedEpisode < episodes.length && (
                    <button
                      onClick={() => handleEpisodeChange(selectedEpisode + 1)}
                      className="text-white hover:text-purple-400 transition-colors"
                      title="Next Episode"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={toggleFullscreen}
                    className="text-white hover:text-purple-400 transition-colors"
                    title={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {fullscreen ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                      </svg>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ad blocker notification */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-md p-4 text-center">
          <p className="text-sm text-purple-200">
            <span className="font-semibold">✓ Ad-Free Experience Enabled</span> - Enjoy your TV show without interruptions!
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
