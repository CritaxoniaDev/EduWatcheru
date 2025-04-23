"use client";

import { useEffect, useState } from "react";
import MovieCard, { Movie } from "@/components/MovieCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Categories we'll display
const TV_CATEGORIES = [
  { title: "Popular TV Shows", endpoint: "/tv/popular" },
  { title: "Top Rated TV Shows", endpoint: "/tv/top_rated" },
  { title: "Currently Airing", endpoint: "/tv/on_the_air" },
  { title: "Airing Today", endpoint: "/tv/airing_today" }
];

export default function TVShowsPage() {
  const [tvCategories, setTvCategories] = useState<{ title: string; movies: Movie[] }[]>([]);
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
    const fetchTVCategories = async () => {
      try {
        setLoading(true);
        
        const categoriesData = await Promise.all(
          TV_CATEGORIES.map(async (category) => {
            const response = await fetch(
              `${config.b}${category.endpoint}?api_key=${config.k}&language=en-US&page=1`
            );
            
            if (!response.ok) {
              throw new Error(`Failed to fetch ${category.title}`);
            }
            
            const data = await response.json();
            
            // Format TV show data to match our Movie interface
            const formattedShows = data.results.map((show: any) => ({
              id: show.id,
              title: show.name,
              poster_path: show.poster_path,
              overview: show.overview,
              vote_average: show.vote_average,
              first_air_date: show.first_air_date,
              media_type: "tv"
            }));
            
            return {
              title: category.title,
              movies: formattedShows.slice(0, 6) // Limit to 6 shows per category
            };
          })
        );
        
        setTvCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching TV shows:", err);
        setError("Failed to load TV shows. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTVCategories();
  }, []);

  // Function to get TV show details including IMDB ID
  const getTVShowDetails = async (showId: number) => {
    try {
      const response = await fetch(
        `${config.b}/tv/${showId}?api_key=${config.k}&append_to_response=external_ids`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch TV show details");
      }
      
      const data = await response.json();
      return data.external_ids?.imdb_id || `${showId}`;
    } catch (err) {
      console.error("Error fetching TV show details:", err);
      return `${showId}`;
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
            {tvCategories.map((category, index) => (
              <section key={index}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                  <a href="#" className="text-blue-400 hover:underline text-sm">View All</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {category.movies.map((show) => (
                    <MovieCard 
                      key={show.id} 
                      movie={show} 
                      imageBaseUrl={config.i}
                      getMovieDetails={getTVShowDetails}
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
