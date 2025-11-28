import { useState } from "react";
import { sampleCampaigns } from "../../../utils/constants";

const CampaignsList = () => {
  const [campaigns, setCampaigns] = useState(sampleCampaigns);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#00A63E";
      case "completed":
        return "#0066CC";
      case "paused":
        return "#FFA500";
      case "scheduled":
        return "#9333EA";
      case "draft":
        return "#73838C";
      default:
        return "#73838C";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "broadcast":
        return "#0066CC";
      case "drip":
        return "#00A63E";
      case "scheduled":
        return "#9333EA";
      default:
        return "#73838C";
    }
  };

  const handlePauseResume = (campaign) => {
    setCampaigns(
      campaigns.map((c) =>
        c.id === campaign.id
          ? {
              ...c,
              status: c.status === "Paused" ? "Active" : "Paused",
            }
          : c
      )
    );
  };

  const handleDuplicate = (campaign) => {
    const newCampaign = {
      ...campaign,
      id: `camp_${Date.now()}`,
      name: `${campaign.name} (Copy)`,
      status: "Draft",
      delivered: 0,
      seen: 0,
      failed: 0,
      createdAt: new Date()("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setCampaigns([newCampaign, ...campaigns]);
  };

  const handleDelete = (campaignId) => {
    setCampaigns(campaigns.filter((c) => c.id !== campaignId));
    setDeleteModal(null);
  };

  const handleView = (campaignId) => {
    alert(`Viewing campaign: ${campaignId}\nIn your app, navigate to: /dashboard/workspace/{id}/campaigns/${campaignId}`);
  };

  const DeleteModal = ({ campaign, onClose, onConfirm }) => {
    if (!campaign) return null;

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
              Delete Campaign
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
              Are you sure you want to delete the campaign "
              <strong>{campaign.name}</strong>"? This action cannot be undone.
            </p>
            <div
              className="p-3 rounded text-sm"
              style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}
            >
              ⚠️ All campaign data and analytics will be permanently removed.
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
              onClick={() => onConfirm(campaign.id)}
              className="px-4 py-2 rounded text-white hover:opacity-90"
              style={{ backgroundColor: "#DC2626" }}
            >
              Delete Campaign
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-black">Campaigns</h1>
          <p className="text-sm mt-1" style={{ color: "#73838C" }}>
            Manage your WhatsApp marketing campaigns
          </p>
        </div>
        <button
          onClick={() => alert("Create new campaign clicked")}
          className="px-4 py-2 rounded text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#00A63E" }}
        >
          + New Campaign
        </button>
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
            <p style={{ color: "#73838C" }}>Loading campaigns...</p>
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
                  Campaign Name
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-800 border-b-2"
                  style={{ borderColor: "#73838C" }}
                >
                  Type
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-800 border-b-2"
                  style={{ borderColor: "#73838C" }}
                >
                  Audience
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-800 border-b-2"
                  style={{ borderColor: "#73838C" }}
                >
                  Template
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-800 border-b-2"
                  style={{ borderColor: "#73838C" }}
                >
                  Recipients
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
                  Performance
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
              {campaigns.map((campaign, index) => (
                <tr
                  key={campaign.id}
                  className="hover:bg-gray-50 transition-colors"
                  style={{
                    backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
                  }}
                >
                  <td
                    className="p-4 border-b"
                    style={{ borderColor: "#73838C33" }}
                  >
                    <span className="text-gray-800 font-medium">
                      {campaign.name}
                    </span>
                  </td>
                  <td
                    className="p-4 border-b"
                    style={{ borderColor: "#73838C33" }}
                  >
                    <span
                      className="px-3 py-1 rounded text-xs font-medium inline-block"
                      style={{
                        backgroundColor: getTypeColor(campaign.type) + "20",
                        color: getTypeColor(campaign.type),
                      }}
                    >
                      {campaign.type}
                    </span>
                  </td>
                  <td
                    className="p-4 border-b"
                    style={{ borderColor: "#73838C33", color: "#73838C" }}
                  >
                    {campaign.audience}
                  </td>
                  <td
                    className="p-4 border-b"
                    style={{ borderColor: "#73838C33", color: "#73838C" }}
                  >
                    {campaign.template}
                  </td>
                  <td
                    className="p-4 border-b"
                    style={{ borderColor: "#73838C33" }}
                  >
                    <span className="text-gray-800 font-medium">
                      {campaign.totalRecipients}
                    </span>
                  </td>
                  <td
                    className="p-4 border-b"
                    style={{ borderColor: "#73838C33" }}
                  >
                    <span
                      className="px-3 py-1 rounded text-sm font-medium inline-block"
                      style={{
                        backgroundColor: getStatusColor(campaign.status),
                        color: "white",
                      }}
                    >
                      {campaign.status}
                    </span>
                  </td>
                  <td
                    className="p-4 border-b"
                    style={{ borderColor: "#73838C33" }}
                  >
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span style={{ color: "#00A63E" }}>✓</span>
                        <span style={{ color: "#73838C" }}>
                          Delivered: {campaign.delivered}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ color: "#0066CC" }}>👁</span>
                        <span style={{ color: "#73838C" }}>
                          Seen: {campaign.seen}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ color: "#DC2626" }}>✗</span>
                        <span style={{ color: "#73838C" }}>
                          Failed: {campaign.failed}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td
                    className="p-4 border-b"
                    style={{ borderColor: "#73838C33", color: "#73838C" }}
                  >
                    {campaign.createdAt}
                  </td>
                  <td
                    className="p-4 border-b"
                    style={{ borderColor: "#73838C33" }}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(campaign.id)}
                        className="p-2 rounded hover:bg-gray-200 transition-colors"
                        title="View Campaign"
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
                        onClick={() => handleDuplicate(campaign)}
                        className="p-2 rounded hover:bg-gray-200 transition-colors"
                        title="Duplicate Campaign"
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>

                      {(campaign.status === "Active" ||
                        campaign.status === "Paused") && (
                        <button
                          onClick={() => handlePauseResume(campaign)}
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title={
                            campaign.status === "Paused"
                              ? "Resume Campaign"
                              : "Pause Campaign"
                          }
                          style={{ color: "#73838C" }}
                        >
                          {campaign.status === "Paused" ? (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteModal(campaign)}
                        className="p-2 rounded hover:bg-red-100 transition-colors"
                        title="Delete Campaign"
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
        </div>
      )}

      <DeleteModal
        campaign={deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CampaignsList;