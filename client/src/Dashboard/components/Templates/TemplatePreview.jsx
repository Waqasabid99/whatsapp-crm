const TemplatePreview = ({ tpl, isOpen, onClose }) => {
  if (!isOpen) return null;

  // Extract components from template
  const getComponent = (type) => {
    return tpl.components?.find((c) => c.type === type);
  };

  const header = getComponent("HEADER");
  const body = getComponent("BODY");
  const footer = getComponent("FOOTER");
  const buttonsComponent = getComponent("BUTTONS");
  const buttons = buttonsComponent?.buttons || [];

  // Replace placeholders with sample values
  const replacePlaceholders = (text) => {
    if (!text) return "";
    // Replace {{1}}, {{2}}, etc. with sample values
    return text.replace(/\{\{(\d+)\}\}/g, (match, num) => {
      const samples = ["John", "12345", "example.com", "2025-12-07"];
      return samples[parseInt(num) - 1] || match;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Template Preview
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {tpl.name} • {tpl.category}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Preview of how this template appears in WhatsApp
          </p>

          {/* WhatsApp-like UI */}
          <div className="mx-auto max-w-sm">
            {/* Chat Header */}
            <div
              className="rounded-t-2xl p-3 flex items-center gap-3"
              style={{ backgroundColor: "#075E54" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-white"
                style={{ color: "#075E54" }}
              >
                B
              </div>
              <div className="flex-1">
                <div className="text-white font-medium text-sm">
                  Your Business
                </div>
                <div className="text-white/80 text-xs">online</div>
              </div>
            </div>

            {/* Chat Background */}
            <div className="p-4 min-h-[400px] bg-[#E5DDD5] relative">
              {/* Subtle WhatsApp pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />

              {/* Message Bubble */}
              <div className="bg-white rounded-lg shadow-md max-w-xs ml-auto relative z-10">
                {/* Header */}
                {header && (
                  <div>
                    {header.format === "TEXT" && header.text && (
                      <div className="font-semibold text-base px-3 pt-3 pb-2 text-gray-900">
                        {replacePlaceholders(header.text)}
                      </div>
                    )}

                    {header.format === "IMAGE" && (
                      <div className="rounded-t-lg overflow-hidden bg-gray-100">
                        <div className="h-48 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <svg
                              className="w-16 h-16 mx-auto mb-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <p className="text-sm">Image Header</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {header.format === "VIDEO" && (
                      <div className="rounded-t-lg overflow-hidden bg-gray-100">
                        <div className="h-48 flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <svg
                              className="w-16 h-16 mx-auto mb-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                            <p className="text-sm">Video Header</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {header.format === "DOCUMENT" && (
                      <div className="px-3 pt-3 pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium">
                            Document.pdf
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Body */}
                <div className="px-3 py-2">
                  {body && body.text ? (
                    <div className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                      {replacePlaceholders(body.text)}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm italic">
                      No body text
                    </div>
                  )}
                </div>

                {/* Footer */}
                {footer && footer.text && (
                  <div className="px-3 pb-2">
                    <div className="text-xs text-gray-500">{footer.text}</div>
                  </div>
                )}

                {/* Timestamp & Read Receipt */}
                <div className="flex items-center justify-end gap-1 px-3 pb-2">
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Buttons */}
                {buttons.length > 0 && (
                  <div className="border-t border-gray-100">
                    {buttons.map((btn, i) => (
                      <button
                        key={i}
                        className="w-full py-3 text-center text-sm font-medium text-blue-600 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 last:rounded-b-lg flex items-center justify-center gap-2"
                      >
                        {btn.type === "PHONE_NUMBER" && "📞"}
                        {btn.type === "URL" && "🔗"}
                        {btn.type === "QUICK_REPLY" && "↩️"}
                        <span>{btn.text || `Button ${i + 1}`}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Input */}
            <div className="rounded-b-2xl p-3 flex items-center gap-2 bg-gray-50">
              <div className="flex-1 rounded-full px-4 py-2.5 text-sm bg-white text-gray-400 border border-gray-200">
                Type a message...
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#075E54" }}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Template Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium text-gray-900">{tpl.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Language:</span>
              <span className="font-medium text-gray-900">{tpl.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  tpl.approved
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {tpl.approved ? "Approved" : "Pending"}
              </span>
            </div>
            {tpl.placeholders && tpl.placeholders.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Variables:</span>
                <span className="font-medium text-gray-900">
                  {tpl.placeholders.length} placeholder(s)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;