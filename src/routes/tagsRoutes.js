// /tags
//   / tags
//   / tags /: id
// tags/:id
// create tag
// delete
// update
// get all tag
// assign tag to note
// remove tag from note 

import express from "express";
import {
  allTag,
  aTag,
  createTag,
  deleteAllTags,
  deleteTag,
  tagToNote,
  updateTag,
} from "../controllers/tagControllers.js";
import { validateRequest } from "../middlewares/zodValidation.js";
import { createTagSchema, updateTagSchema } from "../validators/tag.schema.js";
import { idParamSchema } from "../validators/idParams.schema.js";

const tagRoutes = express.Router();

tagRoutes.post("/create", validateRequest(createTagSchema), createTag);

tagRoutes.put(
  "/update/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(updateTagSchema, "body"),
  updateTag
);

tagRoutes.get("/get", allTag);

tagRoutes.get("/get/:id", validateRequest(idParamSchema, "params"), aTag);

tagRoutes.delete(
  "/delete/:id",
  validateRequest(idParamSchema, "params"),
  deleteTag
);

tagRoutes.post(
  "/note/:id/tag",
  validateRequest(idParamSchema, "params"),
  tagToNote
);

tagRoutes.delete("/all/delete", deleteAllTags);


export default tagRoutes
