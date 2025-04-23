import { motion } from "framer-motion";
import Header from "@/components/Header";

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-800 animate-pulse rounded-lg mb-2"></div>
          <div className="h-5 w-32 bg-gray-800 animate-pulse rounded-lg"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg h-full flex flex-col animate-pulse">
              <div className="relative h-64 bg-gray-700"></div>
              <div className="p-4 flex-grow flex flex-col">
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="mt-auto">
                  <div className="h-10 bg-gray-700 rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
