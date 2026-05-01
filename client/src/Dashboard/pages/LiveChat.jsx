import { useState, useEffect } from "react";
import ChatList from "../components/LiveChat/ChatList";
import ChatWindow from "../components/LiveChat/ChatWindow";
import ContactDetails from "../components/LiveChat/ChatDetails";
import { backendUrl } from "../../utils/constants";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Loader from "../../utils/LoadingPage";
import { socket } from "../../utils/socket";
import { useParams } from "react-router-dom";

const LiveChat = () => {
  const { id: workspaceId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------------------------------------------------------- */
  /* Initial HTTP fetch of all conversations                          */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${backendUrl}/conversation/conversations`,
          { withCredentials: true }
        );
        if (data.success) {
          setConversations(data.conversations);
        } else {
          toast.error("Failed to load conversations");
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  /* ---------------------------------------------------------------- */
  /* Socket — real-time updates                                        */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!workspaceId) return;

    socket.connect();
    socket.emit("join_workspace", workspaceId);

    /* ── New outbound message sent by staff (via socket message:send) */
    const handleMessageCreated = ({ conversationId, message }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: message,
                lastMessageAt: message.createdAt || new Date().toISOString(),
              }
            : conv
        )
      );
    };

    /* ── New inbound message from WhatsApp contact */
    const handleMessageReceive = ({ conversationId, message }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: message,
                lastMessageAt: message.createdAt || new Date().toISOString(),
                unreadCount:
                  selectedChat?.id === conversationId
                    ? conv.unreadCount          // already open → don't increment
                    : (conv.unreadCount || 0) + 1,
              }
            : conv
        )
      );

      // Toast only when not already viewing that conversation
      if (selectedChat?.id !== conversationId) {
        toast.info(`💬 New message from ${message.sender?.name || "Contact"}`);
      }
    };

    /* ── Conversation metadata update (unreadCount, status, assignee…) */
    const handleConversationUpdate = ({ conversation: patch }) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === patch.id ? { ...conv, ...patch } : conv
        )
      );

      // Keep selectedChat in sync
      setSelectedChat((prev) =>
        prev?.id === patch.id ? { ...prev, ...patch } : prev
      );
    };

    /* ── Message status ticks (DELIVERED / READ / FAILED) */
    const handleStatusUpdate = ({ messageId, status, timestamp, error }) => {
      // Update the selected conversation's message list inside ChatWindow
      // (ChatWindow manages its own messages state; we just keep selectedChat consistent)
      setSelectedChat((prev) => {
        if (!prev) return prev;
        return prev; // ChatWindow handles its own message state via socket
      });

      // If a conversation shows lower unreadCount after READ, reflect it
      if (status === "READ") {
        setConversations((prev) =>
          prev.map((conv) => {
            // We don't know which conv this message belongs to here,
            // so skip — conversation:update covers unreadCount
            return conv;
          })
        );
      }
    };

    socket.on("message:created", handleMessageCreated);
    socket.on("message:receive", handleMessageReceive);
    socket.on("conversation:update", handleConversationUpdate);
    socket.on("message:status:update", handleStatusUpdate);

    return () => {
      socket.off("message:created", handleMessageCreated);
      socket.off("message:receive", handleMessageReceive);
      socket.off("conversation:update", handleConversationUpdate);
      socket.off("message:status:update", handleStatusUpdate);
      socket.disconnect();
    };
  }, [workspaceId, selectedChat?.id]);

  /* ---------------------------------------------------------------- */
  /* Select a conversation + fetch its messages                        */
  /* ---------------------------------------------------------------- */
  const handleSelectChat = async (conv) => {
    setSelectedChat(conv);
    socket.emit("join_conversation", conv.id);

    // Reset unread badge immediately in UI
    if (conv.unreadCount > 0) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id ? { ...c, unreadCount: 0 } : c
        )
      );
      // Tell server to mark unread messages as read
      socket.emit("conversation:markRead", { conversationId: conv.id });
    }
  };

  /* ---------------------------------------------------------------- */
  /* Send message (via HTTP — socket broadcasts it back to all tabs)   */
  /* ---------------------------------------------------------------- */
  const handleSendMessage = async (messageText, attachments = []) => {
    if (!selectedChat) return;

    try {
      const { data } = await axios.post(
        `${backendUrl}/message/${selectedChat.id}/messages`,
        { text: messageText, attachments },
        { withCredentials: true }
      );

      if (!data.success) {
        toast.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    }
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <div className="flex min-h-[calc(100vh-70px)] max-h-screen bg-gray-100">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      {loading ? (
        <div className="flex items-center justify-center w-full h-full">
          <Loader />
        </div>
      ) : (
        <>
          {/* Chat list sidebar — driven by conversations[] directly */}
          <ChatList
            conversations={conversations}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            loading={loading}
          />

          {/* Message thread */}
          <ChatWindow
            selectedChat={selectedChat}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedChat(null)}
          />

          {/* Contact info panel */}
          <ContactDetails selectedChat={selectedChat} />
        </>
      )}
    </div>
  );
};

export default LiveChat;