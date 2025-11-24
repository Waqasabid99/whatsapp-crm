import { NavLink, Link as RouterLink, useParams } from "react-router-dom";
import { RiWhatsappFill } from "react-icons/ri";
import { BsLayoutSidebar } from "react-icons/bs";
import { sidebarMenu } from "../../utils/constants";
import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { PanelRightOpen } from "lucide-react";

const Sidebar = () => {
  const { id } = useParams();
  const isMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const [isOpen, setIsOpen] = useState(true);

  // Auto-close on mobile
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [isMobile]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const SidebarContent = (
    <aside
      className={`bg-white border-r-2 border-[#E2F7EE] min-h-screen transition-all duration-300 z-50
      ${isMobile ? "absolute top-0 left-0 w-[80%]" : isOpen ? "w-[19%]" : "w-[4%]"} 
      ${!isMobile ? "" : ""} 
      `}
    >
      <div className={`${isOpen ? "p-4" : "p-2"}`}>
        {/* HEADER */}
        <div className={`flex items-start justify-between px-4 ${isOpen ? "py-2" : "py-6"} mb-4 border-b border-slate-300`}>

          {/* Logo only if open */}
          {isOpen && (
            <RouterLink
              to={`/user/${id}/home`}
              className="flex items-center gap-3 group"
            >
              <div className="bg-[#E2F7EE] p-2 rounded-xl group-hover:bg-[#5FBE76] transition-all">
                <RiWhatsappFill className="text-[#5FBE76] text-2xl group-hover:text-white" />
              </div>

              <div>
                <h2 className="font-bold text-lg text-gray-900">WhatsApp</h2>
                <p className="text-xs text-gray-500 font-medium">Automation</p>
              </div>
            </RouterLink>
          )}

          {/* Toggle icons */}
          {!isMobile ? (
            <BsLayoutSidebar
              onClick={toggleMenu}
              className="text-[#5FBE76] text-2xl cursor-pointer hover:bg-[#E2F7EE] shadow-lg p-1 rounded-lg"
            />
          ) : (
            <PanelRightOpen
              onClick={() => setIsOpen(false)}
              className="text-[#5FBE76] text-2xl cursor-pointer hover:bg-[#E2F7EE] shadow-lg p-1 rounded-lg"
            />
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2">
          {sidebarMenu.map((item, index) => (
            <NavLink
              key={index}
              to={item.path(id)}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
                ${
                  isActive && isOpen
                    ? "bg-[#5FBE76] text-white shadow-lg"
                    : "text-gray-700 hover:bg-[#E2F7EE] hover:text-[#5FBE76]"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`text-xl ${
                      isActive
                        ? "bg-[#5FBE76] text-white shadow-lg p-2 rounded-xl"
                        : "group-hover:scale-110"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {isOpen && (
                    <span className="text-lg font-medium">{item.title}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );

  return (
    <>
      {/* MOBILE TOGGLE ICON */}
      {isMobile && !isOpen && (
        <BsLayoutSidebar
          onClick={toggleMenu}
          className="absolute top-3 left-4 z-50 text-[#5FBE76] text-3xl cursor-pointer 
          p-2 rounded-xl shadow-lg hover:bg-[#E2F7EE] hover:scale-110 transition"
        />
      )}

      {/* DESKTOP SIDEBAR */}
      {!isMobile && SidebarContent}

      {/* MOBILE OVERLAY + SIDEBAR */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsOpen(false)}
        >
          {SidebarContent}
        </div>
      )}
    </>
  );
};

export default Sidebar;