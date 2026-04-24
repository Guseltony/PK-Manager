import jwt from "jsonwebtoken";
import { env } from "../validators/env.schema.js";
import { prisma } from "../libs/prisma.js";

export const authMiddleware = async (req, res, next) => {
  try {
    console.log(`AUTH_DEBUG: [${req.method}] ${req.path}`);
    console.log("AUTH_DEBUG: Cookies keys:", Object.keys(req.cookies || {}));
    console.log("AUTH_DEBUG: AccessToken cookie:", !!req.cookies?.accessToken);
    console.log("AUTH_DEBUG: Auth Header:", !!req.headers.authorization);

    let token = req.headers.authorization?.startsWith("Bearer ") 
      ? req.headers.authorization.split(" ")[1] 
      : req.cookies?.accessToken;

    if (!token) {
      console.warn("AUTH_DEBUG: Token missing from both header and cookies");
      return res.status(401).json({
        error: "Unauthorized: token missing",
      });
    }

    console.log("AUTH_DEBUG: Token found, verifying...");

    // decode the token to get the user

    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({
        error: "Invalid Token",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      omit: { password: true },
    });

    console.log("user from DB:", user);

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized: User not found",
      });
    }

    // attach the user to the req
    req.user = user;

    console.log("req.user:", req.user);

    next();
  } catch (error) {
    console.error("AUTH_ERROR:", error);
    return res.status(401).json({
      error: "Unauthorized: invalid or expired token",
      details: error.message,
    });
  }
};
