// /register
//   / login
//   / logout
// /me

import express from "express";
import { login, register } from "../controllers/authControllers.js";
import { registerUserSchema } from "../validators/auth.schema.js";
import { validateRequest } from "../middlewares/zodValidation.js";

const authRoute = express.Router();

authRoute.post("/register", validateRequest(registerUserSchema), register);
authRoute.post("/login", login);

export { authRoute };
