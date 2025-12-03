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
  FaPaperPlane,
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

import { ImClipboard } from "react-icons/im";
import { MdOutlineSupportAgent } from "react-icons/md";

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
  // {
  //   icon: <FaRobot size={22} />,
  //   title: "Chatbots",
  //   path: (id) => `/dashboard/workspace/${id}/chatbots`,
  // },
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

export const dashboardStats = [
  {
    index: 1,
    color: "#1771E6",
    icon: <FaPaperPlane size={24} />,
    number: "10K+",
    label: "Total Messages",
  },
  {
    index: 2,
    color: "#22D571",
    icon: <ImClipboard size={24} />,
    number: "500K+",
    label: "Messages Sent",
  },
  {
    index: 3,
    color: "#E34F95",
    icon: <MdOutlineSupportAgent size={24} />,
    number: "12K+",
    label: "Total Agents",
  },
];

export const initialConversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    lastMessage: "Thanks for the quick response!",
    timestamp: "10:30 AM",
    unread: 2,
    avatar: "SJ",
    status: "online",
    phone: "+1 234 567 8900",
    email: "sarah.j@example.com",
    tags: ["VIP", "Support"],
    agent: "John Doe",
    notes: "Premium customer, needs priority support",
    labels: ["Active", "Follow-up"],
    messages: [
      {
        id: 1,
        text: "Hi, I need help with my order",
        sender: "contact",
        time: "10:15 AM",
        status: "read",
      },
      {
        id: 2,
        text: "Of course! I'd be happy to help. Can you provide your order number?",
        sender: "agent",
        time: "10:16 AM",
        status: "read",
      },
      {
        id: 3,
        text: "It's #12345",
        sender: "contact",
        time: "10:18 AM",
        status: "read",
      },
      {
        id: 4,
        text: "Let me check that for you right away.",
        sender: "agent",
        time: "10:20 AM",
        status: "read",
      },
      {
        id: 5,
        text: "Thanks for the quick response!",
        sender: "contact",
        time: "10:30 AM",
        status: "delivered",
      },
    ],
  },
  {
    id: 2,
    name: "Michael Chen",
    lastMessage: "Can we schedule a call?",
    timestamp: "9:45 AM",
    unread: 0,
    avatar: "MC",
    status: "offline",
    phone: "+1 234 567 8901",
    email: "michael.c@example.com",
    tags: ["Sales", "Enterprise"],
    agent: "Jane Smith",
    notes: "Interested in enterprise plan",
    labels: ["Hot Lead"],
    messages: [
      {
        id: 1,
        text: "Hello, I'm interested in your enterprise package",
        sender: "contact",
        time: "9:30 AM",
        status: "read",
      },
      {
        id: 2,
        text: "Great! I can help you with that. What's your team size?",
        sender: "agent",
        time: "9:32 AM",
        status: "read",
      },
      {
        id: 3,
        text: "We have about 50 people",
        sender: "contact",
        time: "9:35 AM",
        status: "read",
      },
      {
        id: 4,
        text: "Can we schedule a call?",
        sender: "contact",
        time: "9:45 AM",
        status: "read",
      },
    ],
  },
  {
    id: 3,
    name: "Emma Wilson",
    lastMessage: "Perfect, thank you!",
    timestamp: "Yesterday",
    unread: 0,
    avatar: "EW",
    status: "offline",
    phone: "+1 234 567 8902",
    email: "emma.w@example.com",
    tags: ["Support"],
    agent: "John Doe",
    notes: "Resolved billing issue",
    labels: ["Resolved"],
    messages: [
      {
        id: 1,
        text: "I have a question about my billing",
        sender: "contact",
        time: "2:00 PM",
        status: "read",
      },
      {
        id: 2,
        text: "I'm here to help! What's your question?",
        sender: "agent",
        time: "2:02 PM",
        status: "read",
      },
      {
        id: 3,
        text: "Perfect, thank you!",
        sender: "contact",
        time: "2:15 PM",
        status: "read",
      },
    ],
  },
];

export const initialAgents = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    avatar: "JD",
    status: "online",
    activeChats: 5,
    totalChats: 127,
    avgResponseTime: "2m 15s",
    satisfaction: 4.8,
    lastActive: "Active now",
    role: "Senior Agent",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    avatar: "JS",
    status: "online",
    activeChats: 3,
    totalChats: 98,
    avgResponseTime: "1m 45s",
    satisfaction: 4.9,
    lastActive: "Active now",
    role: "Agent",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.j@company.com",
    avatar: "MJ",
    status: "away",
    activeChats: 1,
    totalChats: 156,
    avgResponseTime: "3m 10s",
    satisfaction: 4.6,
    lastActive: "10 minutes ago",
    role: "Senior Agent",
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah.w@company.com",
    avatar: "SW",
    status: "offline",
    activeChats: 0,
    totalChats: 203,
    avgResponseTime: "2m 30s",
    satisfaction: 4.7,
    lastActive: "2 hours ago",
    role: "Team Lead",
  },
];

export const tableHeaders = [
  "Agent",
  "Status",
  "Active Chats",
  "Total Chats",
  "Avg. Response Time",
  "Rating",
  "Last Active",
  "Actions",
];

export const sampleTemplates = [
  {
    id: "order_update_1",
    name: "order_update_1",
    category: "Utility",
    status: "Approved",
    language: "en_US",
    lastUpdated: "2025-11-20",
    type: "Transactional",
    header: { type: "text", text: "Order {{1}}" },
    body: "Hi {{1}}, your order {{2}} has been shipped. Track here {{3}}",
    footer: "Thanks for ordering",
    buttons: [
      { type: "url", text: "Track", value: "https://track.example.com/123" },
    ],
  },
  {
    id: "promo_1",
    name: "promo_1",
    category: "Promotional",
    status: "Pending",
    language: "en_US",
    lastUpdated: "2025-11-22",
    type: "Marketing",
    header: { type: "none" },
    body: "Hello {{1}}! Enjoy 20% off with code {{2}}",
    footer: "T&Cs apply",
    buttons: [
      { type: "quick_reply", text: "Claim" },
      { type: "quick_reply", text: "Later" },
    ],
  },
];

export const sampleCampaigns = [
  {
    id: "camp_001",
    name: "Black Friday Sale 2025",
    type: "Broadcast",
    audience: "All Customers",
    template: "order_update_1",
    totalRecipients: 1250,
    status: "Completed",
    delivered: 1198,
    seen: 1045,
    failed: 52,
    createdAt: "2025-11-24 10:30 AM",
  },
  {
    id: "camp_002",
    name: "Welcome Series",
    type: "Drip",
    audience: "New Subscribers",
    template: "welcome_message",
    totalRecipients: 340,
    status: "Active",
    delivered: 320,
    seen: 285,
    failed: 20,
    createdAt: "2025-11-20 09:15 AM",
  },
  {
    id: "camp_003",
    name: "Holiday Reminder",
    type: "Scheduled",
    audience: "Premium Members",
    template: "payment_confirmation",
    totalRecipients: 580,
    status: "Scheduled",
    delivered: 0,
    seen: 0,
    failed: 0,
    createdAt: "2025-11-28 02:00 PM",
  },
  {
    id: "camp_004",
    name: "Cart Abandonment",
    type: "Drip",
    audience: "Abandoned Carts",
    template: "order_update_1",
    totalRecipients: 125,
    status: "Active",
    delivered: 110,
    seen: 92,
    failed: 15,
    createdAt: "2025-11-22 11:45 AM",
  },
  {
    id: "camp_005",
    name: "Customer Feedback",
    type: "Broadcast",
    audience: "Recent Buyers",
    template: "welcome_message",
    totalRecipients: 890,
    status: "Paused",
    delivered: 450,
    seen: 380,
    failed: 28,
    createdAt: "2025-11-18 03:20 PM",
  },
];