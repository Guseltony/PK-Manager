// /register
//   / login
//   / logout
// /me

import express from "express";
import { login, logout, register } from "../controllers/authControllers.js";
import { loginSchema, registerUserSchema } from "../validators/auth.schema.js";
import { validateRequest } from "../middlewares/zodValidation.js";
import { deleteAllUser } from "../services/admin.services.js";
import { refresh } from "../controllers/auth/tokenRefresh.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const authRoute = express.Router();

authRoute.post(
  "/register",
  validateRequest(registerUserSchema, "body"),
  register
);

authRoute.post("/login", validateRequest(loginSchema, "body"), login);

authRoute.post("/refresh", authMiddleware, refresh);
    
authRoute.post("/logout", logout);

authRoute.get("/", deleteAllUser);

export { authRoute };
