// register user

import { prisma } from "../libs/prisma.js";
import bcrypt from "bcryptjs";
import session from "./session.service.js";
import { generateTokens } from "../utils/token.utils.js";
import { OAuth2Client } from "google-auth-library";
// import crypto from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const registerUser = async (
  { email, password, username, name },
  userAgent,
  ip,
) => {
  console.log("running user registration");
  if (!email || !password || !username || !name) {
    throw new Error("name, email, password and username are required");
  }

  // check if the email already exist

  const emailExisted = await prisma.user.findUnique({
    where: { email: email },
  });

  if (emailExisted) {
    throw new Error("Email already exists");
  }

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // create new user

  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      username: username,
    },
    omit: { password: true },
    // or
    // select: {
    //   id: true,
    //   email: true,
    //   username: true,
    //   createdAt: true,
    // },
  });

  // create user session

  const { refreshToken, refreshTokenHash, accessToken, csrfToken } =
    await generateTokens(newUser.id);

  const newSession = await session.create(
    refreshTokenHash,
    newUser.id,
    userAgent,
    ip,
  );

  if (!newSession) {
    throw new Error("Unable to Log in");
  }

  await prisma.user.update({
    where: {
      id: newUser.id,
    },
    data: {
      session: {
        connect: {
          id: newSession.id,
        },
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: newUser.id,
      email: newUser.email,
    },
    include: {
      session: true,
    },
  });

  return { user, refreshToken, accessToken, csrfToken };
};

const googleOAuthSignIn = async (
  code,
  state,
  cookiesState,
  cookiesPkce,
  userAgent,
  ip,
) => {
  // 1️⃣ CSRF protection
  if (!state || state !== cookiesState) {
    // return res.redirect("http://localhost:3000/auth/error?reason=csrf");
    throw new Error("CSRF Attack suspected");
  }

  console.log(process.env.GOOGLE_CLIENT_ID);

  // console.log(credential);

  try {
    // / 2️⃣ Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        code_verifier: cookiesPkce,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokens.id_token) {
      throw new Error("No id_token returned");
    }

    // 3️⃣ Verify ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub, email_verified } = payload;

    console.log("google payload:", payload);

    // find if the user email already exist

    const userExisted = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userExisted) {
      throw new Error("Email already registered");
    }

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        emailVerified: email_verified,
        googleId: sub,
      },
    });

    // create user session

    const { refreshToken, refreshTokenHash, accessToken, csrfToken } =
      await generateTokens(newUser.id);

    const newSession = await session.create(
      refreshTokenHash,
      newUser.id,
      userAgent,
      ip,
    );

    if (!newSession) {
      throw new Error("Unable to Log in");
    }

    await prisma.user.update({
      where: {
        id: newUser.id,
      },
      data: {
        session: {
          connect: {
            id: newSession.id,
          },
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        id: newUser.id,
        email: newUser.email,
      },
      include: {
        session: true,
      },
    });

    return { user, refreshToken, accessToken, csrfToken };
  } catch (error) {
    throw new Error(error);
  }
};

// Google Sign-in

const googleSignIn = async (credential, userAgent, ip) => {
  if (!credential) {
    throw new Error("Google ID not provider");
  }

  console.log(process.env.GOOGLE_CLIENT_ID);

  console.log(credential);

  try {
    // verify the credential

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub, email_verified } = payload;

    console.log("google payload:", payload);

    // find if the user email already exist

    const userExisted = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (userExisted) {
      throw new Error("Email already registered");
    }

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        emailVerified: email_verified,
        googleId: sub,
      },
    });

    // create user session

    const { refreshToken, refreshTokenHash, accessToken, csrfToken } =
      await generateTokens(newUser.id);

    const newSession = await session.create(
      refreshTokenHash,
      newUser.id,
      userAgent,
      ip,
    );

    if (!newSession) {
      throw new Error("Unable to Log in");
    }

    await prisma.user.update({
      where: {
        id: newUser.id,
      },
      data: {
        session: {
          connect: {
            id: newSession.id,
          },
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: {
        id: newUser.id,
        email: newUser.email,
      },
      include: {
        session: true,
      },
    });

    return { user, refreshToken, accessToken, csrfToken };
  } catch (error) {
    throw new Error(error);
  }
};

const loginUser = async ({ email, password }, userAgent, ip) => {
  if (!email || !password) {
    throw new Error("All fields are required");
  }
  // check if the user is in the database

  const User = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!User) {
    throw new Error("Invalid email or password");
  }

  // check password

  const isPasswordMatch = await bcrypt.compare(password, User.password);

  if (!isPasswordMatch) {
    throw new Error("Invalid email or password");
  }

  const { refreshToken, refreshTokenHash, accessToken, csrfToken } =
    await generateTokens(User.id);

  console.log("unhash refresh token:", refreshToken);

  console.log("hashService:", refreshTokenHash);

  const newSession = await session.create(
    refreshTokenHash,
    User.id,
    userAgent,
    ip,
  );

  if (!newSession) {
    throw new Error("Unable to Log in");
  }

  const user = await prisma.user.findUnique({
    where: { email: email },
    include: { session: true },
  });

  console.log(newSession);
  // or
  return {
    user,
    accessToken,
    refreshToken,
    csrfToken,
  };
};

export { registerUser, loginUser, googleSignIn, googleOAuthSignIn };
