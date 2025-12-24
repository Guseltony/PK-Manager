// /register
//   / login
//   / logout
// /me

import express from "express";
import { register } from "../controllers/authControllers.js";

const authRoute = express.Router();

authRoute.post("/register", register);

export { authRoute };
