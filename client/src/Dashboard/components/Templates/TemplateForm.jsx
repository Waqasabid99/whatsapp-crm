import { useState } from "react";

const TemplateForm = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "UTILITY",
    language: "en_US",
    headerType: "none",
    headerText: "",
    bodyText: "",
    footerText: "",
    buttons: []
  });

  const addButton = () => {
    setForm({
      ...form,
      buttons: [...form.buttons, { type: "quick_reply", text: "" }]
    });
  };

  const removeButton = (idx) => {
    const updated = form.buttons.filter((_, i) => i !== idx);
    setForm({ ...form, buttons: updated });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    alert("Template submitted to Meta API!");
  };

  return (
    <div className="min-h-screen w-full p-6" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Template</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE - FORM */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Template Details</h2>

            {/* BASIC INFO */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#73838C' }}>
                  Template Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., welcome_message"
                  className="w-full p-3 rounded border"
                  style={{ borderColor: '#73838C', backgroundColor: '#F9FAFB' }}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <p className="text-sm">Template name must be unique and should contain only lowercase letters, numbers and underscores</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#73838C' }}>
                    Category
                  </label>
                  <select
                    className="w-full p-3 rounded border"
                    style={{ borderColor: '#73838C', backgroundColor: '#F9FAFB' }}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                    <option value="SERVICE">Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#73838C' }}>
                    Language
                  </label>
                  <select
                    className="w-full p-3 rounded border"
                    style={{ borderColor: '#73838C', backgroundColor: '#F9FAFB' }}
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                  >
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (UK)</option>
                    <option value="ur_PK">Urdu (Pakistan)</option>
                    <option value="ar">Arabic</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi_IN">Hindi (India)</option>
                    <option value="pt_BR">Portuguese (Brazil)</option>
                    <option value="zh_CN">Chinese (Simplified)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* HEADER */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Header</h3>
              <select
                className="w-full p-3 rounded border mb-3"
                style={{ borderColor: '#73838C', backgroundColor: '#F9FAFB' }}
                value={form.headerType}
                onChange={(e) => setForm({ ...form, headerType: e.target.value })}
              >
                <option value="none">None</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
              </select>

              {form.headerType === "text" && (
                <input
                  type="text"
                  placeholder="Header text (e.g., Welcome!)"
                  className="w-full p-3 rounded border"
                  style={{ borderColor: '#73838C', backgroundColor: '#F9FAFB' }}
                  value={form.headerText}
                  onChange={(e) => setForm({ ...form, headerText: e.target.value })}
                />
              )}

              {(form.headerType === "image" || form.headerType === "video" || form.headerType === "document") && (
                <p className="text-sm mt-2" style={{ color: '#73838C' }}>
                  Media will be uploaded when sending messages
                </p>
              )}
            </div>

            {/* BODY */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Body</h3>
              <textarea
                className="w-full p-3 rounded border h-32"
                style={{ borderColor: '#73838C', backgroundColor: '#F9FAFB' }}
                placeholder="Message body with variables {{1}}, {{2}}"
                value={form.bodyText}
                onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
              />
              <p className="text-xs mt-1" style={{ color: '#73838C' }}>
                Use {'{{1}}'}, {'{{2}}'} for dynamic variables
              </p>
            </div>

            {/* BUTTONS */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Buttons</h3>
              {form.buttons.map((btn, idx) => (
                <div key={idx} className="mb-3 p-3 rounded border" style={{ borderColor: '#73838C', backgroundColor: '#F9FAFB' }}>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select
                      className="p-2 rounded border"
                      style={{ borderColor: '#73838C' }}
                      value={btn.type}
                      onChange={(e) => {
                        const updated = [...form.buttons];
                        updated[idx].type = e.target.value;
                        setForm({ ...form, buttons: updated });
                      }}
                    >
                      <option value="quick_reply">Quick Reply</option>
                      <option value="call">Call</option>
                      <option value="url">Visit Website</option>
                    </select>
                    <button
                      onClick={() => removeButton(idx)}
                      className="text-red-600 text-sm hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder={btn.type === "call" ? "Phone number" : "Button text"}
                    className="w-full p-2 rounded border"
                    style={{ borderColor: '#73838C' }}
                    value={btn.text}
                    onChange={(e) => {
                      const updated = [...form.buttons];
                      updated[idx].text = e.target.value;
                      setForm({ ...form, buttons: updated });
                    }}
                  />
                </div>
              ))}

              <button
                onClick={addButton}
                className="px-4 py-2 rounded text-white hover:opacity-90"
                style={{ backgroundColor: '#00A63E' }}
              >
                + Add Button
              </button>
            </div>

            {/* FOOTER */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Footer (Optional)</h3>
              <input
                type="text"
                placeholder="Footer text (e.g., Powered by Your Company)"
                className="w-full p-3 rounded border"
                style={{ borderColor: '#73838C', backgroundColor: '#F9FAFB' }}
                value={form.footerText}
                onChange={(e) => setForm({ ...form, footerText: e.target.value })}
              />
            </div>

            {/* SUBMIT */}
            <button
              onClick={submitHandler}
              disabled={loading}
              className="py-3 rounded font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: '#00A63E' }}
            >
              {loading ? "Submitting..." : "Submit Template"}
            </button>
          </div>

          {/* RIGHT SIDE - WHATSAPP PREVIEW */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">WhatsApp Preview</h2>
            
            <div className="rounded-lg p-4" style={{ backgroundColor: '#E5DDD5' }}>
              <div className="bg-white rounded-lg shadow-sm max-w-sm p-3 ml-auto">
                {/* Header */}
                {form.headerType === "text" && form.headerText && (
                  <div className="font-bold text-lg mb-2 text-gray-800">
                    {form.headerText}
                  </div>
                )}
                {form.headerType === "image" && (
                  <div className="mb-2 rounded overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="h-32 flex items-center justify-center" style={{ color: '#73838C' }}>
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
                {form.headerType === "video" && (
                  <div className="mb-2 rounded overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
                    <div className="h-32 flex items-center justify-center" style={{ color: '#73838C' }}>
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                  </div>
                )}
                {form.headerType === "document" && (
                  <div className="mb-2 p-3 rounded flex items-center gap-2" style={{ backgroundColor: '#F9FAFB' }}>
                    <svg className="w-8 h-8" style={{ color: '#73838C' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm" style={{ color: '#73838C' }}>Document.pdf</span>
                  </div>
                )}

                {/* Body */}
                {form.bodyText ? (
                  <div className="text-gray-800 text-sm whitespace-pre-wrap mb-2">
                    {form.bodyText}
                  </div>
                ) : (
                  <div className="text-sm mb-2" style={{ color: '#73838C' }}>
                    Your message will appear here...
                  </div>
                )}

                {/* Buttons */}
                {form.buttons.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1" style={{ borderColor: '#73838C33' }}>
                    {form.buttons.map((btn, idx) => (
                      <button
                        key={idx}
                        className="w-full py-2 text-center text-sm font-medium rounded hover:opacity-80"
                        style={{ color: '#00A63E', backgroundColor: '#F9FAFB' }}
                      >
                        {btn.type === "call" && "📞 "}
                        {btn.type === "url" && "🔗 "}
                        {btn.text || `Button ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer */}
                {form.footerText && (
                  <div className="text-xs mt-4 mx-5" style={{ color: '#73838C' }}>
                    {form.footerText}
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-right mt-2" style={{ color: '#73838C' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <p className="text-xs mt-4" style={{ color: '#73838C' }}>
              This is how your template will appear to customers on WhatsApp. Styles may vary based on their device and WhatsApp version.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateForm;