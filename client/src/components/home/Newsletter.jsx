import { useState } from "react";
import { RiWhatsappFill, RiMailSendLine } from "react-icons/ri";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { IoSparkles } from "react-icons/io5";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = () => {
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <section id="contact" className="px-6 sm:px-10 py-20 bg-linear-to-br from-[#25D366] to-[#5FBE76] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10">
          <RiWhatsappFill className="text-white text-[150px]" />
        </div>
        <div className="absolute bottom-10 right-10">
          <RiWhatsappFill className="text-white text-[150px]" />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <RiWhatsappFill className="text-white text-[200px]" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="text-center mb-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E2F7EE] text-[#5FBE76] px-4 py-2 rounded-full text-sm font-medium mb-6">
              <RiMailSendLine className="text-lg" />
              <span>Stay Updated</span>
              <IoSparkles className="text-lg" />
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Get the Latest WhatsApp
              <span className="block text-[#5FBE76] mt-2">
                Marketing Insights
              </span>
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              Join 10,000+ business owners receiving weekly tips, strategies, and 
              updates to supercharge their WhatsApp marketing.
            </p>
          </div>

          {/* Newsletter Form */}
          {!subscribed ? (
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-6 py-4 rounded-xl border-2 border-[#E2F7EE] focus:border-[#5FBE76] focus:outline-none text-gray-900 placeholder-gray-400 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="bg-[#5FBE76] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#4da862] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  Subscribe Now
                  <FaArrowRightToBracket />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                No spam, ever. Unsubscribe at any time. By subscribing, you agree to our{" "}
                <a href="#" className="text-[#5FBE76] hover:underline font-medium">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-[#E2F7EE] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiMailSendLine className="text-[#5FBE76] text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 You're Subscribed!
              </h3>
              <p className="text-gray-600">
                Check your inbox for a confirmation email.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;