"use client";

import React, { createContext, useContext, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "../../hooks/useUser";
import { useNotificationStore } from "../../store/notificationStore";
import type { Notification } from "../../types/notification";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user } = useUser();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    if (!user?.id) return;

    // Use environment variable for backend URL or fallback to localhost
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";

    const socketInstance = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket");
      socketInstance.emit("join", user.id);
      setSocket(socketInstance); // Update state only when connected
    });

    socketInstance.on("new_notification", (notification: Notification) => {
      console.log("New notification received:", notification);
      addNotification(notification);

      // Basic browser notification if permitted
      if (
        "Notification" in window &&
        window.Notification.permission === "granted"
      ) {
        new window.Notification(notification.title, {
          body: notification.message,
        });
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
      setSocket(null);
    });

    return () => {
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [user?.id, addNotification]);

  // Notification permission is now handled via the NotificationDropdown UI

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
