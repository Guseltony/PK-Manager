// /register
//   / login
//   / logout
// /me

import express from "express";
import { login, logout, register } from "../controllers/authControllers.js";
import { registerUserSchema } from "../validators/auth.schema.js";
import { validateRequest } from "../middlewares/zodValidation.js";
import { deleteAllUser } from "../services/admin.services.js";

const authRoute = express.Router();

authRoute.post("/register", validateRequest(registerUserSchema), register);
authRoute.post("/login", login);
authRoute.post("/logout", logout);

authRoute.get("/", deleteAllUser);

export { authRoute };
