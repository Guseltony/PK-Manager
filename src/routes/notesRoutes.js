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
import {
  createNoteSchema,
  updateNoteSchema,
} from "../validators/note.schema.js";
import { idParamSchema } from "../validators/idParams.schema.js";

const noteRoutes = express.Router();

noteRoutes.post("/create", validateRequest(createNoteSchema), createNote);

noteRoutes.get("/get", allUserNote);

noteRoutes.get(
  "/get/:id",
  validateRequest(idParamSchema, "params"),
  getSingleNote
);

noteRoutes.put(
  "/update/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(updateNoteSchema, "body"),
  updateNote
);

noteRoutes.delete(
  "/delete/:id",
  validateRequest(idParamSchema, "params"),
  deleteNote
);

noteRoutes.delete("/all/delete", deleteAllNotes);

noteRoutes.post(
  "/removetag/:id/tag",
  validateRequest(idParamSchema, "params"),
  tagRemoveFromNote
);

noteRoutes.get("/notetag", getNotesWithTagName);


export default noteRoutes;
