import { useState } from "react";
import { Link as RouterLink, NavLink, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { Navlinks } from "../../utils/constants";
import { PiGreaterThanThin } from "react-icons/pi";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { useMediaQuery } from "react-responsive";

const Navbar = () => {
  const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);
  const navigate = useNavigate(); 
  return (
    <header className={`${isDesktop ? "wa-header" : "flex justify-between items-center px-2 py-4"}`}>

      {/* LOGO */}
      <RouterLink to="/" className="flex items-center gap-2" aria-label="Homepage">
        <img src="/logo.png" alt="Whatsapp Automation" width={120} />
        <h2 className="font-semibold text-lg">Whatsapp Automation</h2>
      </RouterLink>

      {/* DESKTOP NAV */}
      {isDesktop && (
        <>
          <nav>
            <ul className="flex gap-8 font-medium">
              {Navlinks.map((link, i) => {
                const isScroll = link.path.startsWith("#");

                return (
                  <li key={i}>
                    {isScroll ? (
                      <ScrollLink
                        to={link.path.replace("#", "")}
                        smooth
                        duration={500}
                        offset={-80}
                        spy={true}
                        activeClass="text-blue-600 font-semibold"
                        className="cursor-pointer hover:text-blue-600 transition"
                      >
                        {link.name}
                      </ScrollLink>
                    ) : (
                      <NavLink
                        to={link.path}
                        className={({ isActive }) =>
                          `hover:text-blue-600 transition ${
                            isActive ? "text-blue-600 font-semibold" : ""
                          }`
                        }
                      >
                        {link.name}
                      </NavLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 items-center">
            <button onClick={() => navigate('/register')} className="btn-secondary flex items-center gap-1">
              Signup <PiGreaterThanThin />
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary flex items-center gap-1">
              Login <FaArrowRightToBracket />
            </button>
          </div>
        </>
      )}

      {/* MOBILE MENU BUTTON */}
      {!isDesktop && (
        <button onClick={() => setIsMenuOpen(true)}>
          <IoMdMenu size={35} className="cursor-pointer" />
        </button>
      )}

      {/* MOBILE OVERLAY MENU */}
      {!isDesktop && isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto transition-all">
          {/* Close Button */}
          <button onClick={closeMenu}>
            <IoMdClose size={45} className="absolute top-4 right-4 cursor-pointer" />
          </button>

          {/* Logo Centered */}
          <div className="flex justify-center items-center py-6 border-b">
            <RouterLink to="/" onClick={closeMenu} className="flex gap-2 items-center">
              <img src="/logo.png" alt="Whatsapp Automation" width={60} />
              <h2 className="font-semibold text-xl">Whatsapp Automation</h2>
            </RouterLink>
          </div>

          {/* Mobile Nav Links */}
          <nav className="mt-6">
            <ul className="flex flex-col gap-6 font-medium text-lg">
              {Navlinks.map((link, i) => {
                const isScroll = link.path.startsWith("#");

                return (
                  <li key={i}>
                    {isScroll ? (
                      <ScrollLink
                        to={link.path.replace("#", "")}
                        smooth
                        duration={500}
                        offset={-80}
                        spy={true}
                        activeClass="text-blue-600 font-semibold"
                        onClick={closeMenu}
                        className="cursor-pointer block py-2 border-b"
                      >
                        {link.name}
                      </ScrollLink>
                    ) : (
                      <NavLink
                        to={link.path}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          `block py-2 border-b ${
                            isActive ? "text-blue-600 font-semibold" : ""
                          }`
                        }
                      >
                        {link.name}
                      </NavLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Buttons */}
          <div className="mt-8 flex flex-col gap-4">
            <button onClick={() => navigate('/register')} className="btn-secondary w-full py-3 text-lg flex items-center justify-center gap-2">
              Signup <PiGreaterThanThin />
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2">
              Login <FaArrowRightToBracket />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
