import { useEffect, useState } from "react";
import LoadingPage from "../../../utils/LoadingPage.jsx";
import { backendUrl } from "../../../utils/constants.jsx";
import { useNavigate, useParams } from "react-router-dom";
import TemplatePreview from "./TemplatePreview.jsx";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaSpinner, FaTrash, FaTrashAlt } from "react-icons/fa";

const tableHeaders = [
  { name: "Name", key: "name" },
  { name: "Category", key: "category" },
  { name: "Status", key: "status" },
  { name: "Language", key: "language" },
  { name: "Created At", key: "createdAt" },
  { name: "Actions", key: "actions" },
];

const TemplatesList = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState({});
  const [isSent, setIsSent] = useState({});
  const [deleting, setDeleting] = useState({});
  const [templates, setTemplates] = useState([]);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const navigate = useNavigate();

  // Get unique categories from templates
  const categories = [...new Set(templates.map((t) => t.category))];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getLanguageName = (code) => {
    const languages = {
      en_US: "English (US)",
      en_GB: "English (UK)",
      es_ES: "Spanish",
      fr_FR: "French",
      de_DE: "German",
      pt_BR: "Portuguese (BR)",
      ar_AR: "Arabic",
      hi_IN: "Hindi",
      ur_PK: "Urdu",
    };
    return languages[code] || code;
  };

  const getTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/template/get-templates`, {
        withCredentials: true,
      });
      console.log(data);
      if (data.success) {
        setTemplates(data.templates);
        toast.success(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTemplates();
  }, []);

  // Submit to WhatsApp
  const submitResponse = async (templateId) => {
    setSending((prev) => ({ ...prev, [templateId]: true }));

    try {
      const { data } = await axios.post(`${backendUrl}/template/submit-to-whatsapp/${templateId}`, { withCredentials: true });

      if (data.success) {
        setIsSent((prev) => ({ ...prev, [templateId]: true }));
        toast.success(data.message);
        getTemplates();
      }
    } catch (error) {
      setIsSent((prev) => ({ ...prev, [templateId]: false }));
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setSending((prev) => ({ ...prev, [templateId]: false }));
    }
  };
  // Sync templates
  const syncTemplates = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/template/sync-templates`,
        { withCredentials: true }
      );
      if (data.success) {
        setLoading(false);
        toast.success(data.message);
        getTemplates();
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  // Delete Template
  const deleteTemplate = async (templateId) => {
    setDeleting((prev) => ({ ...prev, [templateId]: true }));
    try {
      const { data } = await axios.delete(`${backendUrl}/template/delete-template/${templateId}`, { withCredentials: true });
      if (data.success) {
        toast.success(data.message);
        getTemplates();
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  }
  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "approved" && template.approved) ||
      (selectedStatus === "pending" && !template.approved);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Templates
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your WhatsApp message templates
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={syncTemplates}
                className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: "#00A63E" }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Syncing Templates
                  </>
                ) : (
                  <>Sync Templates</>
                )}
              </button>
              <button
                onClick={() =>
                  navigate(`/dashboard/workspace/${id}/templates/create`)
                }
                className="px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ backgroundColor: "#00A63E" }}
              >
                + New Template
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">
            Showing {filteredTemplates.length} of {templates.length} templates
          </span>
        </div>

        {/* Templates */}
        {loading ? (
          <LoadingPage />
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {tableHeaders.map((header) => (
                      <th
                        key={header.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTemplates.map((tpl) => (
                    <tr
                      key={tpl.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="text-gray-900 font-medium">
                          {tpl.name}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                          {tpl.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{
                            backgroundColor: tpl.status === "APPROVED"
                              ? "#00A63E"
                              : "#F59E0B",
                          }}
                        >
                          {tpl?.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {getLanguageName(tpl.language)}
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {formatDate(tpl.updatedAt)}
                      </td>
                      <td className="p-4 flex">
                        <button
                          disabled={sending[tpl.id]} // Disable if currently sending or already sent
                          onClick={() => submitResponse(tpl.id)}
                          className="px-3 py-1.5 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          {sending[tpl.id] ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              {isSent ? "Sent" : "Send"}
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setPreviewTemplate(tpl)}
                          className="px-3 py-1.5 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => deleteTemplate(tpl.id)}
                          className="px-3 py-1.5 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          {deleting[tpl.id] ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                          ) : (
                            <FaTrashAlt className="w-4 h-4" />
                          )}

                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No templates found matching your filters.
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredTemplates.map((tpl) => (
                <div key={tpl.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {tpl.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                          {tpl.category}
                        </span>
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                          style={{
                            backgroundColor: tpl.approved
                              ? "#00A63E"
                              : "#F59E0B",
                          }}
                        >
                          {tpl.approved ? "Approved" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Language:</span>
                      <p className="text-gray-900 font-medium">
                        {getLanguageName(tpl.language)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Updated:</span>
                      <p className="text-gray-900 font-medium">
                        {formatDate(tpl.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="w-full px-3 py-2 text-sm font-medium text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Preview Template
                  </button>
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No templates found matching your filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewTemplate && (
          <TemplatePreview
            tpl={previewTemplate}
            isOpen={!!previewTemplate}
            onClose={() => setPreviewTemplate(null)}
          />
        )}
      </div>
    </div>
  );
};

export default TemplatesList;
