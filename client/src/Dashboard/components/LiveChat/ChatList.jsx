import { useMemo, useState } from "react";
import { FiSearch, FiMessageSquare } from "react-icons/fi";
import { MdInbox } from "react-icons/md";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
};

/* Avatar colour — stable per contact name */
const AVATAR_COLORS = [
  "bg-violet-500", "bg-sky-500", "bg-emerald-500",
  "bg-amber-500",  "bg-rose-500", "bg-indigo-500",
  "bg-teal-500",   "bg-fuchsia-500",
];
const avatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const statusLabel = (status) => {
  switch (status) {
    case "OPEN":     return { text: "Open",     cls: "bg-emerald-100 text-emerald-700" };
    case "RESOLVED": return { text: "Resolved", cls: "bg-sky-100 text-sky-700" };
    case "ARCHIVED": return { text: "Archived", cls: "bg-gray-100 text-gray-500" };
    default:         return { text: status,     cls: "bg-gray-100 text-gray-500" };
  }
};

/* ------------------------------------------------------------------ */
/*  ChatList                                                            */
/* ------------------------------------------------------------------ */

/**
 * Props
 *  conversations  – array from GET /conversation/conversations
 *                   each item has: id, status, unreadCount, lastMessageAt,
 *                                  lastMessage { text, direction, createdAt },
 *                                  contact { id, name, phoneNumber, avatarUrl }
 *  selectedChat   – currently selected conversation object (or null)
 *  onSelectChat   – (conversation) => void
 *  searchQuery    – string
 *  onSearchChange – (string) => void
 *  loading        – boolean
 */
const ChatList = ({
  conversations = [],
  selectedChat,
  onSelectChat,
  searchQuery,
  onSearchChange,
  loading = false,
}) => {
  const [activeFilter, setActiveFilter] = useState("ALL");

  /* Filter by status tab then search query */
  const filtered = useMemo(() => {
    let list = conversations;

    if (activeFilter !== "ALL") {
      list = list.filter((c) => c.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.contact?.name?.toLowerCase().includes(q) ||
          c.contact?.phoneNumber?.toLowerCase().includes(q) ||
          c.lastMessage?.text?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [conversations, activeFilter, searchQuery]);

  const tabs = [
    { key: "ALL",      label: "All" },
    { key: "OPEN",     label: "Open" },
    { key: "RESOLVED", label: "Resolved" },
  ];

  /* Unread badge per tab */
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="w-80 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiMessageSquare className="text-green-600" size={20} />
            <h2 className="text-base font-semibold text-gray-900">Live Chat</h2>
          </div>
          {totalUnread > 0 && (
            <span className="bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            id="chat-list-search"
            type="text"
            placeholder="Search conversations…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* ── Status Tabs ─────────────────────────────────────────── */}
      <div className="flex border-b border-gray-100 bg-gray-50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              activeFilter === tab.key
                ? "text-green-600 border-b-2 border-green-500 bg-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── List ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-0.5 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
            <MdInbox size={48} className="text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {searchQuery ? "No results found" : "No conversations yet"}
            </p>
            {searchQuery && (
              <p className="text-xs text-gray-400 mt-1">
                Try a different name or phone number
              </p>
            )}
          </div>
        )}

        {/* Conversation rows */}
        {!loading &&
          filtered.map((conv) => {
            const contact = conv.contact || {};
            const initials = getInitials(contact.name);
            const color = avatarColor(contact.name);
            const isSelected = selectedChat?.id === conv.id;
            const badge = statusLabel(conv.status);
            const previewText =
              conv.lastMessage?.text ||
              (conv.lastMessage ? "📎 Attachment" : "No messages yet");
            const isOutbound = conv.lastMessage?.direction === "OUTBOUND";

            return (
              <button
                key={conv.id}
                onClick={() => onSelectChat(conv)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-50 flex items-start gap-3 transition-colors focus:outline-none ${
                  isSelected
                    ? "bg-green-50 border-l-4 border-l-green-500"
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {contact.avatarUrl ? (
                    <img
                      src={contact.avatarUrl}
                      alt={contact.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold ${color}`}
                    >
                      {initials}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Row 1: name + time */}
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isSelected ? "text-green-700" : "text-gray-900"
                      }`}
                    >
                      {contact.name || contact.phoneNumber || "Unknown"}
                    </span>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2 shrink-0">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>

                  {/* Row 2: last message + unread badge */}
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-gray-500 truncate">
                      {isOutbound && (
                        <span className="text-gray-400 mr-0.5">You: </span>
                      )}
                      {previewText}
                    </p>

                    {conv.unreadCount > 0 ? (
                      <span className="shrink-0 bg-green-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                      </span>
                    ) : (
                      /* Status chip when no unread badge */
                      <span
                        className={`shrink-0 text-[10px] font-medium rounded-full px-1.5 py-0.5 ${badge.cls}`}
                      >
                        {badge.text}
                      </span>
                    )}
                  </div>

                  {/* Row 3: assignee */}
                  {conv.assignee?.user?.name && (
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      Assigned to {conv.assignee.user.name}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default ChatList;