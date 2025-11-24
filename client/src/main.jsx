import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './components/Auth/Login.jsx'
import ErrorPage from './utils/ErrorPage.jsx'
import Register from './components/Auth/Register.jsx'
import Loader from './utils/LoadingPage.jsx'
import Home from './Dashboard/pages/Home.jsx'
import DashboardLayout from './Layout/DashboardLayout.jsx'

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
        path: "/dashboard/workspace/:id/home",
        element: <Home />,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "/dashboard/workspace/:id/live-chats",
        element: <div>Live Chats</div>,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "/dashboard/workspace/:id/templates",
        element: <div>Templates</div>,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "/dashboard/workspace/:id/campaigns",
        element: <div>Campaigns</div>,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "/dashboard/workspace/:id/contacts",
        element: <div>Contacts</div>,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "/dashboard/workspace/:id/Chatbots",
        element: <div>Chatbots</div>,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "/dashboard/workspace/:id/agents",
        element: <div>Agents</div>,
        hydrateFallbackElement: <Loader />,
      },
      {
        path: "/dashboard/workspace/:id/settings",
        element: <div>Settings</div>,
        hydrateFallbackElement: <Loader />,
      },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <RouterProvider router={router} />
  </StrictMode>
)
