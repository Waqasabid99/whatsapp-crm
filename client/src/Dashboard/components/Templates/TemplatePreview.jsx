// src/modules/templates/TemplatesList.jsx
import { useState } from "react";
import LoadingPage from "../../../utils/LoadingPage.jsx";
import { sampleTemplates } from "../../../utils/constants.jsx";

// Sample data structure
const templates = [
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
    id: "welcome_msg",
    name: "welcome_message",
    category: "Marketing",
    status: "Approved",
    language: "en_US",
    lastUpdated: "2025-11-22",
    type: "Marketing",
    header: { type: "text", text: "Welcome! 🎉" },
    body: "Hi {{1}}, welcome to our store! We're excited to have you.",
    footer: "Powered by Your Company",
    buttons: [
      { type: "quick_reply", text: "Get Started" },
      { type: "url", text: "Visit Website", value: "https://example.com" },
    ],
  },
  {
    id: "payment_confirm",
    name: "payment_confirmation",
    category: "Utility",
    status: "Pending",
    language: "en_US",
    lastUpdated: "2025-11-25",
    type: "Transactional",
    header: { type: "text", text: "Payment Received" },
    body: "Your payment of ${{1}} has been received. Receipt: {{2}}",
    footer: "Thank you for your business",
    buttons: [
      { type: "url", text: "Download Receipt", value: "https://receipt.example.com" },
    ],
  },
];

const TemplatePreview = ({ tpl, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#73838C' }}>
          <h2 className="text-xl font-semibold text-gray-800">Template Preview</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm mb-4" style={{ color: '#73838C' }}>
            This is how your template will appear on your customer's WhatsApp
          </p>

          <div className="mx-auto max-w-sm">
            <div className="rounded-t-3xl p-3 flex items-center gap-2" style={{ backgroundColor: '#00A63E' }}>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-semibold" style={{ color: '#00A63E' }}>
                C
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold text-sm">Customer Name</div>
                <div className="text-white text-xs opacity-90">online</div>
              </div>
            </div>

            <div className="p-4 min-h-96" style={{ backgroundColor: '#E5DDD5' }}>
              <div className="bg-white rounded-lg shadow-md max-w-xs ml-auto p-3">
                {tpl.header && tpl.header.type === "text" && tpl.header.text && (
                  <div className="font-bold text-base mb-2 text-gray-800">
                    {tpl.header.text}
                  </div>
                )}
                
                {tpl.header && tpl.header.type === "image" && (
                  <div className="mb-2 rounded overflow-hidden -mx-3 -mt-3" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="h-40 flex items-center justify-center" style={{ color: '#73838C' }}>
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}

                {tpl.header && tpl.header.type === "video" && (
                  <div className="mb-2 rounded overflow-hidden -mx-3 -mt-3" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="h-40 flex items-center justify-center" style={{ color: '#73838C' }}>
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        <div className="text-sm">Video</div>
                      </div>
                    </div>
                  </div>
                )}

                {tpl.body ? (
                  <div className="text-gray-800 text-sm whitespace-pre-wrap mb-1 leading-relaxed">
                    {tpl.body}
                  </div>
                ) : (
                  <div className="text-sm mb-1" style={{ color: '#73838C' }}>
                    Message body will appear here...
                  </div>
                )}

                {tpl.footer && (
                  <div className="text-xs mt-2 mb-1" style={{ color: '#73838C' }}>
                    {tpl.footer}
                  </div>
                )}

                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs" style={{ color: '#73838C' }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <svg className="w-4 h-4" style={{ color: '#00A63E' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>

                {tpl.buttons && tpl.buttons.length > 0 && (
                  <div className="mt-3 pt-3 -mx-3 -mb-3 px-3 pb-2 border-t space-y-2" style={{ borderColor: '#E9ECEF' }}>
                    {tpl.buttons.map((btn, i) => (
                      <button
                        key={i}
                        className="w-full py-2 text-center text-sm font-medium rounded transition-colors"
                        style={{ color: '#00A63E', backgroundColor: '#F0F9F4' }}
                      >
                        {btn.type === "call" && "📞 "}
                        {btn.type === "url" && "🔗 "}
                        {btn.type === "quick_reply" && "↩️ "}
                        {btn.text || `Button ${i + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-b-3xl p-3 flex items-center gap-2" style={{ backgroundColor: '#F9FAFB' }}>
              <div className="flex-1 rounded-full px-4 py-2 text-sm" style={{ backgroundColor: 'white', color: '#73838C' }}>
                Type a message...
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00A63E' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t" style={{ borderColor: '#73838C' }}>
          <button onClick={onClose} className="px-4 py-2 rounded text-white hover:opacity-90" style={{ backgroundColor: '#00A63E' }}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
export default TemplatePreview;