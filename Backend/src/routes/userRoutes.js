import express from "express";
import {
  getAllUserController,
  getUserController,
} from "../controllers/userControllers.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { csrfMiddleware } from "../middlewares/csrfMiddleware.js";

const userRoutes = express.Router();

userRoutes.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }
  return csrfMiddleware(req, res, next);
});

userRoutes.get("/get", authMiddleware, getUserController);
userRoutes.get("/getAll", getAllUserController);

export default userRoutes;
