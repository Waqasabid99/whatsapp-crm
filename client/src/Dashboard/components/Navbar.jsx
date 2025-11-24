import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { FaUser } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });

  const handleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // CLICK OUTSIDE TO CLOSE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={` ${isDesktop ? "flex justify-between items-center bg-white p-5" : "flex justify-between items-center px-2 py-4 bg-white"}`}>
      {!isDesktop && (
      <div className="invisible"></div>
      )}
      <h1 className="text-md md:text-4xl">Dashboard</h1>
      {/* Profile */}
      <div className="relative" ref={dropdownRef}>
        <span
          onClick={handleDropdown}
          className="bg-[#25d366] text-white p-3 rounded-full cursor-pointer select-none"
        >
          W
        </span>

        {/* Animated Dropdown */}
        <div
          className={`
            absolute right-0 mt-3 w-40 bg-white shadow-md rounded-md p-2 z-50 
            transform transition-all duration-300 origin-top
            ${isDropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
          `}
        >
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100"
          >
            <FaUser /> Profile
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100"
          >
            <IoIosLogOut /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;