import { useState, useEffect, useRef } from "react";
import { FiSend, FiPaperclip, FiArrowLeft } from "react-icons/fi";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { MdError } from "react-icons/md";
import axios from "axios";
import { backendUrl } from "../../../utils/constants";
import { socket } from "../../../utils/socket";

const ChatWindow = ({ selectedChat, onSendMessage, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
  if (!selectedChat?.id) return;

  socket.emit("join_conversation", selectedChat.id);

  return () => {
    socket.off("message:created");
    socket.off("message:receive");
  };
}, [selectedChat?.id]);

useEffect(() => {
  const handleNewMessage = ({ conversationId, message }) => {
    if (conversationId !== selectedChat?.id) return;

    setMessages((prev) => {
      // avoid duplicates (e.g. if the sender receives their own echo)
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  };

  // message:created  — OUTBOUND messages sent by staff via HTTP
  // message:receive  — INBOUND messages arriving from WhatsApp
  socket.on("message:created", handleNewMessage);
  socket.on("message:receive", handleNewMessage);

  return () => {
    socket.off("message:created", handleNewMessage);
    socket.off("message:receive", handleNewMessage);
  };
}, [selectedChat?.id]);

  /* ---------------------------------- Utils --------------------------------- */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageStatusIcon = (message) => {
    if (message.direction === "INBOUND") return null;

    switch (message.status) {
      case "SENT":
        return <BsCheck size={16} className="text-gray-400" />;
      case "DELIVERED":
        return <BsCheckAll size={16} className="text-gray-400" />;
      case "READ":
        return <BsCheckAll size={16} className="text-blue-500" />;
      case "FAILED":
        return <MdError size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  /* ------------------------------- API Calls -------------------------------- */
  useEffect(() => {
    if (!selectedChat?.id) return;

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/message/${selectedChat.id}/messages`,
          { withCredentials: true }
        );
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [selectedChat?.id]);

  /* ------------------------------ Auto Scroll ------------------------------- */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ------------------------------ Send Logic -------------------------------- */
const handleSend = async () => {
  if (!messageText.trim()) return;

  const tempMessage = {
    id: `temp-${Date.now()}`,
    text: messageText,
    direction: "OUTBOUND",
    status: "SENT",
    createdAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, tempMessage]);
  setMessageText("");

  try {
    await axios.post(
      `${backendUrl}/message/${selectedChat.id}/messages`,
      { text: messageText },
      { withCredentials: true }
    );
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};

  

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ----------------------------- Empty State -------------------------------- */
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a conversation to start chatting</p>
      </div>
    );
  }

  /* --------------------------------- UI ------------------------------------- */
  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={onBack} className="lg:hidden">
          <FiArrowLeft size={20} />
        </button>

        <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
          {selectedChat.contact?.name?.charAt(0)}
        </div>

        <div>
          <h3 className="font-semibold">{selectedChat.contact?.name}</h3>
          <p className="text-sm text-gray-500">
            {selectedChat.contact?.phoneNumber}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.direction === "OUTBOUND"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.direction === "OUTBOUND"
                    ? "bg-green-500 text-white"
                    : "bg-white border"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>

                <div className="flex justify-end items-center gap-1 mt-1">
                  <span
                    className={`text-xs ${
                      msg.direction === "OUTBOUND"
                        ? "text-green-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </span>
                  {getMessageStatusIcon(msg)}
                </div>

                {msg.status === "FAILED" && msg.error && (
                  <p className="text-xs text-red-200 mt-1">{msg.error}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <button className="p-2 text-gray-600">
          <FiPaperclip size={20} />
        </button>

        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 border rounded-lg px-4 py-2 resize-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handleSend}
          disabled={!messageText.trim()}
          className="p-2 bg-green-500 text-white rounded-lg disabled:bg-gray-300"
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;