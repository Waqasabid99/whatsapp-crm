import { useRef, useState, useEffect } from "react";
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, X, Check, CheckCheck, ChevronLeft } from 'lucide-react';

// Component 2: ChatWindow (Center)
const ChatWindow = ({ selectedChat, onSendMessage, onBack }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '😍', '🤔', '👏', '🔥', '💯', '✅', '🙏'];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;
    onSendMessage(message);
    setMessage('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status) => {
    if (status === 'read') return <CheckCheck className="w-4 h-4 text-blue-500" />;
    if (status === 'delivered') return <CheckCheck className="w-4 h-4 text-gray-400" />;
    return <Check className="w-4 h-4 text-gray-400" />;
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
          <p className="text-sm">Choose a chat from the left to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
            {selectedChat.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
            <p className="text-sm text-gray-500">
              {selectedChat.status === 'online' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedChat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md px-4 py-2 rounded-lg ${
                msg.sender === 'agent'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-900'
              } shadow-sm`}
            >
              <p className="text-sm">{msg.text}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-xs opacity-70">{msg.time}</span>
                {msg.sender === 'agent' && getStatusIcon(msg.status)}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        {showEmojiPicker && (
          <div className="mb-3 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-2xl hover:bg-gray-100 p-2 rounded transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Smile className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={handleFileUpload}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Paperclip className="w-6 h-6 text-gray-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => console.log('File selected:', e.target.files[0])}
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatWindow;