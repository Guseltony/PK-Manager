"use client";

import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isNative, setIsNative] = useState<boolean>(false);

  useEffect(() => {
    const checkPlatform = async () => {
      const info = await Device.getInfo();
      const platform = Capacitor.getPlatform();
      
      setIsNative(platform === "ios" || platform === "android");
      setIsMobile(platform === "ios" || platform === "android" || info.operatingSystem === "android" || info.operatingSystem === "ios");
    };

    checkPlatform();
  }, []);

  return { isMobile, isNative };
}
