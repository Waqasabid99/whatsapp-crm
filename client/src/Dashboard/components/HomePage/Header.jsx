import { useEffect, useState } from "react";
import { backendUrl, dashboardStats } from "../../../utils/constants";
import axios from "axios";
import { useParams } from "react-router-dom";
import useAuthContext from "../../../context/useAuthContext";

const Header = ({ success, error, wabaId, apiKey }) => {
  const { id: adminId } = useParams();
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthContext();
  console.log(user)
  console.log({ success, error, wabaId, apiKey });

  useEffect(() => {
    if (user?.apiKeys?.length > 0 && user?.apiKeys[0].isActive) {
      setIsConnected(true);
    }

  }, [user])

  const handleConnectAPI = async () => {
    // Logic to connect API
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/whatsapp/connect/${adminId}`,
        { withCredentials: true }
      );
      console.log(data);
      if (data.success === true) {
        setLoading(false);
        window.open(data.url, "_blank");
      } else {
        setLoading(false);
        alert("Failed to connect API. Please try again.");
      }
    } catch (error) {
      console.error("Error connecting API:", error);
      setLoading(false);
      alert("An error occurred. Please try again.");
    }
  };
  return (
    <section className="w-full mb-5">
      <div className="w-full bg-linear-to-r from-[#3AB8BD] to-[#2A96D1] px-9 py-5 rounded-md flex items-center justify-between my-4">
        <h1 className="text-3xl text-white">Hello, Admin</h1>
        {isConnected ? (
          <button
            type="button"
            className="bg-white text-green-600 font-semibold px-6 py-3 rounded-lg cursor-not-allowed"
            disabled
          >
            API Connected
          </button>
        ) : (
          <button
            type="button"
            className="bg-white hover:bg-black hover:text-white hover:scale-105 duration-300 active:scale-95 px-6 py-3 rounded-lg"
            onClick={handleConnectAPI}
            disabled={loading}
          >
            {loading && !isConnected ? "Connecting..." : "Connect API"}
          </button>
        )}
      </div>

      <div className="cards grid grid-cols-1 md:grid-cols-3 gap-4">
        {dashboardStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg flex gap-3 relative overflow-hidden"
          >
            {/* blurred circle background */}
            <div
              style={{ backgroundColor: stat.color, opacity: 0.2 }}
              className="w-26 h-26 rounded-full absolute -top-2 right-[-25px]"
            ></div>

            {/* icon */}
            <div
              style={{ backgroundColor: stat.color }}
              className="p-4 rounded-full w-fit text-white relative z-10"
            >
              {stat.icon}
            </div>

            {/* text */}
            <div className="flex flex-col relative z-10">
              <p className="text-gray-600">{stat.label}</p>
              <h1 className="text-2xl font-bold">{stat.number}</h1>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Header;
