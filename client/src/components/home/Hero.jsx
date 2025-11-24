import { FaArrowRightToBracket } from "react-icons/fa6";
import { PiGreaterThanThin } from "react-icons/pi";
import { RiWhatsappFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12 md:gap-20">
      
      {/* LEFT */}
      <div className="w-full md:w-1/2 flex flex-col gap-5">
        
        <h3 className="bg-[#E2F7EE] text-[#5FBE76] px-4 py-2 rounded-full flex items-center gap-2 w-fit text-xs md:text-sm">
          <RiWhatsappFill className="text-md" /> 
          WhatsApp Automation Solution
        </h3>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Boost Your Business with <br />
          AI-Powered WhatsApp Automation
        </h1>

        <p className="text-sm sm:text-base text-black leading-relaxed">
          Boost engagement and grow your business with advanced WhatsApp
          marketing tools that automate messaging, streamline communication, and
          drive results. Our platform leverages the official WhatsApp Cloud API
          to provide businesses with a powerful communication solution. This
          integration allows you to connect with customers seamlessly through
          WhatsApp, the world's most popular messaging app.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-4 items-center mt-2">
          <button onClick={() => navigate("/signup")} className="btn-primary flex items-center gap-2">
            Get Started <FaArrowRightToBracket />
          </button>

          <button className="btn-secondary flex items-center gap-2">
            Learn More <PiGreaterThanThin />
          </button>
        </div>
      </div>

      {/* RIGHT (IMAGE) */}
      <div className="w-full md:w-1/2 flex justify-center md:justify-end">
        <img
          src="/hero.png"
          alt="hero"
          className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl w-full object-contain md:-mt-10 lg:-mt-20"
        />
      </div>

    </section>
  );
};

export default Hero;
