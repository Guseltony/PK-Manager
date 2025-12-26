import jwt from "jsonwebtoken";
import { env } from "../validators/env.schema.js";
import { prisma } from "../libs/prisma.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2️⃣ Or from cookies
    if (!token && req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: token missing",
      });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 4️⃣ Fetch user (WITHOUT password)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized: user not found",
      });
    }

    // 5️⃣ Attach safe user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized: invalid or expired token",
    });
  }
};

// import jwt from "jsonwebtoken";
// import { env } from "../validators/env.schema.js";
// import { prisma } from "../libs/prisma.js";

// export const authMiddleWare = async (req, res, next) => {
//   // get token from req.header
//   let token;

//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     res.status(400).json({
//       error: "Token not provider",
//     });
//   }

//   token = authHeader.split(" ")[1];

//   if (req.cookie?.jwt) {
//     token = req.cookie.jwt;
//   }

//   // verify the token
//   const decoded = jwt.verify(token, env.JWT_SECRET);

//   const user = await prisma.user.findUnique({
//     where: {id: decoded.id}
//   })

//   if (!user) {
//     res.status(400).json({
//       error: "unauthorized, access denied"
//     })
//   }

//   // set user to the req

//   req.user = user

//   next()
// };
