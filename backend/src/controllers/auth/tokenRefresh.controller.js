import { buildAuthCookies, setAuthCookies } from "../../libs/cookie.option.js";
import { refreshToken } from "../../services/refresh.service.js";
import { fetchUsrIpandAgent } from "../../utils/userAgent.ip.js";

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    console.log("[AuthRefresh] Token received:", token ? "YES (masked: " + token.slice(-5) + ")" : "NO");

    if (!token) {
      return res.status(401).json({ error: "No refresh token present." });
    }

    const { userAgent, ip } = await fetchUsrIpandAgent(req);

    const refreshTokens = await refreshToken(token, userAgent, ip);

    if (!refreshTokens) {
      return res.status(401).json({ error: "Unable to access the session." });
    }

    // Handle explicit status cases from refresh service (reuse detection, expiry)
    if (refreshTokens.status === "REUSE_DETECTED") {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.clearCookie("csrf");
      return res.status(401).json({ error: "Token reuse detected. All sessions revoked." });
    }

    if (refreshTokens.status === "INVALID SESSION") {
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");
      res.clearCookie("csrf");
      return res.status(401).json({ error: "Session expired. Please sign in again." });
    }

    const {
      oldSession,
      newSession,
      newAccessToken,
      newRefreshToken,
      newCsrfToken,
    } = refreshTokens;

    const cookiesToken = await buildAuthCookies({
      refreshToken: newRefreshToken,
      accessToken: newAccessToken,
      csrfToken: newCsrfToken,
    });

    if (!cookiesToken) {
      return res.status(500).json({ error: "Failed to build auth cookies." });
    }

    await setAuthCookies(res, cookiesToken);

    return res.status(200).json({
      status: "success",
      message: "token refreshed and rotated",
      oldSession,
      newSession,
      csrfToken: newCsrfToken,
    });
  } catch (error) {
    // ✅ Never throw — always return a proper HTTP error response
    console.error("[TokenRefresh] Error:", error.message);
    return res.status(401).json({
      error: "Session expired or compromised. Please sign in again.",
    });
  }
};
