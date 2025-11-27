const ContactDetails = ({ selectedChat }) => {
  if (!selectedChat) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Contact Info */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center text-white text-3xl font-semibold mb-3">
            {selectedChat.avatar}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedChat.name}</h3>
          <p className="text-sm text-gray-500">{selectedChat.phone}</p>
          <p className="text-sm text-gray-500">{selectedChat.email}</p>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {selectedChat.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Assigned Agent */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Assigned Agent</h4>
          <p className="text-sm text-gray-600">{selectedChat.agent}</p>
        </div>

        {/* Labels */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Labels</h4>
          <div className="flex flex-wrap gap-2">
            {selectedChat.labels.map((label, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">{selectedChat.notes}</p>
          </div>
        </div>

        {/* Custom Fields */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Custom Fields</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer Type:</span>
              <span className="text-gray-900 font-medium">Premium</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Source:</span>
              <span className="text-gray-900 font-medium">Website</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Purchase:</span>
              <span className="text-gray-900 font-medium">Nov 20, 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContactDetails;