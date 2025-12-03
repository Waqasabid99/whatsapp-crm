import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [showSuccess, setShowSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // WhatsApp API Settings
  const [whatsappSettings, setWhatsappSettings] = useState({
    wabaId: "123456789012345",
    phoneNumberId: "987654321098765",
    whatsappNumber: "+92 300 1234567",
    webhookUrl: "https://api.yourcrm.com/webhook/whatsapp",
    appId: "",
    appSecret: "",
    webhookVerified: true,
    lastConnected: "11/28/2025, 02:30 PM",
  });

  // Billing Settings
  const [billingData] = useState({
    currentPlan: "Professional",
    planPrice: "$99/month",
    messageRates: {
      marketing: "$0.0088",
      utility: "$0.0041",
      authentication: "$0.0047",
      service: "$0.0097",
    },
    usage: {
      sessionMessages: 4532,
      sessionLimit: 10000,
      templateMessages: 1847,
      templateLimit: 5000,
      contacts: 2341,
      contactLimit: 5000,
    },
    billingCycle: "Renews on Dec 15, 2025",
    paymentMethod: "•••• 4242",
  });

  const [invoices] = useState([
    { id: "INV-001", date: "11/01/2025", amount: "$99.00", status: "Paid" },
    { id: "INV-002", date: "10/01/2025", amount: "$99.00", status: "Paid" },
    { id: "INV-003", date: "09/01/2025", amount: "$99.00", status: "Paid" },
  ]);

  // Security Settings
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Business Profile
  const [businessProfile, setBusinessProfile] = useState({
    businessName: "Tech Solutions Ltd",
    category: "Technology",
    description: "Leading software development company providing innovative solutions",
    address: "123 Business Street, Karachi, Pakistan",
    email: "contact@techsolutions.com",
    website: "www.techsolutions.com",
  });

  const handleWhatsappSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleVerifyWebhook = () => {
    setVerifying(true);
    setTimeout(() => {
      setWhatsappSettings({ ...whatsappSettings, webhookVerified: true });
      setVerifying(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const handleReconnect = () => {
    alert("Redirecting to Facebook to reconnect your WhatsApp Business Account...");
  };

  const handleRefreshToken = () => {
    alert("Access token refreshed successfully!");
  };

  const handleSecuritySave = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleBusinessSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getUsagePercentage = (used, limit) => {
    return (used / limit) * 100;
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return "#DC2626";
    if (percentage >= 70) return "#FFA500";
    return "#00A63E";
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Success Toast */}
      {showSuccess && (
        <div
          className="fixed top-6 right-6 px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3"
          style={{ backgroundColor: "#00A63E", color: "white" }}
        >
          <span className="text-xl">✓</span>
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black">Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#73838C" }}>
          Manage your WhatsApp CRM configuration
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6" style={{ borderColor: "#E5E7EB" }}>
        <div className="flex gap-6 overflow-x-auto">
          {[
            { id: "whatsapp", label: "WhatsApp API", icon: "📱" },
            { id: "billing", label: "Billing & Subscription", icon: "💳" },
            { id: "security", label: "Security", icon: "🔒" },
            { id: "business", label: "Business Profile", icon: "🏢" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn-primary text-white flex items-center gap-2 px-4 py-2 rounded-t-lg mb-4"
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* WhatsApp API Settings */}
      {activeTab === "whatsapp" && (
        <div className="max-w-4xl space-y-6">
          <div className="border rounded-lg p-6" style={{ borderColor: "#E5E7EB" }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Connection Status</h2>
            
            <div className="flex items-center justify-between p-4 rounded-lg mb-4" style={{ backgroundColor: whatsappSettings.webhookVerified ? "#F0F9FF" : "#FFF3E0" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: whatsappSettings.webhookVerified ? "#00A63E" : "#FFA500" }}>
                  <span className="text-white text-xl">{whatsappSettings.webhookVerified ? "✓" : "⚠"}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {whatsappSettings.webhookVerified ? "Connected" : "Webhook Not Verified"}
                  </p>
                  <p className="text-sm" style={{ color: "#73838C" }}>
                    Last connected: {whatsappSettings.lastConnected}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReconnect}
                  className="px-4 py-2 rounded border transition-colors"
                  style={{ borderColor: "#0066CC", color: "#0066CC" }}
                >
                  Reconnect
                </button>
                <button
                  onClick={handleRefreshToken}
                  className="px-4 py-2 rounded border transition-colors"
                  style={{ borderColor: "#00A63E", color: "#00A63E" }}
                >
                  Refresh Token
                </button>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6" style={{ borderColor: "#E5E7EB" }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">API Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  WhatsApp Business Account (WABA) ID
                </label>
                <input
                  type="text"
                  value={whatsappSettings.wabaId}
                  onChange={(e) => setWhatsappSettings({ ...whatsappSettings, wabaId: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB", focusRing: "#0066CC" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={whatsappSettings.phoneNumberId}
                  onChange={(e) => setWhatsappSettings({ ...whatsappSettings, phoneNumberId: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  value={whatsappSettings.whatsappNumber}
                  disabled
                  className="w-full px-4 py-2 border rounded"
                  style={{ borderColor: "#D1D5DB", backgroundColor: "#F9FAFB", color: "#73838C" }}
                />
                <p className="text-xs mt-1" style={{ color: "#73838C" }}>This field is read-only</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Webhook URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={whatsappSettings.webhookUrl}
                    disabled
                    className="flex-1 px-4 py-2 border rounded"
                    style={{ borderColor: "#D1D5DB", backgroundColor: "#F9FAFB", color: "#73838C" }}
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(whatsappSettings.webhookUrl)}
                    className="px-4 py-2 rounded border transition-colors"
                    style={{ borderColor: "#0066CC", color: "#0066CC" }}
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: "#73838C" }}>Automatically generated by the system</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  App ID
                </label>
                <input
                  type="text"
                  value={whatsappSettings.appId}
                  onChange={(e) => setWhatsappSettings({ ...whatsappSettings, appId: e.target.value })}
                  placeholder="Enter your Facebook App ID"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  App Secret
                </label>
                <input
                  type="password"
                  value={whatsappSettings.appSecret}
                  onChange={(e) => setWhatsappSettings({ ...whatsappSettings, appSecret: e.target.value })}
                  placeholder="Enter your Facebook App Secret"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
                <p className="text-xs mt-1" style={{ color: "#73838C" }}>
                  Get these credentials from <a href="https://developers.facebook.com" target="_blank" className="underline" style={{ color: "#0066CC" }}>Facebook Developers</a>
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: "#FFF3E0" }}>
                <span className="text-xl">ℹ️</span>
                <p className="text-sm" style={{ color: "#E65100" }}>
                  Webhook verification status: <strong>{whatsappSettings.webhookVerified ? "Verified ✓" : "Not Verified"}</strong>
                </p>
              </div>

              <div className="flex justify-end gap-3">
                {!whatsappSettings.webhookVerified && (
                  <button
                    onClick={handleVerifyWebhook}
                    disabled={verifying}
                    className="px-6 py-2 rounded text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "#FFA500" }}
                  >
                    {verifying ? "Verifying..." : "Verify Webhook"}
                  </button>
                )}
                <button
                  onClick={handleWhatsappSave}
                  className="px-6 py-2 rounded text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#00A63E" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing & Subscription */}
      {activeTab === "billing" && (
        <div className="max-w-4xl space-y-6">
          <div className="border rounded-lg p-6" style={{ borderColor: "#E5E7EB" }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Plan</h2>
            
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: "#F0F9FF" }}>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{billingData.currentPlan}</h3>
                <p className="text-lg font-semibold" style={{ color: "#0066CC" }}>{billingData.planPrice}</p>
                <p className="text-sm mt-1" style={{ color: "#73838C" }}>{billingData.billingCycle}</p>
              </div>
              <button
                onClick={() => alert("Upgrade plan functionality")}
                className="px-6 py-2 rounded text-white hover:opacity-90"
                style={{ backgroundColor: "#0066CC" }}
              >
                Upgrade Plan
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-6" style={{ borderColor: "#E5E7EB" }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">WhatsApp API Message Rates</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(billingData.messageRates).map(([type, rate]) => (
                <div key={type} className="p-4 rounded-lg border" style={{ borderColor: "#E5E7EB" }}>
                  <p className="text-sm font-medium capitalize" style={{ color: "#73838C" }}>{type}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{rate}</p>
                  <p className="text-xs mt-1" style={{ color: "#73838C" }}>per message</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-6" style={{ borderColor: "#E5E7EB" }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Usage</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">Session Messages</span>
                  <span className="text-sm font-medium text-gray-800">
                    {billingData.usage.sessionMessages.toLocaleString()} / {billingData.usage.sessionLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: "#E5E7EB" }}>
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${getUsagePercentage(billingData.usage.sessionMessages, billingData.usage.sessionLimit)}%`,
                      backgroundColor: getUsageColor(getUsagePercentage(billingData.usage.sessionMessages, billingData.usage.sessionLimit))
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">Template Messages</span>
                  <span className="text-sm font-medium text-gray-800">
                    {billingData.usage.templateMessages.toLocaleString()} / {billingData.usage.templateLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: "#E5E7EB" }}>
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${getUsagePercentage(billingData.usage.templateMessages, billingData.usage.templateLimit)}%`,
                      backgroundColor: getUsageColor(getUsagePercentage(billingData.usage.templateMessages, billingData.usage.templateLimit))
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">Total Contacts Stored</span>
                  <span className="text-sm font-medium text-gray-800">
                    {billingData.usage.contacts.toLocaleString()} / {billingData.usage.contactLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: "#E5E7EB" }}>
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${getUsagePercentage(billingData.usage.contacts, billingData.usage.contactLimit)}%`,
                      backgroundColor: getUsageColor(getUsagePercentage(billingData.usage.contacts, billingData.usage.contactLimit))
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6" style={{ borderColor: "#E5E7EB" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Payment Method</h2>
              <button
                onClick={() => alert("Add payment method functionality")}
                className="px-4 py-2 rounded border transition-colors"
                style={{ borderColor: "#0066CC", color: "#0066CC" }}
              >
                + Add New
              </button>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-lg border" style={{ borderColor: "#E5E7EB" }}>
              <div className="w-12 h-12 rounded flex items-center justify-center text-2xl" style={{ backgroundColor: "#F0F9FF" }}>
                💳
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Visa ending in {billingData.paymentMethod}</p>
                <p className="text-sm" style={{ color: "#73838C" }}>Expires 12/2026</p>
              </div>
              <button
                onClick={() => alert("Edit payment method")}
                className="text-sm"
                style={{ color: "#0066CC" }}
              >
                Edit
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-6" style={{ borderColor: "#E5E7EB" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Invoice History</h2>
              <button
                onClick={() => alert("Download all invoices")}
                className="text-sm"
                style={{ color: "#0066CC" }}
              >
                Download All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#F9FAFB" }}>
                    <th className="text-left p-3 text-sm font-semibold text-gray-800">Invoice ID</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-800">Date</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-800">Amount</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-800">Status</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-800">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t" style={{ borderColor: "#E5E7EB" }}>
                      <td className="p-3 text-sm text-gray-800">{invoice.id}</td>
                      <td className="p-3 text-sm" style={{ color: "#73838C" }}>{invoice.date}</td>
                      <td className="p-3 text-sm font-medium text-gray-800">{invoice.amount}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: "#E8F5E9", color: "#00A63E" }}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => alert(`Download invoice ${invoice.id}`)}
                          className="text-sm"
                          style={{ color: "#0066CC" }}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === "security" && (
        <div className="max-w-2xl">
          <div className="border rounded-lg p-6" style={{ borderColor: "#E5E7EB" }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Current Password
                </label>
                <input
                  type="password"
                  value={securityData.currentPassword}
                  onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  New Password
                </label>
                <input
                  type="password"
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
                <p className="text-xs mt-1" style={{ color: "#73838C" }}>
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={securityData.confirmPassword}
                  onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: "#FFF3E0" }}>
                <span className="text-xl">⚠️</span>
                <p className="text-sm" style={{ color: "#E65100" }}>
                  You will be logged out after changing your password
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSecuritySave}
                  className="px-6 py-2 rounded text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#00A63E" }}
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Profile */}
      {activeTab === "business" && (
        <div className="max-w-2xl">
          <div className="border rounded-lg p-6" style={{ borderColor: "#E5E7EB" }}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Business Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={businessProfile.businessName}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, businessName: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Business Category *
                </label>
                <select
                  value={businessProfile.category}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                >
                  <option>Technology</option>
                  <option>E-commerce</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Finance</option>
                  <option>Real Estate</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Business Description
                </label>
                <textarea
                  value={businessProfile.description}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Address
                </label>
                <input
                  type="text"
                  value={businessProfile.address}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Email *
                </label>
                <input
                  type="email"
                  value={businessProfile.email}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-800">
                  Website
                </label>
                <input
                  type="url"
                  value={businessProfile.website}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, website: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{ borderColor: "#D1D5DB" }}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleBusinessSave}
                  className="px-6 py-2 rounded text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#00A63E" }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;