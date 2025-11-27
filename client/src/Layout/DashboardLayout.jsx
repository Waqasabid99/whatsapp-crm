import { Outlet } from "react-router-dom"
import Sidebar from "../Dashboard/components/Sidebar"
import Navbar from "../Dashboard/components/Navbar"

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />

      {/* Content Area */}
      <div className="flex-1 bg-[#E1EAF6]">
        <Navbar />
        <Outlet />
      </div>
    </div>
  )
}

export default DashboardLayout