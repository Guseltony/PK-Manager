import jwt from "jsonwebtoken";
import { env } from "../validators/env.schema.js";
import { prisma } from "../libs/prisma.js";

export const authMiddleWare = async (req, res, next) => {
  // get token from req.header
  let token;

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(400).json({
      error: "Token not provider",
    });
  }

  token = authHeader.split(" ")[1];

  if (req.cookie?.jwt) {
    token = req.cookie.jwt;
  }

  // verify the token
  const decoded = jwt.verify(token, env.JWT_SECRET);

  const user = await prisma.user.findUnique({
    where: {id: decoded.id}
  })

  if (!user) {
    res.status(400).json({
      error: "unauthorized, access denied"
    })
  }

  // set user to the req

  req.user = user

  next()
};
