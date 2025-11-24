import { useNavigate } from "react-router-dom";
import { RiWhatsappFill } from "react-icons/ri";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { IoSparkles } from "react-icons/io5";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen px-6 sm:px-10 py-20 bg-linear-to-br from-[#25D366] to-[#5FBE76] relative overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10">
          <RiWhatsappFill className="text-white text-[120px]" />
        </div>
        <div className="absolute bottom-10 right-10">
          <RiWhatsappFill className="text-white text-[120px]" />
        </div>
        <div className="absolute top-20 right-20">
          <RiWhatsappFill className="text-white text-[80px]" />
        </div>
        <div className="absolute bottom-20 left-20">
          <RiWhatsappFill className="text-white text-[80px]" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-[#E2F7EE] rounded-full mb-6">
              <RiWhatsappFill className="text-[#5FBE76] text-7xl" />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#E2F7EE] text-[#5FBE76] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>Error 404</span>
            <IoSparkles className="text-lg" />
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-4">
            Oops!
          </h1>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#5FBE76] mb-6">
            Page Not Found
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Looks like this page got lost in the chat! The page you're looking for 
            doesn't exist or has been moved. Don't worry, we'll help you get back on track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/")}
              className="bg-[#5FBE76] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4da862] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Back to Home
            </button>
            
            <button
              onClick={() => navigate("/signup")}
              className="bg-white text-[#5FBE76] border-2 border-[#5FBE76] px-8 py-4 rounded-xl font-semibold hover:bg-[#E2F7EE] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started
              <FaArrowRightToBracket />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;