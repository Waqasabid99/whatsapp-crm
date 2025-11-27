// src/modules/templates/TemplatesList.jsx
import { useState } from "react";
import LoadingPage from "../../../utils/LoadingPage.jsx";
import { sampleTemplates } from "../../../utils/constants.jsx";
import { useNavigate, useParams } from "react-router-dom";
import TemplatePreview from "./TemplatePreview.jsx";

const TemplatesList = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(false);
  const handlePreview = () => {
    (previewTemplate) ? setPreviewTemplate(false) : setPreviewTemplate(true);
  };
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-black">Templates</h1>
        <button
          onClick={() =>
            navigate(`/dashboard/workspace/${id}/templates/create`)
          }
          className="px-4 py-2 rounded text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#00A63E" }}
        >
          + New Template
        </button>
      </div>

      {loading ? (
        <LoadingPage />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
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
                  Category
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
                  Language
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-800 border-b-2"
                  style={{ borderColor: "#73838C" }}
                >
                  Last Updated
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-800 border-b-2"
                  style={{ borderColor: "#73838C" }}
                >
                  Preview
                </th>
              </tr>
            </thead>
            <tbody>
              {sampleTemplates.map((tpl, index) => (
                <>
                  <tr
                    key={tpl.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    style={{
                      backgroundColor: index % 2 === 0 ? "white" : "#F9FAFB",
                    }}
                  >
                    <td
                      className="p-4 border-b"
                      style={{ borderColor: "#73838C33" }}
                    >
                      <span onClick={() => handlePreview} className="text-gray-800 font-medium">
                        {tpl.name}
                      </span>
                    </td>
                    <td
                      className="p-4 border-b"
                      style={{ borderColor: "#73838C33", color: "#73838C" }}
                    >
                      {tpl.category}
                    </td>
                    <td
                      className="p-4 border-b"
                      style={{ borderColor: "#73838C33" }}
                    >
                      <span
                        className="px-3 py-1 rounded text-sm font-medium inline-block"
                        style={{
                          backgroundColor:
                            tpl.status === "approved" ? "#00A63E" : "#FFA500",
                          color: "white",
                        }}
                      >
                        {tpl.status}
                      </span>
                    </td>
                    <td
                      className="p-4 border-b"
                      style={{ borderColor: "#73838C33", color: "#73838C" }}
                    >
                      {tpl.language || "English"}
                    </td>
                    <td
                      className="p-4 border-b"
                      style={{ borderColor: "#73838C33", color: "#73838C" }}
                    >
                      {tpl.lastUpdated || "N/A"}
                    </td>
                    <td
                      className="p-4 border-b"
                      style={{ borderColor: "#73838C33" }}
                    >
                      <button onClick={handlePreview} className="btn-primary">
                        Preview
                      </button>
                    </td>
                  </tr>
                  {previewTemplate && (
                    <TemplatePreview
                      tpl={tpl}
                      isOpen={previewTemplate}
                      onClose={() => setPreviewTemplate(false)}
                    />
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TemplatesList;
