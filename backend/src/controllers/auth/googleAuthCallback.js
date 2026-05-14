import { buildAuthCookies, setAuthCookies } from "../../libs/cookie.option.js";
import { googleOAuthSignIn } from "../../services/auth.services.js";
import { fetchUsrIpandAgent } from "../../utils/userAgent.ip.js";
import { env } from "../../validators/env.schema.js";

const escapeHtml = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const authCallback = async (req, res) => {
  try {
    const { userAgent, ip } = await fetchUsrIpandAgent(req);

    const { code, state } = req.query;
    const cookiesState = req.cookies.oauth_state;
    const mode = req.cookies.mode;
    const cookiesPkce = req.cookies.pkce_verifier;

    const data = await googleOAuthSignIn(
      code,
      state,
      cookiesState,
      cookiesPkce,
      userAgent,
      ip,
      mode,
    );

    if (!data) {
      return res.status(400).json({
        error: "Error registering user",
      });
    }

    const { refreshToken, accessToken, csrfToken } = data;

    const cookies = await buildAuthCookies({
      refreshToken,
      accessToken,
      csrfToken,
    });

    await setAuthCookies(res, cookies);

    res.clearCookie("oauth_state");
    res.clearCookie("pkce_verifier");
    res.clearCookie("mode");

    const frontendUrl = env.FRONTEND_URL || "https://pkmanager.vercel.app";
    return res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    return res.status(401).json({
      error: error.message,
    });
  }
};

export const authCodeExchange = async (req, res) => {
  try {
    const { userAgent, ip } = await fetchUsrIpandAgent(req);
    const {
      code,
      state,
      storedState,
      codeVerifier,
      mode,
      redirectUri,
    } = req.body;

    const data = await googleOAuthSignIn(
      code,
      state,
      storedState,
      codeVerifier,
      userAgent,
      ip,
      mode,
      redirectUri,
    );

    if (!data) {
      return res.status(400).json({ error: "Error signing in with Google" });
    }

    const { refreshToken, accessToken, csrfToken, user } = data;

    const cookies = await buildAuthCookies({
      refreshToken,
      accessToken,
      csrfToken,
    });

    await setAuthCookies(res, cookies);

    return res.status(200).json({
      data: {
        refreshToken,
        accessToken,
        csrfToken,
        user,
      },
    });
  } catch (error) {
    return res.status(401).json({
      error: error.message,
    });
  }
};
