import crypto from "crypto";

export const googleAuth = async (req, res) => {
  console.log("runningggggg");
  // 1️⃣ CSRF protection
  const state = crypto.randomUUID();

  const mode = typeof req.query.mode === "string" ? req.query.mode : undefined;
  if (mode !== "login" && mode !== "signup") {
    return res.status(400).json({ message: "Invalid mode" });
  }

  const email = req.query.email;

  // 2️⃣ PKCE
  const codeVerifier = crypto.randomBytes(64).toString("hex");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  console.log("gauthMode:", mode);

  res.cookie("mode", mode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // 3️⃣ Store securely (cookies)
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.cookie("pkce_verifier", codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // 4️⃣ Build Google redirect
  const params = email
    ? new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        prompt: "select_account", // allows adding new account
        login_hint: email,
      })
    : new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
        prompt: "select_account", // allows adding new account
      });

  res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
};
