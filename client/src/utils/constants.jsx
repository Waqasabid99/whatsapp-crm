import {
  FaComments,
  FaRobot,
  FaChartLine,
  FaTags,
  FaCalendarAlt,
  FaFileInvoice,
  FaHeadset,
  FaBullseye,
  FaBell,
  FaUsers,
  FaRocket,
  FaShieldAlt,
} from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa6";

import {
  FaGaugeHigh,
  FaRegCopy,
  FaBullhorn,
  FaAddressBook,
  FaUserTie,
} from "react-icons/fa6";

export const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const Navlinks = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Features",
    path: "#features",
  },
  {
    name: "About",
    path: "#about",
  },
  {
    name: "Pricing",
    path: "#pricing",
  },
  {
    name: "Contact",
    path: "#contact",
  },
];

export const features = [
  {
    icon: <FaComments size={24} />,
    title: "Unified Messaging Inbox",
    description:
      "Centralize all WhatsApp conversations in one dashboard with customer context and history.",
  },
  {
    icon: <FaRobot size={24} />,
    title: "AI-Powered Chatbots",
    description:
      "Automate responses to common queries with intelligent bots that learn from interactions.",
  },
  {
    icon: <FaChartLine size={24} />,
    title: "Performance Analytics",
    description:
      "Track engagement rates, response times, and conversion metrics in real-time.",
  },
  {
    icon: <FaTags size={24} />,
    title: "Smart Tagging System",
    description:
      "Organize contacts with custom tags for quick filtering and personalized campaigns.",
  },
  {
    icon: <FaCalendarAlt size={24} />,
    title: "Scheduled Messaging",
    description:
      "Plan and automate messages for optimal delivery times across time zones.",
  },
  {
    icon: <FaFileInvoice size={24} />,
    title: "Automated Invoicing",
    description:
      "Send payment reminders, invoices, and receipts directly through WhatsApp.",
  },
  {
    icon: <FaHeadset size={24} />,
    title: "Seamless Human Handoff",
    description:
      "Easily transfer complex conversations from bots to live agents with full context.",
  },
  {
    icon: <FaBullseye size={24} />,
    title: "Campaign Management",
    description:
      "Create, test, and deploy multi-step WhatsApp marketing campaigns with A/B testing.",
  },
  {
    icon: <FaBell size={24} />,
    title: "Automated Alerts",
    description:
      "Get notified about urgent messages, SLA breaches, or important customer actions.",
  },
];

export const services = [
  "Official WhatsApp Business API Partner",
  "AI-powered automation and chatbots",
  "Advanced analytics and insights",
  "Seamless CRM integrations",
  "Enterprise-grade security",
];

export const values = [
  {
    icon: <FaUsers />,
    title: "Customer First",
    description:
      "We prioritize your success and build solutions that truly serve your business needs.",
  },
  {
    icon: <FaRocket />,
    title: "Innovation Driven",
    description:
      "Leveraging cutting-edge AI and WhatsApp Cloud API to stay ahead of the curve.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Secure & Reliable",
    description:
      "Your data security is our priority with enterprise-grade protection standards.",
  },
];

export const stats = [
  { number: "10K+", label: "Active Users" },
  { number: "500K+", label: "Messages Sent" },
  { number: "99.9%", label: "Uptime" },
  { number: "24/7", label: "Support" },
];

export const plans = [
  {
    name: "Starter",
    slug: "starter",
    price: "29",
    period: "month",
    description:
      "Perfect for small businesses getting started with WhatsApp automation",
    features: [
      "Up to 1,000 messages/month",
      "1 WhatsApp Business account",
      "Basic automation workflows",
      "Email support",
      "Message templates",
      "Basic analytics",
      "Chat widget integration",
    ],
    popular: false,
    buttonText: "Start Free Trial",
  },
  {
    name: "Professional",
    slug: "professional",
    price: "99",
    period: "month",
    description: "Ideal for growing businesses that need advanced features",
    features: [
      "Up to 10,000 messages/month",
      "3 WhatsApp Business accounts",
      "Advanced automation & AI chatbot",
      "Priority support (24/7)",
      "Unlimited templates",
      "Advanced analytics & reports",
      "CRM integrations",
      "Team collaboration tools",
      "Custom branding",
    ],
    popular: true,
    buttonText: "Get Started",
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    price: "299",
    period: "month",
    description: "For large organizations with custom requirements",
    features: [
      "Unlimited messages",
      "Unlimited WhatsApp accounts",
      "Full AI automation suite",
      "Dedicated account manager",
      "Custom templates & workflows",
      "Advanced security features",
      "API access",
      "Priority support (24/7)",
      "Custom branding",
      "SLA guarantee",
    ],
    popular: false,
    buttonText: "Contact Sales",
  },
];

export const socialMediaIcons = [
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
];

export const sidebarMenu = [
  {
    icon: <FaGaugeHigh size={22} />,
    title: "Dashboard",
    path: (id) => `/dashboard/workspace/${id}/home`,
  },
  {
    icon: <FaComments size={22} />,
    title: "Live Chats",
    path: (id) => `/dashboard/workspace/${id}/live-chats`,
  },
  {
    icon: <FaRegCopy size={22} />,
    title: "Templates",
    path: (id) => `/dashboard/workspace/${id}/templates`,
  },
  {
    icon: <FaBullhorn size={22} />,
    title: "Campaigns",
    path: (id) => `/dashboard/workspace/${id}/campaigns`,
  },
  {
    icon: <FaAddressBook size={22} />,
    title: "Contacts",
    path: (id) => `/dashboard/workspace/${id}/contacts`,
  },
  {
    icon: <FaRobot size={22} />,
    title: "Chatbots",
    path: (id) => `/dashboard/workspace/${id}/chatbots`,
  },
  {
    icon: <FaUserTie size={22} />,
    title: "Agents",
    path: (id) => `/dashboard/workspace/${id}/agents`,
  },
  {
    icon: <IoSettingsSharp size={22} />,
    title: "Settings",
    path: (id) => `/dashboard/workspace/${id}/settings`,
  },
];
