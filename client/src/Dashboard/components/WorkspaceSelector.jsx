import { FaLongArrowAltRight } from "react-icons/fa";

const WorkspaceSelector = () => {
  return (
    <section className="w-screen h-screen overflow-hidden flex items-center justify-center">
      <div className="bg-white flex flex-col items-center justify-center px-35 py-28 rounded-lg">
        <h2 className="text-3xl font-semibold">Select your workspace</h2>
        <p className="text-gray-600 my-4 font-medium">You have multiple workspaces. Please select one to continue using Zaptics </p>
        <div className="w-full flex flex-col items-center">
            <select name="workspace-selection" id="workspace-select">
                <option disabled value="0">Select Workspace</option>
                <option value="1">Workspace 1</option>
                <option value="2">Workspace 2</option>
                <option value="3">Workspace 3</option>
            </select>
            <button className="btn-primary mt-4 group active:scale-95">Continue <FaLongArrowAltRight className="group-hover:translate-x-3 transition-all duration-300" /> </button>
        </div>
      </div>
    </section>
  )
}

export default WorkspaceSelector
