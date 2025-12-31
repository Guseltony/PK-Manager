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
  deleteNote,
  updateNote,
  deleteAllNotes,
} from "../controllers/noteControllers.js";

const noteRoutes = express.Router();

noteRoutes.post("/create", createNote);
noteRoutes.get("/get", allUserNote);
noteRoutes.get("/get/:id", getSingleNote);
noteRoutes.put("/update/:id", updateNote);
noteRoutes.delete("/delete/:id", deleteNote);
noteRoutes.delete("/all/delete", deleteAllNotes);


export default noteRoutes;
