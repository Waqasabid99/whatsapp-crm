import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateContact from "./CreateContact";

// Sample contacts data
const sampleContacts = [
  {
    id: "contact_1",
    name: "Ahmed Ali",
    phone: "+92 300 1234567",
    tags: ["VIP", "Active"],
    country: "Pakistan",
    lastMessageAt: "11/28/2025, 02:30 PM",
    status: "active",
    createdAt: "10/15/2024, 09:20 AM",
  },
  {
    id: "contact_2",
    name: "Sarah Khan",
    phone: "+92 321 9876543",
    tags: ["Lead", "Newsletter"],
    country: "Pakistan",
    lastMessageAt: "11/27/2025, 11:45 AM",
    status: "active",
    createdAt: "09/22/2024, 03:15 PM",
  },
  {
    id: "contact_3",
    name: "John Smith",
    phone: "+1 555 0123456",
    tags: ["Customer"],
    country: "United States",
    lastMessageAt: "11/25/2025, 08:20 AM",
    status: "blocked",
    createdAt: "08/10/2024, 01:40 PM",
  },
  {
    id: "contact_4",
    name: "Fatima Hassan",
    phone: "+92 345 5551234",
    tags: ["Lead"],
    country: "Pakistan",
    lastMessageAt: "11/20/2025, 04:10 PM",
    status: "unsubscribed",
    createdAt: "07/05/2024, 10:30 AM",
  },
  {
    id: "contact_5",
    name: "Michael Brown",
    phone: "+44 20 7946 0958",
    tags: ["VIP", "Customer", "Premium"],
    country: "United Kingdom",
    lastMessageAt: "11/28/2025, 09:15 AM",
    status: "active",
    createdAt: "11/01/2024, 02:50 PM",
  },
];

const ContactsList = () => {
  const [contacts, setContacts] = useState(sampleContacts);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { id: workspaceId } = useParams();
  // Get all unique tags
  const allTags = [...new Set(contacts.flatMap((c) => c.tags))];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#00A63E";
      case "blocked":
        return "#DC2626";
      case "unsubscribed":
        return "#73838C";
      default:
        return "#73838C";
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContacts(filteredAndSortedContacts.map((c) => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleDelete = (contactId) => {
    setContacts(contacts.filter((c) => c.id !== contactId));
    setDeleteModal(null);
  };

  const handleBulkDelete = () => {
    if (selectedContacts.length > 0) {
      if (confirm(`Delete ${selectedContacts.length} selected contacts?`)) {
        setContacts(contacts.filter((c) => !selectedContacts.includes(c.id)));
        setSelectedContacts([]);
      }
    }
  };

  const handleExport = () => {
    alert("Export functionality: Download CSV with all contacts");
  };

  const handleBulkUpload = () => {
    alert("Bulk upload functionality: Upload CSV file with contacts");
  };

  const handleMergeDuplicates = () => {
    alert("Merge duplicates functionality: Find and merge duplicate contacts");
  };

  // Filter and sort contacts
  const filteredAndSortedContacts = contacts
    .filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery);
      const matchesTag =
        selectedTag === "all" || contact.tags.includes(selectedTag);
      const matchesStatus =
        selectedStatus === "all" || contact.status === selectedStatus;
      return matchesSearch && matchesTag && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "last-contacted":
          return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
        default:
          return 0;
      }
    });

  const DeleteModal = ({ contact, onClose, onConfirm }) => {
    if (!contact) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      >
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: "#73838C" }}
          >
            <h2 className="text-xl font-semibold text-gray-800">
              Delete Contact
            </h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-800 mb-4">
              Are you sure you want to delete the contact "
              <strong>{contact.name}</strong>"? This action cannot be undone.
            </p>
            <div
              className="p-3 rounded text-sm"
              style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}
            >
              ⚠️ All contact data and message history will be permanently
              removed.
            </div>
          </div>

          <div
            className="flex justify-end gap-3 p-4 border-t"
            style={{ borderColor: "#73838C" }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border transition-colors"
              style={{ borderColor: "#73838C", color: "#73838C" }}
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(contact.id)}
              className="px-4 py-2 rounded text-white hover:opacity-90"
              style={{ backgroundColor: "#DC2626" }}
            >
              Delete Contact
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {showModal && <CreateContact onClose={() => setShowModal(false)} />}
      {!showModal && (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-black">Contacts</h1>
              <p className="text-sm mt-1" style={{ color: "#73838C" }}>
                Manage your WhatsApp contacts
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkUpload}
                className="px-4 py-2 rounded border transition-colors"
                style={{ borderColor: "#00A63E", color: "#00A63E" }}
              >
                📤 Bulk Upload
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#00A63E" }}
              >
                + New Contact
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                  style={{ borderColor: "#73838C" }}
                />
              </div>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-2 border rounded"
                style={{ borderColor: "#73838C", color: "#73838C" }}
              >
                <option value="all">All Tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border rounded"
                style={{ borderColor: "#73838C", color: "#73838C" }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded"
                style={{ borderColor: "#73838C", color: "#73838C" }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
                <option value="last-contacted">Last Contacted</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedContacts.length > 0 && (
              <div
                className="flex items-center gap-4 p-3 rounded"
                style={{
                  backgroundColor: "#F0F9FF",
                  borderLeft: "4px solid #0066CC",
                }}
              >
                <span style={{ color: "#0066CC" }}>
                  {selectedContacts.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 rounded text-white hover:opacity-90"
                  style={{ backgroundColor: "#DC2626" }}
                >
                  Delete Selected
                </button>
                <button
                  onClick={handleExport}
                  className="px-3 py-1 rounded border"
                  style={{ borderColor: "#0066CC", color: "#0066CC" }}
                >
                  Export Selected
                </button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span style={{ color: "#73838C" }}>
                Showing {filteredAndSortedContacts.length} of {contacts.length}{" "}
                contacts
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="px-3 py-1 rounded border transition-colors text-sm"
                  style={{ borderColor: "#73838C", color: "#73838C" }}
                >
                  📥 Export
                </button>
                <button
                  onClick={handleMergeDuplicates}
                  className="px-3 py-1 rounded border transition-colors text-sm"
                  style={{ borderColor: "#73838C", color: "#73838C" }}
                >
                  🔗 Merge Duplicates
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div
                  className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                  style={{
                    borderColor: "#E5E7EB",
                    borderTopColor: "#00A63E",
                  }}
                ></div>
                <p style={{ color: "#73838C" }}>Loading contacts...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "#F9FAFB" }}>
                    <th
                      className="text-left p-4 font-semibold text-gray-800 border-b-2"
                      style={{ borderColor: "#73838C" }}
                    >
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          selectedContacts.length ===
                            filteredAndSortedContacts.length &&
                          filteredAndSortedContacts.length > 0
                        }
                        className="w-4 h-4"
                      />
                    </th>
                    <th
                      className="text-left p-4 font-semibold text-gray-800 border-b-2"
                      style={{ borderColor: "#73838C" }}
                    >
                      Name
                    </th>
                    <th
                      className="text-left p-4 font-semibold text-gray-800 border-b-2"
                      style={{ borderColor: "#73838C" }}
                    >
                      Phone Number
                    </th>
                    <th
                      className="text-left p-4 font-semibold text-gray-800 border-b-2"
                      style={{ borderColor: "#73838C" }}
                    >
                      Tags
                    </th>
                    <th
                      className="text-left p-4 font-semibold text-gray-800 border-b-2"
                      style={{ borderColor: "#73838C" }}
                    >
                      Country
                    </th>
                    <th
                      className="text-left p-4 font-semibold text-gray-800 border-b-2"
                      style={{ borderColor: "#73838C" }}
                    >
                      Last Message
                    </th>
                    <th
                      className="text-left p-4 font-semibold text-gray-800 border-b-2"
                      style={{ borderColor: "#73838C" }}
                    >
                      Status
                    </th>
                    <th
                      className="text-left p-4 font-semibold text-gray-800 border-b-2"
                      style={{ borderColor: "#73838C" }}
                    >
                      Created At
                    </th>
                    <th
                      className="text-left p-4 font-semibold text-gray-800 border-b-2"
                      style={{ borderColor: "#73838C" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedContacts.map((contact, index) => (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{
                        backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
                      }}
                    >
                      <td
                        className="p-4 border-b"
                        style={{ borderColor: "#73838C33" }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => handleSelectContact(contact.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td
                        className="p-4 border-b"
                        style={{ borderColor: "#73838C33" }}
                      >
                        <span className="text-gray-800 font-medium">
                          {contact.name}
                        </span>
                      </td>
                      <td
                        className="p-4 border-b"
                        style={{ borderColor: "#73838C33", color: "#73838C" }}
                      >
                        {contact.phone}
                      </td>
                      <td
                        className="p-4 border-b"
                        style={{ borderColor: "#73838C33" }}
                      >
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor: "#E0F2FE",
                                color: "#0066CC",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td
                        className="p-4 border-b"
                        style={{ borderColor: "#73838C33", color: "#73838C" }}
                      >
                        {contact.country}
                      </td>
                      <td
                        className="p-4 border-b"
                        style={{ borderColor: "#73838C33", color: "#73838C" }}
                      >
                        {contact.lastMessageAt}
                      </td>
                      <td
                        className="p-4 border-b"
                        style={{ borderColor: "#73838C33" }}
                      >
                        <span
                          className="px-3 py-1 rounded text-sm font-medium inline-block capitalize"
                          style={{
                            backgroundColor: getStatusColor(contact.status),
                            color: "white",
                          }}
                        >
                          {contact.status}
                        </span>
                      </td>
                      <td
                        className="p-4 border-b"
                        style={{ borderColor: "#73838C33", color: "#73838C" }}
                      >
                        {contact.createdAt}
                      </td>
                      <td
                        className="p-4 border-b"
                        style={{ borderColor: "#73838C33" }}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/workspace/${workspaceId}/contacts/${contact.id}`)
                            }
                            className="p-2 rounded hover:bg-gray-200 transition-colors"
                            title="View Contact"
                            style={{ color: "#73838C" }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() =>
                              alert(`Edit contact: ${contact.name}`)
                            }
                            className="p-2 rounded hover:bg-gray-200 transition-colors"
                            title="Edit Contact"
                            style={{ color: "#73838C" }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => setDeleteModal(contact)}
                            className="p-2 rounded hover:bg-red-100 transition-colors"
                            title="Delete Contact"
                            style={{ color: "#DC2626" }}
                          >
                            <svg
                              className="w-4 h-4"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAndSortedContacts.length === 0 && (
                <div className="text-center py-12">
                  <p style={{ color: "#73838C" }}>
                    No contacts found matching your filters.
                  </p>
                </div>
              )}
            </div>
          )}

          <DeleteModal
            contact={deleteModal}
            onClose={() => setDeleteModal(null)}
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  );
};

export default ContactsList;
