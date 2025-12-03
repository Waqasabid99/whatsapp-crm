import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../home/Navbar";
import { ToastContainer } from "react-toastify";
import useAuthContext from "../../context/useAuthContext";

const Login = () => {
  const { login, loading: isLoading } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(formData, navigate);
  };
  return (
    <>
      <Navbar />
      <ToastContainer />
      <section className="flex flex-col lg:flex-row w-full justify-center items-stretch p-6 lg:p-12 mt-5">
        {/* Left div - Login Form */}
        <div className="left bg-white w-full lg:w-2/5 px-6 lg:px-10 py-8 lg:py-10 rounded-md shadow-md">
          <h2 className="text-3xl md:text-4xl font-stretch-expanded mb-5">
            Login to your account
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 md:gap-5">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="p-3 border rounded-md"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="p-3 border rounded-md"
            />

            <div className="relative">
              <p className="text-sm md:text-base static bottom-10 md:absolute md:bottom-8 right-0">
                Don't have an account?{" "}
                <Link to="/register">
                  <span className="text-[#25D366]">Register</span>
                </Link>
              </p>
              {isLoading ? (
                <button disabled className="btn-primary mt-10 w-full md:w-auto">
                  <div className="w-6 h-6 mx-5 border-4 border-[#95f1b7] border-t-[#25d366] rounded-full animate-spin"></div>
                </button>
              ) : (
                <button className="btn-primary mt-10 w-full md:w-auto">
                  Login
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

export default Login;
