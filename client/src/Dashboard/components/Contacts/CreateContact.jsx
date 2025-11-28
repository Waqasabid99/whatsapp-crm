import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const CreateContact = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    tags: [],
    notes: "",
    customFields: [],
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Available tags (you can fetch these from API)
  const availableTags = [
    "VIP",
    "Lead",
    "Customer",
    "Active",
    "Newsletter",
    "Premium",
    "Trial",
    "Enterprise",
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleAddTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAddCustomTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const handleAddCustomField = () => {
    setFormData({
      ...formData,
      customFields: [
        ...formData.customFields,
        { id: Date.now(), key: "", value: "" },
      ],
    });
  };

  const handleRemoveCustomField = (id) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.filter((field) => field.id !== id),
    });
  };

  const handleCustomFieldChange = (id, field, value) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.map((cf) =>
        cf.id === id ? { ...cf, [field]: value } : cf
      ),
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phone || formData.phone.length < 10) {
      newErrors.phone = "Valid phone number is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Contact data:", formData);
      if (onSave) {
        onSave(formData);
      }
      setSaving(false);
      alert("Contact created successfully!");
      if (onClose) {
        onClose();
      }
    }, 1000);
  };

  const handleKeyPress = (e, callback) => {
    if (e.key === "Enter") {
      e.preventDefault();
      callback();
    }
  };

  return (
    <div
      className="flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Add New Contact
            </h2>
            <p className="text-sm mt-1" style={{ color: "#73838C" }}>
              Fill in the details to create a new contact
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Full Name <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, () => {})}
                placeholder="Enter full name"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.fullName ? "#DC2626" : "#D1D5DB",
                }}
              />
              {errors.fullName && (
                <p className="text-sm mt-1" style={{ color: "#DC2626" }}>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Phone Number <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <PhoneInput
                country={"pk"}
                value={formData.phone}
                onChange={(phone) => handleInputChange("phone", phone)}
                inputStyle={{
                  width: "100%",
                  height: "42px",
                  fontSize: "14px",
                  borderColor: errors.phone ? "#DC2626" : "#D1D5DB",
                  borderRadius: "6px",
                }}
                containerStyle={{
                  width: "100%",
                }}
                buttonStyle={{
                  borderColor: errors.phone ? "#DC2626" : "#D1D5DB",
                  borderRadius: "6px 0 0 6px",
                }}
                dropdownStyle={{
                  borderRadius: "6px",
                }}
              />
              {errors.phone && (
                <p className="text-sm mt-1" style={{ color: "#DC2626" }}>
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Email <span style={{ color: "#73838C" }}>(optional)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.email ? "#DC2626" : "#D1D5DB",
                }}
              />
              {errors.email && (
                <p className="text-sm mt-1" style={{ color: "#DC2626" }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Tags
              </label>

              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded text-sm font-medium flex items-center gap-2"
                      style={{
                        backgroundColor: "#E0F2FE",
                        color: "#0066CC",
                      }}
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:opacity-70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Available Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {availableTags
                  .filter((tag) => !formData.tags.includes(tag))
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="px-3 py-1 rounded text-sm border transition-colors hover:bg-gray-50"
                      style={{
                        borderColor: "#D1D5DB",
                        color: "#73838C",
                      }}
                    >
                      + {tag}
                    </button>
                  ))}
              </div>

              {/* Add Custom Tag */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, handleAddCustomTag)}
                  placeholder="Add custom tag..."
                  className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
                <button
                  onClick={handleAddCustomTag}
                  className="px-4 py-2 rounded text-white hover:opacity-90"
                  style={{ backgroundColor: "#00A63E" }}
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Custom Fields */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-800">
                  Custom Fields
                </label>
                <button
                  onClick={handleAddCustomField}
                  className="px-3 py-1 rounded text-sm border transition-colors hover:bg-green-50"
                  style={{
                    borderColor: "#00A63E",
                    color: "#00A63E",
                  }}
                >
                  + Add Field
                </button>
              </div>

              {formData.customFields.length > 0 && (
                <div className="space-y-3">
                  {formData.customFields.map((field) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) =>
                          handleCustomFieldChange(
                            field.id,
                            "key",
                            e.target.value
                          )
                        }
                        placeholder="Field name"
                        className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2"
                        style={{ borderColor: "#D1D5DB" }}
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) =>
                          handleCustomFieldChange(
                            field.id,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Field value"
                        className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2"
                        style={{ borderColor: "#D1D5DB" }}
                      />
                      <button
                        onClick={() => handleRemoveCustomField(field.id)}
                        className="p-2 rounded hover:bg-red-100 transition-colors"
                        style={{ color: "#DC2626" }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.customFields.length === 0 && (
                <p className="text-sm" style={{ color: "#73838C" }}>
                  No custom fields added. Click "Add Field" to create custom
                  fields.
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Add any additional notes about this contact..."
                rows={4}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                style={{ borderColor: "#D1D5DB" }}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className="flex justify-end gap-3 mt-6 pt-6 border-t"
            style={{ borderColor: "#E5E7EB" }}
          >
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 rounded border transition-colors"
              style={{ 
                borderColor: "#73838C", 
                color: "#73838C",
                opacity: saving ? 0.5 : 1,
                cursor: saving ? "not-allowed" : "pointer"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-6 py-2 rounded text-white hover:opacity-90 transition-opacity flex items-center gap-2"
              style={{ 
                backgroundColor: "#00A63E",
                opacity: saving ? 0.7 : 1,
                cursor: saving ? "not-allowed" : "pointer"
              }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Create Contact"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateContact;