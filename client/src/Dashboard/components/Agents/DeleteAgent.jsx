import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import axios from 'axios';
import { backendUrl } from '../../../utils/constants';
import { toast } from 'react-toastify';


const DeleteStaffModal = ({ onClose, staff, refreshTable, }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`${backendUrl}/staff/delete-staff/${staff.id}`, { withCredentials: true });
      
      if (data.success) {
        setLoading(false);
       toast.success(data.message || 'Staff member deleted successfully');
        onClose();
        refreshTable(prev => prev + 1);
      } else {
        toast.error(data.message || 'Failed to delete staff member');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete staff member');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FEE2E2' }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: '#DC2626' }} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Delete Staff Member
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-600 hover:text-gray-800 text-2xl leading-none"
            style={{
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-800 mb-4">
            Are you sure you want to delete{' '}
            <strong className="font-semibold" style={{ color: '#DC2626' }}>
              {staff.user?.name || staff.name || 'this staff member'}
            </strong>
            {staff.user?.email && (
              <span style={{ color: '#73838C' }}> ({staff.user.email})</span>
            )}
            ? This action cannot be undone.
          </p>

          <div 
            className="p-4 rounded-lg border-l-4"
            style={{ 
              backgroundColor: '#FFF3E0', 
              borderColor: '#F59E0B'
            }}
          >
            <div className="flex gap-2">
              <AlertTriangle 
                className="w-5 h-5 shrink-0 mt-0.5" 
                style={{ color: '#F59E0B' }} 
              />
              <div>
                <p className="font-semibold mb-1" style={{ color: '#92400E' }}>
                  Warning: This will permanently:
                </p>
                <ul 
                  className="text-sm space-y-1 ml-1"
                  style={{ color: '#78350F' }}
                >
                  <li>• Remove staff member from the workspace</li>
                  <li>• Revoke all access and permissions</li>
                  <li>• Remove assignment from active conversations</li>
                </ul>
              </div>
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
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-2 rounded text-white hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ 
              backgroundColor: '#DC2626',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Delete Staff
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteStaffModal;