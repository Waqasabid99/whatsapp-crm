import { useState } from "react";
import { ToastContainer } from "react-toastify";
import CampaignsList from "../components/Campaigns/CampaignsList";
import CreateCampaignWizard from "../components/Campaigns/CreateCampaignWizard";

const Campaigns = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = () => {
    setRefreshKey((k) => k + 1); // triggers re-fetch inside CampaignsList
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <CampaignsList
        key={refreshKey}
        onCreateNew={() => setShowWizard(true)}
      />
      {showWizard && (
        <CreateCampaignWizard
          onClose={() => setShowWizard(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default Campaigns;
