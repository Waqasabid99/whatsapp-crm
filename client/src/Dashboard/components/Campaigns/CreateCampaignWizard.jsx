import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../../../utils/constants";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Search,
  Users,
  FileText,
  Calendar,
  Send,
  Clock,
  Loader2,
  AlertCircle,
  Tag,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Karachi", "Asia/Kolkata", "Asia/Dubai", "Asia/Tokyo",
  "Australia/Sydney", "Pacific/Auckland",
];

const STEPS = [
  { id: 1, label: "Details", icon: FileText },
  { id: 2, label: "Template", icon: Tag },
  { id: 3, label: "Audience", icon: Users },
  { id: 4, label: "Schedule", icon: Calendar },
];

const emptyForm = {
  name: "",
  description: "",
  templateId: "",
  audienceType: "group",     // "group" | "contacts"
  audienceGroupId: "",
  contactIds: [],
  scheduledAt: "",
  timezone: "UTC",
  variables: {},             // { "1": "value" }
};

// Placeholder extractor from template BODY component
const extractVarKeys = (components) => {
  if (!Array.isArray(components)) return [];
  const body = components.find((c) => c.type === "BODY");
  const matches = body?.text?.match(/\{\{(\d+)\}\}/g) ?? [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "")))];
};

// ─── Step indicator ────────────────────────────────────────────────────────────
const StepBar = ({ current }) => (
  <div className="flex items-center justify-between mb-8 px-2">
    {STEPS.map((step, i) => {
      const done = current > step.id;
      const active = current === step.id;
      const Icon = step.icon;
      return (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-semibold text-sm"
              style={{
                backgroundColor: done ? "#00A63E" : active ? "#00A63E1A" : "#F3F4F6",
                color: done ? "white" : active ? "#00A63E" : "#9CA3AF",
                border: active ? "2px solid #00A63E" : done ? "none" : "2px solid #E5E7EB",
              }}
            >
              {done ? <CheckCircle size={18} /> : <Icon size={16} />}
            </div>
            <span
              className="mt-1 text-xs font-medium"
              style={{ color: active || done ? "#00A63E" : "#9CA3AF" }}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="flex-1 h-0.5 mx-3 transition-all duration-300"
              style={{ backgroundColor: done ? "#00A63E" : "#E5E7EB" }}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Step 1: Campaign Details ─────────────────────────────────────────────────
const StepDetails = ({ form, onChange }) => (
  <div className="space-y-5">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        Campaign Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={form.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="e.g. Black Friday Sale 2025"
        maxLength={100}
        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
        style={{ borderColor: "#D1D5DB" }}
      />
      <p className="text-xs mt-1 text-right" style={{ color: "#9CA3AF" }}>
        {form.name.length}/100
      </p>
    </div>
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        Description <span className="text-gray-400 font-normal">(optional)</span>
      </label>
      <textarea
        value={form.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder="Briefly describe what this campaign is about…"
        rows={4}
        maxLength={500}
        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"
        style={{ borderColor: "#D1D5DB" }}
      />
      <p className="text-xs mt-1 text-right" style={{ color: "#9CA3AF" }}>
        {form.description.length}/500
      </p>
    </div>
  </div>
);

// ─── Step 2: Template Selection ───────────────────────────────────────────────
const StepTemplate = ({ form, onChange, templates, loadingTemplates }) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return templates;
    const q = search.toLowerCase();
    return templates.filter(
      (t) => t.name.toLowerCase().includes(q) || t.language.toLowerCase().includes(q)
    );
  }, [templates, search]);

  if (loadingTemplates) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={28} className="animate-spin text-green-500" />
        <span className="ml-3 text-gray-500">Loading approved templates…</span>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={36} className="mx-auto mb-3 text-yellow-400" />
        <p className="text-gray-600 font-medium">No approved templates found</p>
        <p className="text-sm mt-1 text-gray-400">
          Create and get a template approved in the Templates section first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          style={{ borderColor: "#D1D5DB" }}
        />
      </div>

      {/* Template cards */}
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {filtered.map((t) => {
          const bodyComp = Array.isArray(t.components)
            ? t.components.find((c) => c.type === "BODY")
            : null;
          const selected = form.templateId === t.id;

          return (
            <div
              key={t.id}
              onClick={() => onChange("templateId", t.id)}
              className="p-4 border rounded-xl cursor-pointer transition-all"
              style={{
                borderColor: selected ? "#00A63E" : "#E5E7EB",
                backgroundColor: selected ? "#F0FDF4" : "white",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-800">{t.name}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "#DBEAFE", color: "#1E40AF" }}
                    >
                      {t.language}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
                    >
                      {t.status}
                    </span>
                  </div>
                  {bodyComp?.text && (
                    <p className="text-xs text-gray-500 line-clamp-2">{bodyComp.text}</p>
                  )}
                  <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                    Category: {t.category} · Type: {t.type}
                  </p>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center"
                  style={{
                    borderColor: selected ? "#00A63E" : "#D1D5DB",
                    backgroundColor: selected ? "#00A63E" : "transparent",
                  }}
                >
                  {selected && <CheckCircle size={12} color="white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Step 3: Audience ─────────────────────────────────────────────────────────
const StepAudience = ({
  form, onChange,
  contacts, loadingContacts,
  contactGroups, loadingGroups,
}) => {
  const [search, setSearch] = useState("");

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        (c.name ?? "").toLowerCase().includes(q) ||
        c.phoneNumber.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const toggleContact = (contactId) => {
    const current = form.contactIds;
    if (current.includes(contactId)) {
      onChange("contactIds", current.filter((id) => id !== contactId));
    } else {
      onChange("contactIds", [...current, contactId]);
    }
  };

  return (
    <div className="space-y-5">
      {/* Audience type selector */}
      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "#E5E7EB" }}>
        <button
          onClick={() => onChange("audienceType", "group")}
          className="flex-1 py-2.5 text-sm font-semibold transition-all"
          style={{
            backgroundColor: form.audienceType === "group" ? "#00A63E" : "white",
            color: form.audienceType === "group" ? "white" : "#374151",
          }}
        >
          Contact Group
        </button>
        <button
          onClick={() => onChange("audienceType", "contacts")}
          className="flex-1 py-2.5 text-sm font-semibold transition-all"
          style={{
            backgroundColor: form.audienceType === "contacts" ? "#00A63E" : "white",
            color: form.audienceType === "contacts" ? "white" : "#374151",
          }}
        >
          Select Contacts
        </button>
      </div>

      {/* GROUP mode */}
      {form.audienceType === "group" && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Audience Group <span className="text-red-500">*</span>
          </label>
          {loadingGroups ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 size={18} className="animate-spin text-green-500" />
              <span className="text-sm text-gray-400">Loading groups…</span>
            </div>
          ) : contactGroups.length === 0 ? (
            <p className="text-sm text-gray-400 py-4">
              No contact groups found. Create one in the Contacts section.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {contactGroups.map((g) => {
                const selected = form.audienceGroupId === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => onChange("audienceGroupId", g.id)}
                    className="p-3 border rounded-xl cursor-pointer transition-all flex items-center justify-between"
                    style={{
                      borderColor: selected ? "#00A63E" : "#E5E7EB",
                      backgroundColor: selected ? "#F0FDF4" : "white",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: (g.color ?? "#6B7280") + "20" }}
                      >
                        <Users size={14} style={{ color: g.color ?? "#6B7280" }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{g.name}</p>
                        {g.description && (
                          <p className="text-xs text-gray-400">{g.description}</p>
                        )}
                      </div>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: selected ? "#00A63E" : "#D1D5DB",
                        backgroundColor: selected ? "#00A63E" : "transparent",
                      }}
                    >
                      {selected && <CheckCircle size={12} color="white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CONTACTS mode */}
      {form.audienceType === "contacts" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">
              Select Contacts <span className="text-red-500">*</span>
            </label>
            {form.contactIds.length > 0 && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
              >
                {form.contactIds.length} selected
              </span>
            )}
          </div>

          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ borderColor: "#D1D5DB" }}
            />
          </div>

          {loadingContacts ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 size={18} className="animate-spin text-green-500" />
              <span className="text-sm text-gray-400">Loading contacts…</span>
            </div>
          ) : (
            <>
              {filteredContacts.length > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() =>
                      onChange(
                        "contactIds",
                        filteredContacts
                          .filter((c) => !c.isOptOut)
                          .map((c) => c.id)
                      )
                    }
                    className="text-xs font-medium hover:underline"
                    style={{ color: "#00A63E" }}
                  >
                    Select all eligible
                  </button>
                  {form.contactIds.length > 0 && (
                    <button
                      onClick={() => onChange("contactIds", [])}
                      className="text-xs font-medium hover:underline text-gray-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {filteredContacts.map((c) => {
                  const selected = form.contactIds.includes(c.id);
                  const optOut = c.isOptOut;
                  return (
                    <div
                      key={c.id}
                      onClick={() => !optOut && toggleContact(c.id)}
                      className="flex items-center gap-3 p-2.5 border rounded-xl transition-all"
                      style={{
                        borderColor: selected ? "#00A63E" : "#E5E7EB",
                        backgroundColor: optOut
                          ? "#F9FAFB"
                          : selected
                            ? "#F0FDF4"
                            : "white",
                        cursor: optOut ? "not-allowed" : "pointer",
                        opacity: optOut ? 0.5 : 1,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: "#00A63E" }}
                      >
                        {(c.name ?? c.phoneNumber).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {c.name ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400">{c.phoneNumber}</p>
                      </div>
                      {optOut && (
                        <span className="text-xs text-red-400 font-medium">opted-out</span>
                      )}
                      <div
                        className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0"
                        style={{
                          borderColor: selected ? "#00A63E" : "#D1D5DB",
                          backgroundColor: selected ? "#00A63E" : "transparent",
                        }}
                      >
                        {selected && (
                          <svg viewBox="0 0 12 12" width="10" fill="white">
                            <path d="M1 6l4 4 6-7" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredContacts.length === 0 && (
                  <p className="text-sm text-center py-4 text-gray-400">No contacts found</p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Step 4: Schedule & Variables ─────────────────────────────────────────────
const StepSchedule = ({ form, onChange, selectedTemplate }) => {
  const varKeys = selectedTemplate
    ? extractVarKeys(selectedTemplate.components)
    : [];

  return (
    <div className="space-y-6">
      {/* Template variable slots */}
      {varKeys.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Template Variables
          </h3>
          <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
            {varKeys.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: "#EDE9FE", color: "#7C3AED" }}
                >
                  {`{{${key}}}`}
                </span>
                <input
                  type="text"
                  placeholder={`Value for {{${key}}}`}
                  value={form.variables[key] ?? ""}
                  onChange={(e) =>
                    onChange("variables", { ...form.variables, [key]: e.target.value })
                  }
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          Schedule (optional)
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Leave blank to save as Draft and launch manually later.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Schedule Date & Time
            </label>
            <div className="relative">
              <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => onChange("scheduledAt", e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                style={{ borderColor: "#D1D5DB" }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Timezone</label>
            <select
              value={form.timezone}
              onChange={(e) => onChange("timezone", e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ borderColor: "#D1D5DB" }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Review summary ───────────────────────────────────────────────────────────
const ReviewRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-2.5 border-b last:border-0" style={{ borderColor: "#F3F4F6" }}>
    <span className="text-sm font-medium" style={{ color: "#73838C" }}>{label}</span>
    <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">{value}</span>
  </div>
);

// ─── Main wizard ──────────────────────────────────────────────────────────────
const CreateCampaignWizard = ({ onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Remote data
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactGroups, setContactGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Load data on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const { data } = await axios.get(`${backendUrl}/template/get-templates`, {
          withCredentials: true,
        });
        if (data.success) {
          // Only show APPROVED templates
          setTemplates(data.templates.filter((t) => t.status === "APPROVED"));
        }
      } catch (err) {
        console.error("Templates fetch failed:", err);
        toast.error("Failed to load templates");
      } finally {
        setLoadingTemplates(false);
      }
    };

    const fetchContacts = async () => {
      try {
        setLoadingContacts(true);
        const { data } = await axios.get(`${backendUrl}/contact/get-contacts`, {
          withCredentials: true,
        });
        if (data.success) setContacts(data.contacts);
      } catch (err) {
        console.error("Contacts fetch failed:", err);
      } finally {
        setLoadingContacts(false);
      }
    };

    // Contact groups — not a dedicated endpoint yet; derive from contacts if needed
    // We'll also try the workspace contact groups via a direct call
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        // Attempt to read from the campaign contacts overview which exposes groups
        // If there's no dedicated endpoint we gracefully fall back to empty
        const { data } = await axios.get(`${backendUrl}/contact/get-contacts`, {
          withCredentials: true,
        });
        // Future: replace with a dedicated /contact/groups endpoint
        setContactGroups([]);
      } catch (err) {
        console.error("Groups fetch failed:", err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchTemplates();
    fetchContacts();
    fetchGroups();
  }, []);

  const onChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const selectedTemplate = templates.find((t) => t.id === form.templateId) ?? null;

  // ── Validation per step ───────────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return form.name.trim().length > 0;
    if (step === 2) return !!form.templateId;
    if (step === 3) {
      if (form.audienceType === "group") return !!form.audienceGroupId;
      return form.contactIds.length > 0;
    }
    return true;
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (launch = false) => {
    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        templateId: form.templateId,
        scheduledAt: form.scheduledAt || undefined,
        timezone: form.timezone,
        variables: Object.keys(form.variables).length > 0 ? form.variables : undefined,
      };

      if (form.audienceType === "group") {
        payload.audienceGroupId = form.audienceGroupId;
      } else {
        payload.contactIds = form.contactIds;
      }

      const { data } = await axios.post(`${backendUrl}/campaign`, payload, {
        withCredentials: true,
      });

      if (data.success) {
        if (launch) {
          // Immediately launch the created campaign
          await axios.post(
            `${backendUrl}/campaign/${data.campaign.id}/launch`,
            {},
            { withCredentials: true }
          );
          toast.success("Campaign created and launched! 🚀");
        } else {
          toast.success(
            form.scheduledAt ? "Campaign scheduled successfully!" : "Campaign saved as draft!"
          );
        }
        onCreated?.();
        onClose?.();
      } else {
        toast.error(data.message ?? "Failed to create campaign");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Something went wrong");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Audience label for review ─────────────────────────────────────────────
  const audienceSummary = () => {
    if (form.audienceType === "group") {
      const g = contactGroups.find((x) => x.id === form.audienceGroupId);
      return g ? g.name : form.audienceGroupId;
    }
    return `${form.contactIds.length} contact(s) selected`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Campaign</h2>
            <p className="text-xs mt-0.5" style={{ color: "#73838C" }}>
              Step {step} of {STEPS.length} — {STEPS[step - 1].label}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <StepBar current={step} />

          {step === 1 && <StepDetails form={form} onChange={onChange} />}
          {step === 2 && (
            <StepTemplate
              form={form}
              onChange={onChange}
              templates={templates}
              loadingTemplates={loadingTemplates}
            />
          )}
          {step === 3 && (
            <StepAudience
              form={form}
              onChange={onChange}
              contacts={contacts}
              loadingContacts={loadingContacts}
              contactGroups={contactGroups}
              loadingGroups={loadingGroups}
            />
          )}
          {step === 4 && (
            <>
              <StepSchedule
                form={form}
                onChange={onChange}
                selectedTemplate={selectedTemplate}
              />

              {/* Review card */}
              <div
                className="mt-6 rounded-xl border p-4"
                style={{ borderColor: "#E5E7EB", backgroundColor: "#F8FAFC" }}
              >
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <CheckCircle size={15} className="text-green-500" />
                  Campaign Summary
                </h3>
                <ReviewRow label="Name" value={form.name} />
                <ReviewRow
                  label="Template"
                  value={selectedTemplate?.name ?? "—"}
                />
                <ReviewRow label="Audience" value={audienceSummary()} />
                <ReviewRow
                  label="Schedule"
                  value={
                    form.scheduledAt
                      ? new Date(form.scheduledAt).toLocaleString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })
                      : "Immediate (launch now) or save as Draft"
                  }
                />
                {form.scheduledAt && (
                  <ReviewRow label="Timezone" value={form.timezone} />
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t shrink-0"
          style={{ borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" }}
        >
          <button
            onClick={back}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all disabled:opacity-40"
            style={{ borderColor: "#D1D5DB", color: "#374151" }}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-3">
            {step === STEPS.length ? (
              <>
                {/* Save as draft */}
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border text-sm font-semibold transition-all disabled:opacity-60 hover:bg-gray-50 flex items-center gap-1.5"
                  style={{ borderColor: "#D1D5DB", color: "#374151" }}
                >
                  {submitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <FileText size={15} />
                  )}
                  {form.scheduledAt ? "Schedule" : "Save Draft"}
                </button>

                {/* Launch now */}
                {!form.scheduledAt && (
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5"
                    style={{ backgroundColor: "#00A63E" }}
                  >
                    {submitting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    Launch Now
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={next}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: "#00A63E" }}
              >
                Next <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignWizard;
