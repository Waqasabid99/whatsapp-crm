import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../utils/constants";

const useAuthContext = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,

        register: async (formData, navigate) => {
          set({ loading: true, error: null });

          try {
            const { data } = await axios.post(
              `${backendUrl}/users/auth/register`,
              formData,
              { withCredentials: true }
            );
            console.log(data)
            if (data.success) {
              set({
                loading: false,
                user: data.user,
                isAuthenticated: true,
                error: null,
              });

              toast.success("Registration successful.");
              navigate(`/dashboard/workspace/${data.user.id}/home`);
            } else {
              set({ loading: false, error: data.message });
              toast.error(data.message);
            }
          } catch (err) {
            set({ loading: false, error: "Registration failed." });
            toast.error("Registration failed. Please try again.");
          }
        },

        login: async (formData, navigate) => {
          set({ loading: true, error: null });

          try {
            const { data } = await axios.post(
              `${backendUrl}/users/auth/login`,
              formData,
              { withCredentials: true }
            );

            if (data.success) {
              set({
                loading: false,
                user: data.user,
                isAuthenticated: true,
                error: null,
              });

              toast.success("Login successful");

              setTimeout(() => {
                if (data.workspaces.length > 1) {
                  navigate(`/dashboard/users/${data.user.id}/workspaces`);
                } else {
                  navigate(`/dashboard/workspace/${data.workspaces[0].id}/home`);
                }
              }, 800);
            } else {
              set({ loading: false, error: data.message });
              toast.error(data.message);
            }
          } catch (err) {
            set({
              loading: false,
              error: "Login failed. Please check your credentials.",
            });
            toast.error("Login failed. Please check your credentials.");
          }
        },
      }),

      {
        name: "agency-storage",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

export default useAuthContext;
