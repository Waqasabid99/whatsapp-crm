import { features } from "../../utils/constants";

const Features = () => {
  return (
    <section id="features" className="bg-[#111b21] px-6 sm:px-10 py-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-white text-3xl sm:text-4xl text-center mb-4">
          Features of{" "}
          <span className="block sm:inline text-3xl sm:text-4xl font-semibold text-[#25d366] mt-2 sm:mt-0">
            Zaptics - WhatsApp Automation Solution
          </span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 cursor-pointer">
          {features.map((feature, key) => (
            <div 
              key={key}
              className="bg-[#1a2830] rounded-xl p-6 border border-[#2a3942] hover:border-[#25d366] transition-all duration-300 hover:shadow-xl hover:shadow-[#25d366]/10 hover:-translate-y-1 group"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-[#25d366]/10 rounded-full p-6 group-hover:bg-[#25d366]/20 transition-all duration-300">
                  <div className="text-7xl text-[#25d366] group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>
              </div>
              <h3 className="text-white text-2xl font-semibold mb-4 text-center">
                {feature.title}
              </h3>
              <p className="text-[#667781] text-base leading-relaxed text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;