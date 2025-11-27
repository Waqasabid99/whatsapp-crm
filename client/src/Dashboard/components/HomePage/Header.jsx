import { dashboardStats } from "../../../utils/constants";

const Header = () => {
  return (
    <section className="w-full mb-5">
      <div className="w-full bg-linear-to-r from-[#3AB8BD] to-[#2A96D1] px-9 py-5 rounded-md flex items-center justify-between my-4">
        <h1 className="text-3xl text-white">Hello, Admin</h1>

        <button
          type="button"
          className="bg-white hover:bg-black hover:text-white hover:scale-105 duration-300 active:scale-95 px-6 py-3 rounded-lg"
        >
          Connect API
        </button>
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
