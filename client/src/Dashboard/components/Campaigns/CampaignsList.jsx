import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { backendUrl } from "../../../utils/constants";
import {
  Search,
  Plus,
  Eye,
  Copy,
  Play,
  Pause,
  XCircle,
  Trash2,
  RefreshCw,
  BarChart2,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  DRAFT: { label: "Draft", bg: "#F3F4F6", text: "#374151", dot: "#6B7280" },
  SCHEDULED: { label: "Scheduled", bg: "#EDE9FE", text: "#7C3AED", dot: "#7C3AED" },
  RUNNING: { label: "Running", bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  PAUSED: { label: "Paused", bg: "#FEF3C7", text: "#92400E", dot: "#F59E0B" },
  COMPLETED: { label: "Completed", bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  CANCELLED: { label: "Cancelled", bg: "#FEE2E2", text: "#991B1B", dot: "#EF4444" },
};

const STATUS_FILTERS = ["ALL", "DRAFT", "SCHEDULED", "RUNNING", "PAUSED", "COMPLETED", "CANCELLED"];

const fmt = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "—";

const pct = (num, total) =>
  total > 0 ? `${((num / total) * 100).toFixed(1)}%` : "0%";

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div
    className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4"
    style={{ borderColor: "#E5E7EB" }}
  >
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: color + "1A" }}
    >
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm" style={{ color: "#73838C" }}>{label}</p>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
};

// ─── Delete modal ─────────────────────────────────────────────────────────────
const DeleteModal = ({ campaign, onClose, onConfirm, loading }) => {
  if (!campaign) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E5E7EB" }}>
          <h2 className="text-lg font-semibold text-gray-800">Delete Campaign</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">
          <p className="text-gray-700 mb-3">
            Are you sure you want to delete <strong>{campaign.name}</strong>? This action cannot be undone.
          </p>
          <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
            ⚠️ All campaign data and analytics will be permanently removed.
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "#E5E7EB" }}>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
            style={{ borderColor: "#D1D5DB", color: "#374151" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(campaign.id)}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#DC2626" }}
          >
            {loading ? "Deleting…" : "Delete Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Analytics drawer ─────────────────────────────────────────────────────────
const AnalyticsDrawer = ({ campaign, onClose }) => {
  if (!campaign) return null;
  const total = campaign.totalRecipients || 1;
  const metrics = [
    { label: "Sent", value: campaign.sentCount, color: "#3B82F6" },
    { label: "Delivered", value: campaign.deliveredCount, color: "#10B981" },
    { label: "Read", value: campaign.readCount, color: "#8B5CF6" },
    { label: "Failed", value: campaign.failedCount, color: "#EF4444" },
    { label: "Opted-out", value: campaign.optedOutCount, color: "#F59E0B" },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#E5E7EB" }}>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{campaign.name}</h2>
            <p className="text-sm" style={{ color: "#73838C" }}>Campaign Analytics</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Total Recipients</span>
            <span className="text-2xl font-bold text-gray-900">{campaign.totalRecipients.toLocaleString()}</span>
          </div>
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-sm mb-1">
                <span style={{ color: "#73838C" }}>{m.label}</span>
                <span className="font-semibold text-gray-800">
                  {m.value.toLocaleString()} ({pct(m.value, total)})
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ backgroundColor: "#F3F4F6" }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: pct(m.value, total),
                    backgroundColor: m.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {campaign.startedAt && (
          <div className="px-6 pb-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p style={{ color: "#73838C" }}>Started</p>
              <p className="font-medium text-gray-800">{fmt(campaign.startedAt)}</p>
            </div>
            {campaign.completedAt && (
              <div>
                <p style={{ color: "#73838C" }}>Completed</p>
                <p className="font-medium text-gray-800">{fmt(campaign.completedAt)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const CampaignsList = ({ onCreateNew }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // campaignId being acted on
  const [deleteModal, setDeleteModal] = useState(null);
  const [analyticsModal, setAnalyticsModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // ── Fetch campaigns ──────────────────────────────────────────────────────────
  const fetchCampaigns = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (statusFilter !== "ALL") params.status = statusFilter;

      const { data } = await axios.get(`${backendUrl}/campaign`, {
        params,
        withCredentials: true,
      });

      if (data.success) {
        setCampaigns(data.campaigns);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch overview stats ────────────────────────────────────────────────────
  const fetchOverview = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/campaign/analytics/overview`, {
        withCredentials: true,
      });
      if (data.success) setOverview(data.overview);
    } catch (err) {
      console.error("Overview fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchCampaigns(1);
    fetchOverview();
  }, [statusFilter]);

  // ── Filtered by search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return campaigns;
    const q = searchQuery.toLowerCase();
    return campaigns.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.template?.name?.toLowerCase().includes(q) ||
        c.audienceGroup?.name?.toLowerCase().includes(q)
    );
  }, [campaigns, searchQuery]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleLaunch = async (campaign) => {
    try {
      setActionLoading(campaign.id);
      const { data } = await axios.post(
        `${backendUrl}/campaign/${campaign.id}/launch`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Campaign launched successfully");
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? { ...c, status: "RUNNING", startedAt: new Date() } : c))
        );
        fetchOverview();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to launch campaign");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (campaign) => {
    try {
      setActionLoading(campaign.id);
      const { data } = await axios.post(
        `${backendUrl}/campaign/${campaign.id}/pause`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Campaign paused");
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? { ...c, status: "PAUSED" } : c))
        );
        fetchOverview();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to pause campaign");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (campaign) => {
    if (!window.confirm(`Cancel campaign "${campaign.name}"?`)) return;
    try {
      setActionLoading(campaign.id);
      const { data } = await axios.post(
        `${backendUrl}/campaign/${campaign.id}/cancel`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Campaign cancelled");
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? { ...c, status: "CANCELLED" } : c))
        );
        fetchOverview();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to cancel campaign");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (campaign) => {
    try {
      setActionLoading(campaign.id);
      const { data } = await axios.post(
        `${backendUrl}/campaign/${campaign.id}/duplicate`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Campaign duplicated");
        fetchCampaigns(pagination.page);
        fetchOverview();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to duplicate campaign");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (campaignId) => {
    try {
      setActionLoading(campaignId);
      const { data } = await axios.delete(`${backendUrl}/campaign/${campaignId}`, {
        withCredentials: true,
      });
      if (data.success) {
        toast.success("Campaign deleted");
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
        setDeleteModal(null);
        fetchOverview();
      } else {
        toast.error(data.message ?? "Failed to delete campaign");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to delete campaign");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm mt-0.5" style={{ color: "#73838C" }}>
            Manage your WhatsApp marketing campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchCampaigns(1); fetchOverview(); }}
            className="p-2 rounded-lg border hover:bg-gray-100 transition-colors"
            style={{ borderColor: "#D1D5DB", color: "#73838C" }}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#00A63E" }}
          >
            <Plus size={16} /> New Campaign
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={BarChart2} label="Total Campaigns" value={overview.totalCampaigns} color="#3B82F6" />
          <StatCard icon={Users} label="Total Recipients" value={(overview.totalRecipients ?? 0).toLocaleString()} color="#8B5CF6" />
          <StatCard icon={CheckCircle} label="Delivered" value={(overview.totalDelivered ?? 0).toLocaleString()} color="#10B981" />
          <StatCard icon={AlertCircle} label="Failed" value={(overview.totalFailed ?? 0).toLocaleString()} color="#EF4444" />
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-5" style={{ borderColor: "#E5E7EB" }}>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Status tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => {
              const active = statusFilter === s;
              const cfg = s === "ALL" ? null : STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: active ? (cfg?.dot ?? "#374151") : "#F3F4F6",
                    color: active ? "white" : "#374151",
                  }}
                >
                  {s === "ALL" ? "All" : STATUS_CONFIG[s]?.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ borderColor: "#D1D5DB" }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div
              className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: "#E5E7EB", borderTopColor: "#00A63E" }}
            />
            <p style={{ color: "#73838C" }}>Loading campaigns…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border py-16 text-center" style={{ borderColor: "#E5E7EB" }}>
          <BarChart2 size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No campaigns found</p>
          <p className="text-sm mt-1" style={{ color: "#73838C" }}>
            {statusFilter !== "ALL" ? "Try a different status filter" : "Click \"New Campaign\" to get started"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: "#F9FAFB" }}>
                  {["Campaign", "Template", "Audience", "Recipients", "Performance", "Status", "Scheduled / Created", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b"
                      style={{ color: "#73838C", borderColor: "#E5E7EB" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((campaign, idx) => {
                  const isBusy = actionLoading === campaign.id;
                  const total = campaign.totalRecipients || 0;

                  return (
                    <tr
                      key={campaign?.id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{ backgroundColor: idx % 2 === 0 ? "white" : "#FAFAFA" }}
                    >
                      {/* Campaign Name */}
                      <td className="px-4 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
                        <div className="font-semibold text-gray-800 text-sm">{campaign?.name}</div>
                        {campaign?.description && (
                          <div className="text-xs mt-0.5 truncate max-w-[180px]" style={{ color: "#73838C" }}>
                            {campaign?.description}
                          </div>
                        )}
                      </td>

                      {/* Template */}
                      <td className="px-4 py-4 border-b text-sm" style={{ borderColor: "#F3F4F6", color: "#73838C" }}>
                        {campaign?.template?.name ?? <span className="italic text-gray-300">—</span>}
                      </td>

                      {/* Audience */}
                      <td className="px-4 py-4 border-b text-sm" style={{ borderColor: "#F3F4F6" }}>
                        {campaign?.audienceGroup ? (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: (campaign?.audienceGroup?.color ?? "#6B7280") + "20",
                              color: campaign?.audienceGroup?.color ?? "#6B7280",
                            }}
                          >
                            <Users size={11} />
                            {campaign?.audienceGroup?.name}
                          </span>
                        ) : (
                          <span style={{ color: "#73838C" }}>
                            {campaign?._count?.contacts > 0
                              ? `${campaign?._count.contacts} contacts`
                              : <span className="italic text-gray-300">—</span>}
                          </span>
                        )}
                      </td>

                      {/* Recipients */}
                      <td className="px-4 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
                        <span className="font-semibold text-gray-900 text-sm">{total?.toLocaleString()}</span>
                      </td>

                      {/* Performance mini-funnel */}
                      <td className="px-4 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
                        <div className="space-y-1 text-xs" style={{ color: "#73838C" }}>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle size={12} className="text-green-500 shrink-0" />
                            Delivered: <span className="font-medium text-gray-700">{campaign?.deliveredCount}</span>
                            <span className="text-gray-400">({pct(campaign?.deliveredCount, total)})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Eye size={12} className="text-blue-500 shrink-0" />
                            Read: <span className="font-medium text-gray-700">{campaign?.readCount}</span>
                            <span className="text-gray-400">({pct(campaign?.readCount, total)})</span>
                          </div>
                          {campaign?.failedCount > 0 && (
                            <div className="flex items-center gap-1.5">
                              <AlertCircle size={12} className="text-red-400 shrink-0" />
                              Failed: <span className="font-medium text-red-500">{campaign?.failedCount}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
                        <StatusBadge status={campaign.status} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 border-b text-xs" style={{ borderColor: "#F3F4F6", color: "#73838C" }}>
                        {campaign.scheduledAt ? (
                          <div className="flex items-center gap-1">
                            <Clock size={11} />
                            {fmt(campaign.scheduledAt)}
                          </div>
                        ) : (
                          fmt(campaign.createdAt)
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
                        <div className="flex items-center gap-1">
                          {/* Analytics */}
                          <button
                            onClick={() => setAnalyticsModal(campaign)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            title="View Analytics"
                            style={{ color: "#73838C" }}
                          >
                            <BarChart2 size={15} />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(campaign)}
                            disabled={isBusy}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40"
                            title="Duplicate"
                            style={{ color: "#73838C" }}
                          >
                            <Copy size={15} />
                          </button>

                          {/* Launch (DRAFT / SCHEDULED / PAUSED) */}
                          {["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status) && (
                            <button
                              onClick={() => handleLaunch(campaign)}
                              disabled={isBusy}
                              className="p-1.5 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-40"
                              title="Launch Campaign"
                              style={{ color: "#00A63E" }}
                            >
                              <Play size={15} />
                            </button>
                          )}

                          {/* Pause (RUNNING) */}
                          {campaign.status === "RUNNING" && (
                            <button
                              onClick={() => handlePause(campaign)}
                              disabled={isBusy}
                              className="p-1.5 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-40"
                              title="Pause Campaign"
                              style={{ color: "#F59E0B" }}
                            >
                              <Pause size={15} />
                            </button>
                          )}

                          {/* Cancel (DRAFT / SCHEDULED / RUNNING / PAUSED) */}
                          {["DRAFT", "SCHEDULED", "RUNNING", "PAUSED"].includes(campaign.status) && (
                            <button
                              onClick={() => handleCancel(campaign)}
                              disabled={isBusy}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                              title="Cancel Campaign"
                              style={{ color: "#EF4444" }}
                            >
                              <XCircle size={15} />
                            </button>
                          )}

                          {/* Delete (DRAFT / CANCELLED) */}
                          {["DRAFT", "CANCELLED"].includes(campaign.status) && (
                            <button
                              onClick={() => setDeleteModal(campaign)}
                              disabled={isBusy}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                              title="Delete Campaign"
                              style={{ color: "#DC2626" }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              className="flex items-center justify-between px-6 py-3 border-t text-sm"
              style={{ borderColor: "#E5E7EB", color: "#73838C" }}
            >
              <span>
                Showing {campaigns.length} of {pagination.total} campaigns
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchCampaigns(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  style={{ borderColor: "#D1D5DB" }}
                >
                  ← Prev
                </button>
                <span className="font-medium text-gray-700">
                  Page {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchCampaigns(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  style={{ borderColor: "#D1D5DB" }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <DeleteModal
        campaign={deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        loading={actionLoading === deleteModal?.id}
      />
      <AnalyticsDrawer
        campaign={analyticsModal}
        onClose={() => setAnalyticsModal(null)}
      />
    </div>
  );
};

export default CampaignsList;