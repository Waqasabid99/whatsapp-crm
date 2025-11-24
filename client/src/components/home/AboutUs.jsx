import { RiWhatsappFill, RiCheckDoubleFill } from "react-icons/ri";
import { services, stats, values } from "../../utils/constants";

const AboutUs = () => {

  return (
    <section id="about" className="px-6 sm:px-10 py-20 bg-linear-to-b from-white to-[#F5FAF7]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h3 className="bg-[#E2F7EE] text-[#5FBE76] px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm font-medium mb-6">
            <RiWhatsappFill className="text-lg" /> About Zaptics
          </h3>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Empowering Businesses Through
            <span className="block text-[#5FBE76] mt-2">Smart Communication</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're on a mission to revolutionize how businesses communicate with their customers. 
            By combining the power of WhatsApp's official Cloud API with advanced AI automation, 
            we help companies build stronger relationships and drive measurable growth.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 text-center border-2 border-[#E2F7EE] hover:border-[#5FBE76] transition-all duration-300 hover:shadow-lg"
            >
              <div className="text-3xl sm:text-4xl font-bold text-[#5FBE76] mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-12 items-center mb-20">
          {/* Left - Image */}
          <div className="w-full lg:w-[45%]">
            <div className="relative">
              <div className="absolute inset-0 bg-[#5FBE76] rounded-3xl transform rotate-3"></div>
              <div className="relative bg-linear-to-br from-[#25D366] to-[#5FBE76] rounded-3xl p-8 flex items-center justify-center min-h-[400px]">
                <RiWhatsappFill className="text-white text-[200px] opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl font-bold mb-4">Zaptics</div>
                    <div className="text-xl">WhatsApp Automation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="w-full lg:w-[55%]">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Why Choose Zaptics?
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Founded by a team of communication and AI experts, Zaptics was born from a simple 
              observation: businesses were struggling to scale their customer conversations while 
              maintaining a personal touch.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Today, we serve thousands of businesses worldwide, from startups to enterprises, 
              helping them automate their WhatsApp communications without losing the human element 
              that makes messaging so powerful.
            </p>

            <div className="space-y-4">
              {services.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="bg-[#E2F7EE] rounded-full p-1.5 mt-0.5">
                    <RiCheckDoubleFill className="text-[#5FBE76] text-lg" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Core Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 border-2 border-[#E2F7EE] hover:border-[#5FBE76] transition-all duration-300 hover:shadow-lg group"
              >
                <div className="bg-[#E2F7EE] w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#5FBE76] transition-colors duration-300">
                  <div className="text-[#5FBE76] text-2xl group-hover:text-white transition-colors duration-300">
                    {value.icon}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;