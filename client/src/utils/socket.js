import { io } from "socket.io-client";
import { backendUrl } from "./constants";

export const socket = io(backendUrl, {
  withCredentials: true,
  autoConnect: false,
});
