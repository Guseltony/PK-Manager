import jwt from "jsonwebtoken";
import { env } from "../validators/env.schema.js";
import { prisma } from "../libs/prisma.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token;
    // get the token

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // if the token is in the cookies

    if (!token && req.cookie?.jwt) {
      token = req.cookie.jwt;
    }

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: token missing",
      });
    }

    // decode the token to get the user

    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      omit: { password: true },
    });

    console.log(user);

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: User not found",
      });
    }

    // attach the user to the req
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized: invalid or expired token",
    });
  }
};