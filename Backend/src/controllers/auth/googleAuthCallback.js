// import { OAuth2Client } from "google-auth-library";
// import fetch from "node-fetch";

import { googleOAuthSignIn } from "../../services/auth.services.js";
import {
  getAccessTokenCookieOptions,
  getCsrfTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "../../utils/cookie.utils.js";
import { fetchUsrIpandAgent } from "../../utils/userAgent.ip.js";

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// router.get("/google/callback", async (req, res) => {
//   const { code, state } = req.query;

//   const cookiesState = req.cookies.oauth_state;

//   // 1️⃣ CSRF protection
//   if (!state || state !== req.cookies.oauth_state) {
//     return res.redirect("http://localhost:3000/auth/error?reason=csrf");
//   }

//   try {
//     // 2️⃣ Exchange code for tokens
//     const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         code: code,
//         code_verifier: req.cookies.pkce_verifier,
//         grant_type: "authorization_code",
//         redirect_uri: process.env.GOOGLE_REDIRECT_URI,
//       }),
//     });

//     const tokens = await tokenRes.json();

//     if (!tokens.id_token) {
//       throw new Error("No id_token returned");
//     }

//     // 3️⃣ Verify ID token
//     const ticket = await client.verifyIdToken({
//       idToken: tokens.id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { email, name, sub, email_verified } = payload;

//     // 4️⃣ LOGIN OR REGISTER (simplified)
//     let user = await prisma.user.findUnique({ where: { email } });

//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           email,
//           name,
//           googleId: sub,
//           emailVerified: email_verified,
//         },
//       });
//     }

//     // 5️⃣ Create session (your existing logic)
//     await createUserSession(user.id, req);

//     // 6️⃣ Cleanup
//     res.clearCookie("oauth_state");
//     res.clearCookie("pkce_verifier");

//     // 7️⃣ Redirect to frontend
//     res.redirect("http://localhost:3000/dashboard");
//   } catch (err) {
//     res.redirect("http://localhost:3000/auth/error?reason=google_failed");
//   }
// });

export const authCallback = async (req, res) => {
  try {
    const { userAgent, ip } = await fetchUsrIpandAgent(req);

    const { code, state } = req.query;

    const cookiesState = req.cookies.oauth_state;

    const mode = req.cookies.mode;

    const cookiesPkce = req.cookies.pkce_verifier;

    console.log("mode:", mode);

    const data = await googleOAuthSignIn(
      code,
      state,
      cookiesState,
      cookiesPkce,
      userAgent,
      ip,
      mode,
    );

    console.log("gmail data:", data);

    if (!data) {
      res.status(400).json({
        error: "Error registering user",
      });
    }

    const { user, refreshToken, accessToken, csrfToken } = data;

    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions);

    res.cookie("accessToken", accessToken, getAccessTokenCookieOptions);

    res.cookie("csrf", csrfToken, getCsrfTokenCookieOptions);

    // 6️⃣ Cleanup
    res.clearCookie("oauth_state");
    res.clearCookie("pkce_verifier");

    // 7️⃣ Redirect to frontend
    // res.redirect("http://localhost:3000/dashboard");
    if (user) {
      res.status(200).json({
        message: "User successfully register",
        data: {
          ...user,
          role: "user",
        },
      });
    }
  } catch (error) {
    return res.status(401).json({
      error: error.message,
    });
  }
};
