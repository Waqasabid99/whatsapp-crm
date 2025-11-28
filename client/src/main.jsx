import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/Auth/Login.jsx";
import ErrorPage from "./utils/ErrorPage.jsx";
import Register from "./components/Auth/Register.jsx";
import Loader from "./utils/LoadingPage.jsx";
import Home from "./Dashboard/pages/Home.jsx";
import DashboardLayout from "./Layout/DashboardLayout.jsx";
import WorkspaceSelector from "./Dashboard/components/WorkspaceSelector.jsx";
import LiveChat from "./Dashboard/pages/LiveChat.jsx";
import Templates from "./Dashboard/pages/Templates.jsx";
import Agents from "./Dashboard/pages/Agents.jsx";
import TemplateForm from "./Dashboard/components/Templates/TemplateForm.jsx";
import TemplatesList from "./Dashboard/components/Templates/TemplateList.jsx";
import Campaigns from "./Dashboard/pages/Campaigns.jsx";
import CampaignsList from "./Dashboard/components/Campaigns/CampaignsList.jsx";
import CreateCampaignWizard from "./Dashboard/components/Campaigns/CreateCampaignWizard.jsx";
import Contacts from "./Dashboard/pages/Contacts.jsx";
import ContactsList from "./Dashboard/components/Contacts/ContactList.jsx";
import CreateContact from "./Dashboard/components/Contacts/CreateContact.jsx";
import ContactProfile from "./Dashboard/components/Contacts/ContactProfile.jsx";

const router = createBrowserRouter([
  {
    path: "*",
    element: <ErrorPage />,
    hydrateFallbackElement: <Loader />,
  },
  {
    path: "/",
    element: <App />,
    hydrateFallbackElement: <Loader />,
  },
  {
    path: "/register",
    element: <Register />,
    hydrateFallbackElement: <Loader />,
  },
  {
    path: "/login",
    element: <Login />,
    hydrateFallbackElement: <Loader />,
  },
  {
    path: "/dashboard/workspace/:id",
    element: <DashboardLayout />,
    children: [
      {
        path: "home",
        element: <Home />,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "live-chats",
        element: <LiveChat />,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "templates",
        element: <Templates />,
        children: [
          {
            index: true,
            element: <TemplatesList />,
            hydrateFallbackElement: <Loader />,
          },
          {
            path: "create",
            element: <TemplateForm />,
            hydrateFallbackElement: <Loader />,
          },
          {
            path: "edit/:templateId",
            element: <TemplateForm />,
            hydrateFallbackElement: <Loader />,
          },
        ],
      },
      {
        path: "campaigns",
        element: <Campaigns />,
        children: [
          {
            index: true,
            element: <CampaignsList />,
            hydrateFallbackElement: <Loader />,
          },
          {
            path: "create",
            element: <CreateCampaignWizard />,
            hydrateFallbackElement: <Loader />,
          }
        ],
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "contacts",
        element: <Contacts />,
        children: [
          {
            index: true,
            element: <ContactsList />,
            hydrateFallbackElement: <Loader />,
          },
          {
            path: "create",
            element: <CreateContact />,
            hydrateFallbackElement: <Loader />,
          },
          {
            path: ":contactId",
            element: <ContactProfile />,
            hydrateFallbackElement: <Loader />,
          }
        ],
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "chatbots",
        element: <div>Chatbots</div>,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "agents",
        element: <Agents />,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "settings",
        element: <div>Settings</div>,
        hydrateFallbackElement: <Loader />,
      },
    ],
  },
  {
    path: "/users/:id/workspaces",
    element: <WorkspaceSelector />,
    hydrateFallbackElement: <Loader />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
