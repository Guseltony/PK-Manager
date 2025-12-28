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
  createTag,
  deleteTag,
  updateTag,
} from "../controllers/tagControllers.js";

const tagRoutes = express.Router();

tagRoutes.post("/create", createTag);
tagRoutes.put("/update/:id", updateTag);
tagRoutes.get("/all", allTag);
tagRoutes.delete("/delete/:id", deleteTag);


export default tagRoutes
