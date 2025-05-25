"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Check if the current path matches a navigation item
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  // Popular genres for quick search
  const popularGenres = [
    "Action", "Comedy", "Drama", "Horror", "Sci-Fi", 
    "Thriller", "Animation", "Adventure", "Fantasy", "Romance"
  ];

  // Handle genre click
  const handleGenreClick = (genre: string) => {
    router.push(`/search?q=${encodeURIComponent(genre)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  // Decode the API key for search suggestions
  const _0x2f1a = ['NTJmZjQ2OWFhN2IyYzhiYjNlZjBkMmI3NzQ4NTE2MGY'];
  const getSecureConfig = () => {
    return {
      k: (() => atob(_0x2f1a[0]))(),
      b: 'https://api.themoviedb.org/3'
    };
  };

  const config = getSecureConfig();

  // Fetch search suggestions as user types
  useEffect(() => {
    const fetchSearchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `${config.b}/search/multi?api_key=${config.k}&language=en-US&query=${encodeURIComponent(searchQuery)}&page=1&include_adult=false`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch search suggestions");
        }
        
        const data = await response.json();
        
        // Extract titles from movies and TV shows
        const suggestions = data.results
          .slice(0, 5)
          .map((item: any) => item.title || item.name)
          .filter(Boolean);
        
        setSearchSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSearchSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <>
      <header 
        className={`py-4 px-4 md:px-6 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-black/80 backdrop-blur-md shadow-lg" 
            : "bg-gradient-to-b from-black/90 to-transparent"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-3xl font-bold"
              >
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
                  EduWatcheru
                </span>
              </motion.h1>
            </Link>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xs md:text-sm text-gray-400 hidden sm:block"
            >
              Your movie streaming platform
            </motion.p>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {[
                { path: "/", label: "Home" },
                { path: "/movies", label: "Movies" },
                { path: "/tv-shows", label: "TV Shows" },
                { path: "/trending", label: "Trending" }
              ].map((item, index) => (
                <motion.li 
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Link 
                    href={item.path} 
                    className={`relative px-1 py-2 font-medium transition-colors ${
                      isActive(item.path) 
                        ? "text-blue-400" 
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {item.label}
                    {isActive(item.path) && (
                      <motion.span
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>
            
            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors md:hidden"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </header>
      
      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md pt-24 pb-6 px-4 shadow-lg"
          >
            <div className="container mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search for movies or TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-full py-3 px-6 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
              
              {/* Search suggestions */}
              {searchQuery.trim().length > 0 && (
                <div className="mt-4 bg-gray-800/70 backdrop-blur-md rounded-lg overflow-hidden">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="inline-block h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Searching...
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    <ul>
                      {searchSuggestions.map((suggestion, index) => (
                        <li key={index}>
                          <button
                            onClick={() => {
                              setSearchQuery(suggestion);
                              router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-700/50 text-gray-200 flex items-center transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {suggestion}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-gray-400 text-sm">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
              
              {/* Popular genres */}
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Popular genres:</p>
                <div className="flex flex-wrap gap-2">
                  {popularGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleGenreClick(genre)}
                      className="px-3 py-1 text-xs bg-gray-800/70 hover:bg-gray-700 rounded-full text-gray-300 transition-colors"
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-md shadow-lg md:hidden overflow-hidden"
        >
          <nav className="container mx-auto py-4 px-4">
            <ul className="space-y-4">
              {[
                { path: "/", label: "Home" },
                { path: "/movies", label: "Movies" },
                { path: "/tv-shows", label: "TV Shows" },
                { path: "/trending", label: "Trending" },
                { path: "/favorites", label: "My Favorites" }
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 px-4 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-blue-900/30 text-blue-400"
                        : "hover:bg-gray-800/50 text-gray-300"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
    
    {/* Spacer to prevent content from hiding under fixed header */}
    <div className="h-20"></div>
  </>
);
}

