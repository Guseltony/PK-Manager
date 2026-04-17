import express from "express";
import * as ideaControllers from "../controllers/ideaControllers.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.use(protect); // All idea routes require authentication

router.post("/create", ideaControllers.createIdea);
router.get("/all", ideaControllers.allUserIdeas);
router.put("/update/:id", ideaControllers.updateIdea);
router.delete("/delete/:id", ideaControllers.deleteIdea);
router.post("/convert/:id", ideaControllers.convertIdea);

export default router;
