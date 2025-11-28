import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ContactProfile = () => {
  // Sample contact data
  const [contact, setContact] = useState({
    id: "contact_1",
    fullName: "Ahmed Ali",
    phone: "+92 300 1234567",
    country: "Pakistan",
    email: "ahmed.ali@example.com",
    tags: ["VIP", "Active", "Customer"],
    customFields: [
      { id: 1, key: "Company", value: "Tech Solutions Ltd" },
      { id: 2, key: "Position", value: "CEO" },
      { id: 3, key: "Birthday", value: "15th March" },
    ],
    status: "active",
    source: "Manual",
    createdAt: "10/15/2024, 09:20 AM",
    lastUpdated: "11/28/2025, 02:30 PM",
    notes: "Important client - handle with priority. Prefers communication after 2 PM.",
  });
  const { contactId } = useParams();
  const navigate = useNavigate();
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

  const handleAddTag = (tag) => {
    if (!contact.tags.includes(tag)) {
      setContact({ ...contact, tags: [...contact.tags, tag] });
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setContact({
      ...contact,
      tags: contact.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAddCustomTag = () => {
    if (newTag.trim() && !contact.tags.includes(newTag.trim())) {
      setContact({ ...contact, tags: [...contact.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const handleAction = (action) => {
    setShowActionMenu(false);
    alert(`Action: ${action}\nContact: ${contact.fullName}`);
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}>
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "#E5E7EB" }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: "#0066CC" }}>
              {contact.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{contact.fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm" style={{ color: "#73838C" }}>{contact.phone}</span>
                <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: getStatusColor(contact.status), color: "white" }}>
                  {contact.status}
                </span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="flex">
          {/* Left Sidebar - Contact Info */}
          <div className="w-1/3 border-r p-6 space-y-6" style={{ borderColor: "#E5E7EB", maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Phone Number</label>
                  <p className="text-gray-800">{contact.phone}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Email</label>
                  <p className="text-gray-800">{contact.email || "Not provided"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Country</label>
                  <p className="text-gray-800">{contact.country}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Source</label>
                  <p className="text-gray-800">{contact.source}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Created At</label>
                  <p className="text-gray-800">{contact.createdAt}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>Last Updated</label>
                  <p className="text-gray-800">{contact.lastUpdated}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>
              
              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {contact.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded text-sm font-medium flex items-center gap-2" style={{ backgroundColor: "#E0F2FE", color: "#0066CC" }}>
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:opacity-70">×</button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mb-2">
                <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAddCustomTag()} placeholder="Add tag..." className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2" style={{ borderColor: "#D1D5DB" }} />
                <button onClick={handleAddCustomTag} className="px-3 py-2 rounded text-white text-sm hover:opacity-90" style={{ backgroundColor: "#00A63E" }}>
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {availableTags.filter((tag) => !contact.tags.includes(tag)).map((tag) => (
                  <button key={tag} onClick={() => handleAddTag(tag)} className="px-2 py-1 rounded text-xs border transition-colors hover:bg-gray-50" style={{ borderColor: "#D1D5DB", color: "#73838C" }}>
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Fields */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Fields</h3>
              {contact.customFields.length > 0 ? (
                <div className="space-y-3">
                  {contact.customFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium mb-1" style={{ color: "#73838C" }}>{field.key}</label>
                      <p className="text-gray-800">{field.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "#73838C" }}>No custom fields added</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
              <p className="text-sm text-gray-800 p-3 rounded" style={{ backgroundColor: "#F9FAFB" }}>
                {contact.notes || "No notes added"}
              </p>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => handleAction("send_message")} className="px-4 py-2 rounded text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: "#00A63E" }}>
                📧 Send Message
              </button>
              <button onClick={() => handleAction("add_to_segment")} className="px-4 py-2 rounded border transition-colors hover:bg-gray-50" style={{ borderColor: "#0066CC", color: "#0066CC" }}>
                👥 Add to Segment
              </button>
              <button onClick={() => handleAction("add_to_campaign")} className="px-4 py-2 rounded border transition-colors hover:bg-gray-50" style={{ borderColor: "#9333EA", color: "#9333EA" }}>
                📢 Add to Campaign
              </button>
              
              <div className="relative ml-auto">
                <button onClick={() => setShowActionMenu(!showActionMenu)} className="px-4 py-2 rounded border transition-colors hover:bg-gray-50" style={{ borderColor: "#73838C", color: "#73838C" }}>
                  ⋯ More Actions
                </button>
                
                {showActionMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-10" style={{ borderColor: "#E5E7EB" }}>
                    <button onClick={() => handleAction("export")} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800 text-sm">
                      📥 Export Contact
                    </button>
                    <button onClick={() => handleAction("block")} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" style={{ color: "#FFA500" }}>
                      🚫 Block Contact
                    </button>
                    <button onClick={() => handleAction("unsubscribe")} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm" style={{ color: "#73838C" }}>
                      ✋ Unsubscribe
                    </button>
                    <button onClick={() => handleAction("delete")} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm rounded-b-lg" style={{ color: "#DC2626" }}>
                      🗑️ Delete Contact
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b mb-6" style={{ borderColor: "#E5E7EB" }}>
              <div className="flex gap-6">
                <button onClick={() => setActiveTab("timeline")} className="pb-3 px-1 font-medium transition-colors" style={{ color: activeTab === "timeline" ? "#0066CC" : "#73838C", borderBottom: activeTab === "timeline" ? "2px solid #0066CC" : "2px solid transparent" }}>
                  Timeline Activity
                </button>
                <button onClick={() => setActiveTab("messages")} className="pb-3 px-1 font-medium transition-colors" style={{ color: activeTab === "messages" ? "#0066CC" : "#73838C", borderBottom: activeTab === "messages" ? "2px solid #0066CC" : "2px solid transparent" }}>
                  Messages
                </button>
                <button onClick={() => setActiveTab("campaigns")} className="pb-3 px-1 font-medium transition-colors" style={{ color: activeTab === "campaigns" ? "#0066CC" : "#73838C", borderBottom: activeTab === "campaigns" ? "2px solid #0066CC" : "2px solid transparent" }}>
                  Campaigns
                </button>
              </div>
            </div>

            {/* Timeline Activity */}
            {activeTab === "timeline" && (
              <div className="space-y-4" style={{ maxHeight: "500px", overflowY: "auto" }}>
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: event.color + "20" }}>
                        {event.icon}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 flex-1 mt-2" style={{ backgroundColor: "#E5E7EB", minHeight: "30px" }}></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-gray-800">{event.title}</h4>
                        <span className="text-xs" style={{ color: "#73838C" }}>{event.timestamp}</span>
                      </div>
                      <p className="text-sm" style={{ color: "#73838C" }}>{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div className="text-center py-12">
                <p style={{ color: "#73838C" }}>Message history will be displayed here</p>
              </div>
            )}

            {/* Campaigns Tab */}
            {activeTab === "campaigns" && (
              <div className="text-center py-12">
                <p style={{ color: "#73838C" }}>Campaign participation will be displayed here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactProfile;