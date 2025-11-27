const ChatList = ({ conversations, selectedChat, onSelectChat, searchQuery, onSearchChange }) => {
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-green-600 text-white">
        <h2 className="text-xl font-semibold mb-3">Live Chat</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectChat(conv)}
            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
              selectedChat?.id === conv.id ? 'bg-gray-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                  {conv.avatar}
                </div>
                {conv.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{conv.name}</h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{conv.timestamp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  {conv.unread > 0 && (
                    <span className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ChatList;