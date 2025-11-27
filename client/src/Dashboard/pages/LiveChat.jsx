import { useState } from "react";
import ChatList from "../components/LiveChat/ChatList";
import ChatWindow from "../components/LiveChat/ChatWindow";
import ContactDetails from "../components/LiveChat/ChatDetails";
import { initialConversations } from "../../utils/constants";

// Main Component: LiveChat
const LiveChat = () => {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = (messageText) => {
    if (!selectedChat) return;

    const newMessage = {
      id: selectedChat.messages.length + 1,
      text: messageText,
      sender: 'agent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedChat.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageText,
          timestamp: 'Just now'
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage]
    });
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="flex min-h-[calc(100vh-70px)] max-h-screen bg-gray-100">
      <ChatList
        conversations={conversations}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ChatWindow
        selectedChat={selectedChat}
        onSendMessage={handleSendMessage}
        onBack={() => setSelectedChat(null)}
      />
      <ContactDetails selectedChat={selectedChat} />
    </div>
  );
};

export default LiveChat;