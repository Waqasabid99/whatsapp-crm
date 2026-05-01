import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateContact from "./CreateContact";
import axios from "axios";
import { backendUrl } from "../../../utils/constants";
import { toast, ToastContainer } from "react-toastify";
import Fuse from "fuse.js";
import DeleteModal from "./DeleteContact";

const tableHeader = [
  { name: "Name", key: "name" },
  { name: "Phone", key: "phoneNumber" },
  { name: "Tags", key: "tags" },
  { name: "Last Seen", key: "lastSeenAt" },
  { name: "Status", key: "isOptOut" },
  { name: "Actions", key: "actions" },
];

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { id: workspaceId } = useParams();

  // Configure Fuse.js for fuzzy search
  const fuse = new Fuse(contacts, {
    keys: ["name", "phoneNumber"],
    threshold: 0.3,
    ignoreLocation: true,
  });

  // Get all unique tags from metadata
  const allTags = [
    ...new Set(
      contacts.flatMap((c) => c.metadata?.tags || [])
    ),
  ];

  const getStatusColor = (isOptOut) => {
    return isOptOut ? "#DC2626" : "#00A63E";
  };

  const getStatusText = (isOptOut) => {
    return isOptOut ? "Opted Out" : "Active";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContacts(filteredAndSortedContacts.map((c) => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  console.log(selectedContacts)
  const handleSelectContact = (contactId) => {
    if (selectedContacts.includes(contactId)) {
      setSelectedContacts(selectedContacts.filter((id) => id !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contactId]);
    }
  };

  const handleDelete = async (contactId) => {
    setIsLoading(true);
    try {
      const { data } = await axios.delete(`${backendUrl}/contact/delete-contact/${contactId}`, { withCredentials: true });
      if (data.success) {
        setIsLoading(false);
        toast.success(data.message);
        setDeleteModal(null);
        getContacts();
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/contact/bulk-delete`, { ids: selectedContacts }, {withCredentials: true });
      if (data.success) {
        setIsLoading(false);
        toast.success(data.message);
        setSelectedContacts([]);
        getContacts();
      }
      
    } catch (error) {
      setIsLoading(false);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleExport = () => {
    const dataToExport = selectedContacts.length > 0
      ? contacts.filter((c) => selectedContacts.includes(c.id))
      : filteredAndSortedContacts;
    
    const csv = [
      ["Name", "Phone", "Tags", "Status", "Last Seen", "Created At"].join(","),
      ...dataToExport.map((c) =>
        [
          c.name || "N/A",
          c.phoneNumber,
          (c.metadata?.tags || []).join(";"),
          getStatusText(c.isOptOut),
          formatDateTime(c.lastSeenAt),
          formatDate(c.createdAt),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Contacts exported successfully");
  };

  // Filter and sort contacts
  let filteredAndSortedContacts = contacts;

  // Apply search using Fuse.js
  if (searchQuery.trim()) {
    const results = fuse.search(searchQuery);
    filteredAndSortedContacts = results.map((result) => result.item);
  }

  // Apply tag filter
  filteredAndSortedContacts = filteredAndSortedContacts.filter((contact) => {
    const matchesTag =
      selectedTag === "all" ||
      (contact.metadata?.tags || []).includes(selectedTag);
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && !contact.isOptOut) ||
      (selectedStatus === "opted-out" && contact.isOptOut);
    return matchesTag && matchesStatus;
  });

  // Apply sorting
  filteredAndSortedContacts = [...filteredAndSortedContacts].sort((a, b) => {
    switch (sortBy) {
      case "a-z":
        return (a.name || "").localeCompare(b.name || "");
      case "z-a":
        return (b.name || "").localeCompare(a.name || "");
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "last-seen":
        const aDate = a.lastSeenAt ? new Date(a.lastSeenAt) : new Date(0);
        const bDate = b.lastSeenAt ? new Date(b.lastSeenAt) : new Date(0);
        return bDate - aDate;
      default:
        return 0;
    }
  });

  const getContacts = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/contact/get-contacts`, {
        withCredentials: true,
      });
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getContacts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      {showModal && (
        <CreateContact
          onClose={() => {
            setShowModal(false);
            getContacts();
          }}
        />
      )}
      {!showModal && (
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Contacts
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your WhatsApp contacts
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: "#00A63E" }}
              >
                + New Contact
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="opted-out">Opted Out</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="a-z">A-Z</option>
                  <option value="z-a">Z-A</option>
                  <option value="last-seen">Last Seen</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedContacts.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-blue-700 font-medium">
                  {selectedContacts.length} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1.5 rounded-lg text-white text-sm hover:opacity-90"
                    style={{ backgroundColor: "#DC2626" }}
                  >
                    {loading ? (
                      <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                  <button
                    onClick={handleExport}
                    className="px-3 py-1.5 rounded-lg border border-blue-500 text-blue-600 text-sm hover:bg-blue-50"
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="text-sm text-gray-600">
              Showing {filteredAndSortedContacts.length} of {contacts.length}{" "}
              contacts
            </span>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
            >
              📥 Export All
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center">
                <div
                  className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                  style={{
                    borderColor: "#E5E7EB",
                    borderTopColor: "#00A63E",
                  }}
                ></div>
                <p className="text-gray-500">Loading contacts...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-3 md:p-4">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            selectedContacts.length ===
                              filteredAndSortedContacts.length &&
                            filteredAndSortedContacts.length > 0
                          }
                          className="w-4 h-4 rounded"
                        />
                      </th>
                      {tableHeader.map((header, index) => (
                        <th
                          key={index}
                          className="text-left p-3 md:p-4 font-semibold text-sm text-gray-700 whitespace-nowrap"
                        >
                          {header.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAndSortedContacts.map((contact) => (
                      <tr
                        key={contact.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 md:p-4">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleSelectContact(contact.id)}
                            className="w-4 h-4 rounded"
                          />
                        </td>
                        <td className="p-3 md:p-4">
                          <span className="text-gray-900 font-medium">
                            {contact.name || "—"}
                          </span>
                        </td>
                        <td className="p-3 md:p-4 text-gray-600">
                          {contact.phoneNumber}
                        </td>
                        <td className="p-3 md:p-4">
                          <div className="flex flex-wrap gap-1">
                            {(contact.metadata?.tags || []).length > 0 ? (
                              contact.metadata.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 md:p-4 text-gray-600 text-sm whitespace-nowrap">
                          {formatDateTime(contact.lastSeenAt)}
                        </td>
                        <td className="p-3 md:p-4">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                            style={{
                              backgroundColor: getStatusColor(contact.isOptOut),
                            }}
                          >
                            {getStatusText(contact.isOptOut)}
                          </span>
                        </td>
                        <td className="p-3 md:p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                navigate(
                                  `/dashboard/workspace/${workspaceId}/contacts/${contact.id}`
                                )
                              }
                              className="p-2 rounded hover:bg-gray-100 transition-colors"
                              title="View Contact"
                            >
                              <svg
                                className="w-4 h-4 text-gray-600"
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
                              onClick={() => setDeleteModal(contact)}
                              className="p-2 rounded hover:bg-red-50 transition-colors"
                              title="Delete Contact"
                            >
                              <svg
                                className="w-4 h-4 text-red-600"
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
                    <p className="text-gray-500">
                      No contacts found matching your filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DeleteModal
            contact={deleteModal}
            onClose={() => setDeleteModal(null)}
            onConfirm={handleDelete}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default ContactsList;