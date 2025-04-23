export default function Footer() {
    return (
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
    );
  }
  