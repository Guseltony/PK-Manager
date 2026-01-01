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
  tagRemoveFromNote,
  getNotesWithTagName,
} from "../controllers/noteControllers.js";
import { validateRequest } from "../middlewares/zodValidation.js";
import { createNoteSchema } from "../validators/note.schema.js";

const noteRoutes = express.Router();

noteRoutes.post("/create", validateRequest(createNoteSchema), createNote);
noteRoutes.get("/get", allUserNote);
noteRoutes.get("/get/:id", getSingleNote);
noteRoutes.put("/update/:id", updateNote);
noteRoutes.delete("/delete/:id", deleteNote);
noteRoutes.delete("/all/delete", deleteAllNotes);
noteRoutes.post("/removetag/:id/tag", tagRemoveFromNote);
noteRoutes.get("/notetag", getNotesWithTagName);


export default noteRoutes;
