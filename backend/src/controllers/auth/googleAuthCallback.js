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
    const callbackUrl = `${frontendUrl}/api/auth/callback`;

    return res
      .status(200)
      .set("Content-Type", "text/html; charset=utf-8")
      .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Signing you in...</title>
  </head>
  <body>
    <form id="auth-bridge" method="POST" action="${escapeHtml(callbackUrl)}">
      <input type="hidden" name="refreshToken" value="${escapeHtml(refreshToken)}" />
      <input type="hidden" name="accessToken" value="${escapeHtml(accessToken)}" />
      <input type="hidden" name="csrfToken" value="${escapeHtml(csrfToken)}" />
      <input type="hidden" name="next" value="/dashboard" />
      <noscript>
        <button type="submit">Continue</button>
      </noscript>
    </form>
    <script>
      document.getElementById("auth-bridge")?.submit();
    </script>
  </body>
</html>`);
  } catch (error) {
    return res.status(401).json({
      error: error.message,
    });
  }
};