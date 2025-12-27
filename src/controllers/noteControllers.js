import {
  getNote,
  getUserNotes,
  noteCreation,
} from "../services/note.service.js";

export const createNote = async (req, res) => {
  try {
    const note = await noteCreation(req.body, req.user.id);

    if (note) {
      res.status(200).json({
        note,
      });
    }
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const getSingleNote = async (req, res) => {
  try {
    const data = await getNote(req.params.id, req.user.id);

    console.log(req.params.id, req.user.id);

    if (data) {
      res.status(200).json({
        data,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const allUserNote = async (req, res) => {
  try {
    const data = await getUserNotes(req.user.id);

    const dataLength = data.length;

    if (data) {
      res.status(200).json({
        dataLength,
        data,
      });
    }
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};
