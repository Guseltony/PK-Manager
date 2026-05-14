"use client";

import React, { useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import axios from "axios";
import { useUser } from "../../hooks/useUser";

export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: user } = useUser();

  useEffect(() => {
    // Only run on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform() || !user?.id) return;

    const registerPush = async () => {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === "prompt") {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== "granted") {
        console.warn("User denied push notification permissions");
        return;
      }

      await PushNotifications.register();
    };

    // Listen for registration success and send token to backend
    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration success, token:", token.value);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5555";
      
      axios.post(`${backendUrl}/notifications/register-token`, {
        token: token.value
      }, { withCredentials: true })
      .then(() => console.log("Device token registered with backend"))
      .catch(err => console.error("Error registering device token:", err));
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error:", error.error);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Push notification received:", notification);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
      console.log("Push notification action performed:", notification.actionId, notification.notification);
      if (notification.notification.data?.link) {
        window.location.href = notification.notification.data.link;
      }
    });

    registerPush();

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, [user?.id]);

  return <>{children}</>;
};
