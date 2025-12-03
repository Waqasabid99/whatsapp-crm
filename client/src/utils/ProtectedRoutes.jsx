import { Navigate, Outlet } from "react-router-dom";
import useAuthContext from "../context/useAuthContext";
import Loader from "./LoadingPage";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthContext((s) => s.isAuthenticated);
  const loading = useAuthContext((s) => s.loading);
  const user = useAuthContext((s) => s.user);

  // While checkAuth() is running → show loader
  if (loading) {
    return <Loader />;
  }

  // If not authenticated after checkAuth → redirect to login
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated → allow access
  return <Outlet />;
};

export default ProtectedRoute;
