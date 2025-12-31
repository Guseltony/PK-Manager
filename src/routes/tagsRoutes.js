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

const tagRoutes = express.Router();

tagRoutes.post("/create", createTag);
tagRoutes.put("/update/:id", updateTag);
tagRoutes.get("/get", allTag);
tagRoutes.get("/get/:id", aTag);
tagRoutes.delete("/delete/:id", deleteTag);
tagRoutes.post("/note/:id/tag", tagToNote);
tagRoutes.delete("/all/delete", deleteAllTags);


export default tagRoutes
