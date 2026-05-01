import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Trash } from "lucide-react";
import { availableTags, backendUrl } from "../../../utils/constants";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const CreateContact = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    metadata: {
      tags: [],
      notes: "",
      customFields: [],
    },
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Generic Setters
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const updateMetadata = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [field]: value },
    }));
  };

  // TAG HANDLING
  const handleAddTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: [...prev.metadata.tags, tag],
      },
    }));
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags.filter((t) => t !== tag),
      },
    }));
  };

  const handleAddCustomTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.metadata.tags.includes(tag)) {
      handleAddTag(tag);
      setNewTag("");
    }
  };

  // CUSTOM FIELDS
  const handleAddCustomField = () => {
    updateMetadata("customFields", [
      ...formData.metadata.customFields,
      { id: Date.now(), key: "", value: "" },
    ]);
  };

  const handleRemoveCustomField = (id) => {
    updateMetadata(
      "customFields",
      formData.metadata.customFields.filter((cf) => cf.id !== id)
    );
  };

  const handleCustomFieldChange = (id, field, value) => {
    updateMetadata(
      "customFields",
      formData.metadata.customFields.map((cf) =>
        cf.id === id ? { ...cf, [field]: value } : cf
      )
    );
  };

  // VALIDATION
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.phone || formData.phone.length < 10)
      newErrors.phone = "Valid phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/contact/create-contact`,
        formData,
        { withCredentials: true }
      );
      if (data.success) {
        setSaving(false);
        toast.success(data.message);
        onClose();
      }
    } catch (error) {
      console.error(error);
      setSaving(false);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter") {
      e.preventDefault();
      callback();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <ToastContainer />
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              New Contact
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Add a contact to your workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? "border-red-300 focus:ring-red-200"
                  : "border-gray-200 focus:ring-green-200 focus:border-green-400"
              }`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              country={"pk"}
              value={formData.phone}
              onChange={(phone) => updateField("phone", phone)}
              inputStyle={{
                width: "100%",
                height: "42px",
                fontSize: "14px",
                borderColor: errors.phone ? "#FCA5A5" : "#E5E7EB",
                borderRadius: "8px",
                paddingLeft: "48px",
              }}
              buttonStyle={{
                borderColor: errors.phone ? "#FCA5A5" : "#E5E7EB",
                borderRadius: "8px 0 0 8px",
              }}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tags
            </label>

            {/* Selected Tags */}
            {formData.metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-green-900 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {availableTags
                .filter((tag) => !formData.metadata.tags.includes(tag))
                .map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="px-2.5 py-1 rounded-md border border-gray-200 text-gray-600 text-xs font-medium hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, handleAddCustomTag)}
                placeholder="Custom tag..."
                className="flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
              />
              <button
                onClick={handleAddCustomTag}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Custom Fields */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Custom Fields
              </label>
              <button
                onClick={handleAddCustomField}
                className="px-3 py-1.5 text-xs font-medium border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                + Add Field
              </button>
            </div>

            {formData.metadata.customFields.length > 0 ? (
              <div className="space-y-2">
                {formData.metadata.customFields.map((field) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      value={field.key}
                      onChange={(e) =>
                        handleCustomFieldChange(field.id, "key", e.target.value)
                      }
                      placeholder="Key"
                      className="flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                    />
                    <input
                      value={field.value}
                      onChange={(e) =>
                        handleCustomFieldChange(
                          field.id,
                          "value",
                          e.target.value
                        )
                      }
                      placeholder="Value"
                      className="flex-1 px-3.5 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                    />
                    <button
                      onClick={() => handleRemoveCustomField(field.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5">
                No custom fields yet
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              value={formData.metadata.notes}
              onChange={(e) => updateMetadata("notes", e.target.value)}
              rows={3}
              placeholder="Add any additional notes..."
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              "Create Contact"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateContact;