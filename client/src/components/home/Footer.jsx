import { Link } from "react-router-dom";
import { Navlinks, socialMediaIcons } from "../../utils/constants";

const Footer = () => {
  return (
    <footer className="bg-[#111b21] px-6 sm:px-10 py-16 border-t border-[#2a3942]">
      <div className="max-w-7xl mx-auto">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Zaptics" width={120} />
              <h3 className="text-white text-2xl font-semibold">
                Zaptics
              </h3>
            </Link>
            <p className="text-[#667781] mt-4 leading-relaxed">
              Zaptics is a WhatsApp Automation CRM built to streamline
              messaging, boost engagement, and help businesses automate
              communication effortlessly.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              {socialMediaIcons.map(
                (Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a2830] border border-[#2a3942] text-[#25d366] hover:border-[#25d366] hover:bg-[#25d366]/10 transition-all duration-300"
                  >
                    <Icon size={18} />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-xl font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {Navlinks.map((item, key) => (
                <li key={key}>
                  <Link
                    to={item.path}
                    className="text-[#667781] hover:text-[#25d366] transition-colors duration-300 relative group"
                  >
                    {item.name}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#25d366] rounded group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h4 className="text-white text-xl font-semibold mb-4">
              Stay Updated
            </h4>
            <p className="text-[#667781] mb-4">
              Subscribe to get the latest updates, features, and best practices.
            </p>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-[#1a2830] border border-[#2a3942] text-white px-4 py-3 rounded-lg placeholder-[#667781] focus:border-[#25d366] outline-none transition-all"
              />
              <button className="bg-[#25d366] text-[#111b21] px-5 py-3 rounded-lg font-medium hover:bg-[#1ebd59] transition-all">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-[#2a3942] mt-12 pt-6 text-center">
          <p className="text-[#667781] text-sm">
            © {new Date().getFullYear()} Zaptics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
