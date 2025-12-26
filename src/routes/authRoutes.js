// /register
//   / login
//   / logout
// /me

import express from "express";
import { login, register } from "../controllers/authControllers.js";
import { registerUserSchema } from "../validators/auth.schema.js";
import { validateRequest } from "../middlewares/zodValidation.js";
import { deleteAllUser } from "../services/admin.services.js";
import { authMiddleWare } from "../middlewares/authMiddleware.js";

const authRoute = express.Router();

authRoute.post("/register", validateRequest(registerUserSchema), register);
authRoute.post("/login", authMiddleWare, login);

authRoute.get("/", deleteAllUser);

export { authRoute };
