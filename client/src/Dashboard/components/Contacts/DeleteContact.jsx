  const DeleteModal = ({ contact, onClose, onConfirm, isLoading }) => {
    if (!contact) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: "#E5E7EB" }}
          >
            <h2 className="text-lg font-semibold text-gray-800">
              Delete Contact
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete{" "}
              <strong>{contact.name || contact.phoneNumber}</strong>? This
              action cannot be undone.
            </p>
            <div
              className="p-3 rounded text-sm"
              style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
            >
              ⚠️ All contact data and message history will be permanently
              removed.
            </div>
          </div>

          <div
            className="flex justify-end gap-3 p-4 border-t"
            style={{ borderColor: "#E5E7EB" }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border hover:bg-gray-50 transition-colors"
              style={{ borderColor: "#D1D5DB", color: "#6B7280" }}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(contact.id)}
              className="px-4 py-2 rounded text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#DC2626" }}
            >
              {isLoading ? (
                <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-4"></div>
                Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default DeleteModal;