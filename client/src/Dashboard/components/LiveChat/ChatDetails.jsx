const ContactDetails = ({ selectedChat }) => {
  // Guard: selectedChat or contact may be undefined during render
  const contact = selectedChat?.contact;

  if (!contact) return null;

  const {
    name = "Unknown Contact",
    phoneNumber,
    email,
    avatar,
    tags,
    labels,
    notes,
    metadata,
    assignedAgent,
  } = contact;

  // Normalize optional fields (VERY IMPORTANT)
  const safeTags = Array.isArray(tags) ? tags : [];
  const safeLabels = Array.isArray(labels) ? labels : [];
  const safeMetadata =
    metadata && typeof metadata === "object" ? metadata : {};

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Contact Info */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center text-white text-3xl font-semibold mb-3">
            {avatar || name.charAt(0)}
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {name}
          </h3>

          {phoneNumber && (
            <p className="text-sm text-gray-500">{phoneNumber}</p>
          )}
          {email && <p className="text-sm text-gray-500">{email}</p>}
        </div>

        {/* Tags */}
        {safeTags.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {safeTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Agent */}
        {assignedAgent?.name && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Assigned Agent
            </h4>
            <p className="text-sm text-gray-600">
              {assignedAgent.name}
            </p>
          </div>
        )}

        {/* Labels */}
        {safeLabels.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Labels
            </h4>
            <div className="flex flex-wrap gap-2">
              {safeLabels.map((label, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Notes
            </h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {notes}
              </p>
            </div>
          </div>
        )}

        {/* Custom Fields / Metadata */}
        {Object.keys(safeMetadata).length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Custom Fields
            </h4>
            <div className="space-y-2">
              {Object.entries(safeMetadata).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600 capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>
                  <span className="text-gray-900 font-medium">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {safeTags.length === 0 &&
          safeLabels.length === 0 &&
          !notes &&
          Object.keys(safeMetadata).length === 0 && (
            <p className="text-sm text-gray-400 text-center">
              No additional contact details
            </p>
          )}
      </div>
    </div>
  );
};

export default ContactDetails;