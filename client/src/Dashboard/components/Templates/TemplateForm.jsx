import { useState } from "react";
import axios from "axios";
import { backendUrl } from "../../../utils/constants";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const TemplateForm = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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

  const extractPlaceholders = (text) => {
    const regex = /{{\d+}}/g;
    return text.match(regex) || [];
  };

  const buildComponents = () => {
    const components = [];

    // Header
    if (form.headerType === "text" && form.headerText) {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: form.headerText
      });
    } else if (form.headerType === "image") {
      components.push({
        type: "HEADER",
        format: "IMAGE"
      });
    } else if (form.headerType === "video") {
      components.push({
        type: "HEADER",
        format: "VIDEO"
      });
    } else if (form.headerType === "document") {
      components.push({
        type: "HEADER",
        format: "DOCUMENT"
      });
    }

    // Body (Required)
    if (form.bodyText) {
      components.push({
        type: "BODY",
        text: form.bodyText
      });
    }

    // Footer
    if (form.footerText) {
      components.push({
        type: "FOOTER",
        text: form.footerText
      });
    }

    // Buttons
    if (form.buttons.length > 0) {
      const buttonComponents = form.buttons.map((btn) => {
        if (btn.type === "quick_reply") {
          return { type: "QUICK_REPLY", text: btn.text };
        } else if (btn.type === "url") {
          return { type: "URL", text: btn.text, url: btn.url || "https://example.com" };
        } else if (btn.type === "call") {
          return { type: "PHONE_NUMBER", text: btn.text, phone_number: btn.phone || "+1234567890" };
        }
        return null;
      }).filter(Boolean);

      if (buttonComponents.length > 0) {
        components.push({
          type: "BUTTONS",
          buttons: buttonComponents
        });
      }
    }

    return components;
  };

  const addButton = () => {
    if (form.buttons.length >= 3) {
      alert("Maximum 3 buttons allowed");
      return;
    }
    setForm({
      ...form,
      buttons: [...form.buttons, { type: "quick_reply", text: "", url: "", phone: "" }]
    });
  };

  const removeButton = (idx) => {
    setForm({ ...form, buttons: form.buttons.filter((_, i) => i !== idx) });
  };

  const updateButton = (idx, field, value) => {
    const updated = [...form.buttons];
    updated[idx][field] = value;
    setForm({ ...form, buttons: updated });
  };

  const submitHandler = async () => {
    if (!form.name || !form.bodyText) {
      alert("Template name and body text are required");
      return;
    }

    setLoading(true);

    try {
      const components = buildComponents();

      const {data} = await axios.post(`${backendUrl}/template/create-template`, {
          name: form.name.toLowerCase().replace(/\s/g, "_"),
          language: form.language,
          category: form.category,
          components
        },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);

        // Ask if user wants to submit to WhatsApp
        if (window.confirm("Submit this template to WhatsApp for approval?")) {
          const submitResponse = await axios.post(`${backendUrl}/template/submit-to-whatsapp/${data.template.id}`, { withCredentials: true });
          alert(submitResponse.data.message);
          navigate(-1); 
        }

        // Reset form
        setForm({
          name: "",
          category: "UTILITY",
          language: "en_US",
          headerType: "none",
          headerText: "",
          bodyText: "",
          footerText: "",
          buttons: []
        });
      }
    } catch (err) {
      console.error(err);
      alert(err.data?.message || "Error creating template");
    } finally {
      setLoading(false);
    }
  };

  const placeholders = extractPlaceholders(form.bodyText);

  return (
    <div className="min-h-screen w-full p-4 md:p-6" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Create WhatsApp Template</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* FORM */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <div className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Template Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., welcome_message"
                  className="w-full p-3 rounded border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <p className="text-xs mt-1 text-gray-500">
                  Lowercase, numbers, and underscores only
                </p>
              </div>

              {/* Category & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Category *
                  </label>
                  <select
                    className="w-full p-3 rounded border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Language *
                  </label>
                  <select
                    className="w-full p-3 rounded border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
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
                  </select>
                </div>
              </div>

              {/* Header */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Header (Optional)
                </label>
                <select
                  className="w-full p-3 rounded border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none mb-2"
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
                    placeholder="Header text"
                    className="w-full p-3 rounded border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                    value={form.headerText}
                    onChange={(e) => setForm({ ...form, headerText: e.target.value })}
                  />
                )}
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Body Text *
                </label>
                <textarea
                  className="w-full p-3 rounded border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  rows="5"
                  placeholder="Hello {{1}}, your appointment is on {{2}}."
                  value={form.bodyText}
                  onChange={(e) => setForm({ ...form, bodyText: e.target.value })}
                />
                <p className="text-xs mt-1 text-gray-500">
                  Use {`{{1}}`}, {`{{2}}`} for variables
                </p>
              </div>

              {/* Placeholders */}
              {placeholders.length > 0 && (
                <div className="p-3 rounded bg-blue-50 border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {placeholders.map((p, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Footer (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Powered by Your Company"
                  className="w-full p-3 rounded border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  value={form.footerText}
                  onChange={(e) => setForm({ ...form, footerText: e.target.value })}
                />
              </div>

              {/* Buttons */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Buttons (Optional, max 3)
                </label>
                {form.buttons.map((btn, idx) => (
                  <div key={idx} className="mb-3 p-3 rounded border border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <select
                        className="p-2 rounded border border-gray-300 text-sm"
                        value={btn.type}
                        onChange={(e) => updateButton(idx, "type", e.target.value)}
                      >
                        <option value="quick_reply">Quick Reply</option>
                        <option value="url">URL</option>
                        <option value="call">Call</option>
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
                      placeholder="Button text"
                      className="w-full p-2 rounded border border-gray-300 mb-2 text-sm"
                      value={btn.text}
                      onChange={(e) => updateButton(idx, "text", e.target.value)}
                    />
                    {btn.type === "url" && (
                      <input
                        type="text"
                        placeholder="https://example.com"
                        className="w-full p-2 rounded border border-gray-300 text-sm"
                        value={btn.url}
                        onChange={(e) => updateButton(idx, "url", e.target.value)}
                      />
                    )}
                    {btn.type === "call" && (
                      <input
                        type="text"
                        placeholder="+1234567890"
                        className="w-full p-2 rounded border border-gray-300 text-sm"
                        value={btn.phone}
                        onChange={(e) => updateButton(idx, "phone", e.target.value)}
                      />
                    )}
                  </div>
                ))}

                {form.buttons.length < 3 && (
                  <button
                    onClick={addButton}
                    className="px-4 py-2 rounded text-white text-sm"
                    style={{ backgroundColor: '#00A63E' }}
                  >
                    + Add Button
                  </button>
                )}
              </div>

              {/* Submit */}
              <button
                onClick={submitHandler}
                disabled={loading}
                className="w-full py-3 rounded font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#00A63E' }}
              >
                {loading ? "Creating..." : "Create Template"}
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">WhatsApp Preview</h2>
            
            <div className="rounded-lg p-4" style={{ backgroundColor: '#E5DDD5' }}>
              <div className="bg-white rounded-lg shadow-sm max-w-sm p-3 ml-auto">
                {/* Header */}
                {form.headerType === "text" && form.headerText && (
                  <div className="font-bold text-base mb-2 text-gray-800">
                    {form.headerText}
                  </div>
                )}
                {form.headerType === "image" && (
                  <div className="mb-2 rounded bg-gray-100 h-32 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {form.headerType === "video" && (
                  <div className="mb-2 rounded bg-gray-100 h-32 flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                )}
                {form.headerType === "document" && (
                  <div className="mb-2 p-2 rounded bg-gray-100 flex items-center gap-2">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500">Document</span>
                  </div>
                )}

                {/* Body */}
                {form.bodyText ? (
                  <div className="text-gray-800 text-sm whitespace-pre-wrap mb-2">
                    {form.bodyText}
                  </div>
                ) : (
                  <div className="text-sm mb-2 text-gray-400">
                    Message body will appear here...
                  </div>
                )}

                {/* Footer */}
                {form.footerText && (
                  <div className="text-xs text-gray-500 mt-2">
                    {form.footerText}
                  </div>
                )}

                {/* Buttons */}
                {form.buttons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                    {form.buttons.map((btn, idx) => (
                      <button
                        key={idx}
                        className="w-full py-2 text-center text-sm font-medium rounded"
                        style={{ color: '#00A63E', backgroundColor: '#F0F0F0' }}
                      >
                        {btn.type === "call" && "📞 "}
                        {btn.type === "url" && "🔗 "}
                        {btn.text || `Button ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-xs text-right mt-2 text-gray-500">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            <p className="text-xs mt-4 text-gray-500">
              Preview of how your template will appear on WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateForm;