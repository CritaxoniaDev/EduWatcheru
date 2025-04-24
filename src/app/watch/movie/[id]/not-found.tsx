import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Movie Not Found</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Sorry, we couldn't find the movie you're looking for. It may have been removed or the ID is incorrect.
      </p>
      <Link 
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
