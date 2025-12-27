// /notes === create notes
//   / notes === get all user notes
//   / notes /: id === get single notes
//   / notes /:id update note(put)
//   / notes /:id delete note
// notes/:id/archive archive/unarchive note (patch)

import express from "express";
import {
  allUserNote,
  createNote,
  getSingleNote,
} from "../controllers/noteControllers.js";

const noteRoutes = express.Router();

noteRoutes.post("/createNote", createNote);
noteRoutes.get("/getNotes", allUserNote);
noteRoutes.get("/:id", getSingleNote);

export default noteRoutes;
