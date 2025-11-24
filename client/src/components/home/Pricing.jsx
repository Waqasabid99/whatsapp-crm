import { RiWhatsappFill, RiCheckDoubleFill } from "react-icons/ri";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { IoSparkles } from "react-icons/io5";
import { plans } from "../../utils/constants";

const Pricing = () => {

  return (
    <section id="pricing" className="px-6 sm:px-10 py-20 bg-[#FCF5EB]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h3 className="bg-[#E2F7EE] text-[#5FBE76] px-4 py-2 rounded-full inline-flex items-center gap-2 text-sm font-medium mb-6">
            <RiWhatsappFill className="text-lg" /> Pricing Plans
          </h3>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Choose the Perfect Plan
            <span className="block text-[#5FBE76] mt-2">for Your Business</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Start with a 14-day free trial. No credit card required. 
            Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.popular
                  ? "border-[#5FBE76] shadow-xl scale-105 md:scale-110"
                  : "border-[#E2F7EE] hover:border-[#5FBE76]"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-linear-to-r from-[#25D366] to-[#5FBE76] text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                    <IoSparkles /> Most Popular
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-gray-600 text-2xl font-medium">$</span>
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 text-lg">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="bg-[#E2F7EE] rounded-full p-1 mt-0.5 shrink-0">
                      <RiCheckDoubleFill className="text-[#5FBE76] text-base" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                  plan.popular
                    ? "bg-[#5FBE76] text-white hover:bg-[#4da862] shadow-lg hover:shadow-xl"
                    : "bg-[#E2F7EE] text-[#5FBE76] hover:bg-[#5FBE76] hover:text-white"
                }`}
              >
                {plan.buttonText} <FaArrowRightToBracket />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            All plans include a 14-day free trial and can be cancelled anytime.
          </p>
          <p className="text-sm text-gray-500">
            Need a custom plan? <a href="#" className="text-[#5FBE76] font-semibold hover:underline">Contact our sales team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;