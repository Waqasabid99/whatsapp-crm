import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../../../utils/constants";
import { toast } from "react-toastify";

const ContactProfile = () => {
  const { contactId } = useParams();
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [timeline] = useState([
    {
      id: 1,
      type: "message_sent",
      title: "Message Sent",
      description: "Promotional campaign message delivered",
      timestamp: "11/28/2025, 02:30 PM",
      icon: "✉️",
      color: "#0066CC",
    },
    {
      id: 2,
      type: "message_read",
      title: "Message Read",
      description: "Contact opened the message",
      timestamp: "11/28/2025, 02:32 PM",
      icon: "👁",
      color: "#00A63E",
    },
    {
      id: 3,
      type: "campaign_added",
      title: "Added to Campaign",
      description: "Added to 'Black Friday Sale' campaign",
      timestamp: "11/27/2025, 11:45 AM",
      icon: "📢",
      color: "#9333EA",
    },
    {
      id: 4,
      type: "tag_added",
      title: "Tag Added",
      description: "Tag 'VIP' added by Admin",
      timestamp: "11/25/2025, 03:20 PM",
      icon: "🏷️",
      color: "#FFA500",
    },
    {
      id: 5,
      type: "agent_assigned",
      title: "Agent Assigned",
      description: "Assigned to Sarah Khan",
      timestamp: "11/20/2025, 10:15 AM",
      icon: "👤",
      color: "#0066CC",
    },
    {
      id: 6,
      type: "message_delivered",
      title: "Message Delivered",
      description: "Welcome message delivered successfully",
      timestamp: "10/15/2024, 09:25 AM",
      icon: "✓",
      color: "#00A63E",
    },
    {
      id: 7,
      type: "contact_created",
      title: "Contact Created",
      description: "Contact added manually by Admin",
      timestamp: "10/15/2024, 09:20 AM",
      icon: "➕",
      color: "#73838C",
    },
  ]);

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

  const fetchContact = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/contact/get-contact/${contactId}`, {
        withCredentials: true
      });
      if (data.success) {
        setContact(data.contact);
      } else {
        toast.error("Failed to fetch contact");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  const contactTags = contact?.metadata?.tags || [];

  const handleAddTag = (tag) => {
    if (!contactTags.includes(tag)) {
      setContact({ ...contact, metadata: { ...contact.metadata, tags: [...contactTags, tag] } });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setContact({
      ...contact,
      metadata: { ...contact.metadata, tags: contactTags.filter((tag) => tag !== tagToRemove) }
    });
  };

  const handleAddCustomTag = () => {
    if (newTag.trim() && !contactTags.includes(newTag.trim())) {
      setContact({ ...contact, metadata: { ...contact.metadata, tags: [...contactTags, newTag.trim()] } });
      setNewTag("");
    }
  };

  const handleAction = (action) => {
    setShowActionMenu(false);
    alert(`Action: ${action}\nContact: ${contact?.name || contact?.phoneNumber}`);
  };

  const getStatusColor = (isOptOut) => {
    return isOptOut ? "#DC2626" : "#00A63E";
  };

  const getStatusText = (isOptOut) => {
    return isOptOut ? "opted-out" : "active";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8 p-12 text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: "#E5E7EB", borderTopColor: "#00A63E" }}></div>
          <p className="text-gray-500">Loading contact profile...</p>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8 p-12 text-center">
          <p className="text-gray-500 mb-4">Contact not found or access denied.</p>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: "#0066CC" }}>
              {(contact.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{contact.name || contact.phoneNumber}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm" style={{ color: "#73838C" }}>{contact.phoneNumber}</span>
                <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: getStatusColor(contact.isOptOut), color: "white" }}>
                  {getStatusText(contact.isOptOut)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => handleAction("send_message")} className="px-4 py-2 rounded text-white hover:opacity-90 transition-opacity flex items-center gap-2 text-sm font-medium" style={{ backgroundColor: "#00A63E" }}>
              <span>✉️</span> Send Message
            </button>
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800 text-2xl leading-none pb-1">
              ×
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Contact Info */}
          <div className="w-full p-6 space-y-6" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Phone Number</label>
                  <p className="text-gray-800">{contact.phoneNumber}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Email</label>
                  <p className="text-gray-800">{contact.email || "Not provided"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Country</label>
                  <p className="text-gray-800">{contact.metadata?.country || "Not provided"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Source</label>
                  <p className="text-gray-800">{contact.metadata?.source || "Unknown"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Created At</label>
                  <p className="text-gray-800">{formatDate(contact.createdAt)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Last Updated</label>
                  <p className="text-gray-800">{formatDate(contact.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>

              {contactTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {contactTags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded text-sm font-medium flex items-center gap-2" style={{ backgroundColor: "#E0F2FE", color: "#0066CC" }}>
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:opacity-70">×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* <div className="flex gap-2 mb-2">
                <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAddCustomTag()} placeholder="Add tag..." className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2" style={{ borderColor: "#D1D5DB" }} />
                <button onClick={handleAddCustomTag} className="px-3 py-2 rounded text-white text-sm hover:opacity-90" style={{ backgroundColor: "#00A63E" }}>
                  Add
                </button>
              </div> */}

              {/* <div className="flex flex-wrap gap-2">
                {availableTags.filter((tag) => !contactTags.includes(tag)).map((tag) => (
                  <button key={tag} onClick={() => handleAddTag(tag)} className="px-2 py-1 rounded text-xs border transition-colors hover:bg-gray-50" style={{ borderColor: "#D1D5DB", color: "#73838C" }}>
                    + {tag}
                  </button>
                ))}
              </div> */}
            </div>

            {/* Custom Fields */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Fields</h3>
              {(contact.metadata?.customFields && (contact.metadata.customFields.length || Object.keys(contact.metadata.customFields).length > 0)) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.isArray(contact.metadata.customFields)
                    ? contact.metadata.customFields.map((field, idx) => (
                      <div key={field.id || idx}>
                        <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>{field.key}</label>
                        <p className="text-gray-800">{field.value}</p>
                      </div>
                    ))
                    : Object.entries(contact.metadata.customFields).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>{key}</label>
                        <p className="text-gray-800">{value}</p>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <p className="text-sm" style={{ color: "#73838C" }}>No custom fields added</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
              <p className="text-sm text-gray-800 p-3 rounded" style={{ backgroundColor: "#F9FAFB" }}>
                {contact.metadata?.notes || "No notes added"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactProfile;