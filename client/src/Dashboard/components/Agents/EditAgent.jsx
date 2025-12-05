import { useState, useEffect } from "react";
import { Eye, EyeOff, Save } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../../../utils/constants";
import { toast, ToastContainer } from "react-toastify";

const EditStaffModal = ({ onClose, user, refreshTable }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    role: "AGENT",
  });

  // Load user data into form when modal opens
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        role: user.role || "AGENT",
      });
    }
  }, [user]);

  // Update state + clear specific field errors
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (changePassword) {
      if (!formData.currentPassword.trim()) {
        newErrors.currentPassword = "Current password is required";
      }

      if (!formData.newPassword.trim() || formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        ...(changePassword && {
          currentPassword: formData.currentPassword,
          password: formData.newPassword,
        }),
      };

      const { data } = await axios.put(
        `${backendUrl}/staff/update-staff/${user.id}`,
        payload,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message);
        onClose();
        refreshTable(prev => prev + 1);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      <ToastContainer />
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Edit Staff Member
            </h2>
            <p className="text-sm mt-1 text-gray-500">
              Update staff member details
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 pb-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-2 border rounded"
              style={{ borderColor: errors.name ? "#DC2626" : "#D1D5DB" }}
            />
            {errors.name && (
              <p className="text-sm mt-1 text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-2 border rounded"
              style={{ borderColor: errors.email ? "#DC2626" : "#D1D5DB" }}
            />
            {errors.email && (
              <p className="text-sm mt-1 text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Change Password Toggle */}
          <div className="flex items-center justify-between pt-2">
            <label htmlFor="changePassword">Change Password?</label>
            <input
              type="checkbox"
              id="changePassword"
              checked={changePassword}
              onChange={(e) => setChangePassword(e.target.checked)}
            />
          </div>

          {/* Password section (if enabled) */}
          {changePassword && (
            <>
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded"
                    style={{
                      borderColor: errors.currentPassword
                        ? "#DC2626"
                        : "#D1D5DB",
                    }}
                  />
                  {showPassword ? (
                    <EyeOff
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                      size={18}
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                      size={18}
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
                {errors.currentPassword && (
                  <p className="text-sm mt-1 text-red-600">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded"
                  style={{
                    borderColor: errors.newPassword ? "#DC2626" : "#D1D5DB",
                  }}
                />
                {errors.newPassword && (
                  <p className="text-sm mt-1 text-red-600">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded"
                  style={{
                    borderColor: errors.confirmPassword ? "#DC2626" : "#D1D5DB",
                  }}
                />
                {errors.confirmPassword && (
                  <p className="text-sm mt-1 text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="AGENT">Agent</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded border"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded text-white flex items-center gap-2"
            style={{ backgroundColor: "#00A63E" }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditStaffModal;