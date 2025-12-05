import { useState } from 'react';
import { Mail, UserPlus } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../../../utils/constants';
import { toast, ToastContainer } from 'react-toastify';
const AddStaffModal = ({ onClose, workspaceId, refreshTable }) => {
  const [mode, setMode] = useState('create'); // 'create' or 'invite'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'AGENT'
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (mode === 'create') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const endpoint = mode === 'create' 
        ? `${backendUrl}/staff/create-staff?workspaceId=${workspaceId}`
        : `${backendUrl}/staff/invite-staff?workspaceId=${workspaceId}`;

      const payload = mode === 'create'
        ? { name: formData.name, email: formData.email, password: formData.password, role: formData.role }
        : { email: formData.email, role: formData.role };

      const { data } = await axios.post(endpoint, payload, { withCredentials: true });
      if (data.success) {
        setLoading(false);
        toast.success(data.message);
        refreshTable(prev => prev + 1);
        onClose();
      } else {
        setLoading(false);
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <ToastContainer />
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Add Staff Member
            </h2>
            <p className="text-sm mt-1" style={{ color: '#73838C' }}>
              {mode === 'create' 
                ? 'Create a new staff account' 
                : 'Send an invitation to join'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-6 pb-4">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                mode === 'create'
                  ? 'text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={mode === 'create' ? { backgroundColor: '#00A63E' } : { color: '#73838C' }}
            >
              <UserPlus className="w-4 h-4" />
              Create Staff
            </button>
            <button
              onClick={() => setMode('invite')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                mode === 'invite'
                  ? 'text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={mode === 'invite' ? { backgroundColor: '#00A63E' } : { color: '#73838C' }}
            >
              <Mail className="w-4 h-4" />
              Invite Staff
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {mode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Full Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.name ? '#DC2626' : '#D1D5DB',
                  }}
                />
                {errors.name && (
                  <p className="text-sm mt-1" style={{ color: '#DC2626' }}>
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Email Address <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.email ? '#DC2626' : '#D1D5DB',
                }}
              />
              {errors.email && (
                <p className="text-sm mt-1" style={{ color: '#DC2626' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {mode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Password <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.password ? '#DC2626' : '#D1D5DB',
                  }}
                />
                {errors.password && (
                  <p className="text-sm mt-1" style={{ color: '#DC2626' }}>
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Role <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                style={{
                  borderColor: errors.role ? '#DC2626' : '#D1D5DB',
                }}
              >
                <option value="AGENT">Agent</option>
                <option value="VIEWER">Viewer</option>
              </select>
              {errors.role && (
                <p className="text-sm mt-1" style={{ color: '#DC2626' }}>
                  {errors.role}
                </p>
              )}
              <p className="text-xs mt-2" style={{ color: '#73838C' }}>
                {formData.role === 'AGENT' && '• Can manage contacts and handle conversations'}
                {formData.role === 'VIEWER' && '• Read-only access to view data'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex justify-end gap-3 p-6 pt-4 border-t"
          style={{ borderColor: '#E5E7EB' }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded border transition-colors"
            style={{ 
              borderColor: '#73838C', 
              color: '#73838C',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 rounded text-white hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ 
              backgroundColor: '#00A63E',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Sending...'}
              </>
            ) : (
              <>
                {mode === 'create' ? (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Staff
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Invite
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal