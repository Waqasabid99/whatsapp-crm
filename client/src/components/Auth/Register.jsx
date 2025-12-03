import { Link, useNavigate } from "react-router-dom";
import Navbar from "../home/Navbar";
import { plans } from "../../utils/constants";
import { useState } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import useAuthContext from "../../context/useAuthContext";

const Register = () => {
  const { register, loading: isLoading } = useAuthContext();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    workspaceName: "",
    selectedPlanSlug: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(formData, navigate);
  };

  return (
    <>
      <Navbar />
      <ToastContainer />
      <section className="flex flex-col lg:flex-row w-full justify-center items-stretch p-6 lg:p-12">
        {/* Left div - Registration Form */}
        <div className="left bg-white w-full lg:w-2/5 px-6 lg:px-10 py-8 lg:py-10 rounded-md shadow-md flex flex-col">
          <h2 className="text-3xl md:text-4xl font-stretch-expanded mb-5">
            Create an account
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 md:gap-5 flex-1"
          >
            <input
              type="text"
              required
              name="name"
              placeholder="Enter your name"
              className="p-3 border rounded-md"
              onChange={handleChange}
            />

            <input
              type="email"
              required
              name="email"
              placeholder="Enter your email"
              className="p-3 border rounded-md"
              onChange={handleChange}
            />

            <input
              type="password"
              required
              name="password"
              placeholder="Enter your password"
              className="p-3 border rounded-md"
              onChange={handleChange}
            />

            <input
              type="text"
              required
              name="workspaceName"
              placeholder="Enter your workspace name"
              className="p-3 border rounded-md"
              onChange={handleChange}
            />

            {/* Select Plan */}
            <select
              required
              value={formData.selectedPlanSlug}
              onChange={(e) => {
                const planSlug = e.target.value;
                const plan = plans.find((plan) => plan.slug === planSlug);
                setSelectedPlan(plan);
                setFormData({
                  ...formData,
                  selectedPlanSlug: planSlug,
                });
              }}
              className="p-3 border rounded-md"
            >
              <option value="" disabled>
                Select a plan
              </option>
              {plans.map((plan) => (
                <option key={plan.slug} value={plan.slug}>
                  {plan.name}
                </option>
              ))}
            </select>

            {/* Plan Details */}
            {selectedPlan && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Plan Details:</h3>
                <h4 className="text-gray-600 font-bold my-1">
                  Price: {selectedPlan.price}
                </h4>

                <h4 className="text-gray-600">Features:</h4>
                <ul className="ml-4 list-disc">
                  {selectedPlan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="relative mt-4 md:mt-6">
              <p className="text-sm md:text-base static bottom-10 md:absolute md:bottom-8 right-0">
                Already have an account?{" "}
                <Link to="/login">
                  <span className="text-[#25D366]">Login</span>
                </Link>
              </p>

              {isLoading ? (
                <button
                  type="submit"
                  disabled
                  className="btn-primary mt-12 md:mt-2 w-full md:w-auto flex items-center justify-center group transition"
                >
                  <div className="w-6 h-6 mx-5 border-4 border-[#95f1b7] border-t-[#25d366] rounded-full animate-spin"></div>
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary mt-12 md:mt-2 w-full md:w-auto flex items-center justify-between group transition"
                >
                  Register
                  <FaLongArrowAltRight className="group-hover:translate-x-2 transition duration-300" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right div - Info */}
        <div className="right bg-[#25D366] w-full lg:w-1/5 px-6 py-8 lg:py-10 rounded-md flex items-center justify-center text-white shadow-md">
          <h2 className="text-xl md:text-2xl font-stretch-expanded text-center">
            Having any issues? Contact us
          </h2>
        </div>
      </section>
    </>
  );
};

export default Register;
