export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-16 h-16 border-4 border-[#95f1b7] border-t-[#25d366] rounded-full animate-spin"></div>
        
        {/* Inner pulsing dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-[#25d366] rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Loading text */}
      <p className="absolute mt-24 text-blue-300 font-medium animate-pulse">
        Loading...
      </p>
    </div>
  );
}