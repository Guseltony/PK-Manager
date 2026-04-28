import {
  deleteAllUserNotes,
  deleteUserNote,
  getNote,
  getNoteHistory,
  getUserNotes,
  noteCreation,
  removeTagFromNote,
  restoreNoteVersion,
  tagNote,
  updateUserNote,
} from "../services/note.service.js";

export const createNote = async (req, res) => {
  try {
    const note = await noteCreation(req.body, req.user.id);

    if (note) {
      res.status(200).json({
        data: note,
      });
    }
  } catch (error) {
    console.error("createNote error:", error);
    res.status(400).json({
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
    console.error("getSingleNote error:", error);
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
    console.error("allUserNote error:", error);
    res.status(400).json({
      error: error.message,
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { title, content, contentType, tagsArray, dreamId } = req.body;
    const data = await updateUserNote(
      { title, content, contentType, tagsArray, dreamId },
      req.params.id,
      req.user.id,
    );

    if (data) {
      res.status(200).json({
        message: "Note updated successfully",
        data,
      });
    }
  } catch (error) {
    console.error("updateNote error:", error);
    res.status(400).json({
      error: error.message,
    });
  }
};

export const noteHistory = async (req, res) => {
  try {
    const data = await getNoteHistory(req.params.id, req.user.id);
    res.status(200).json({ data });
  } catch (error) {
    console.error("noteHistory error:", error);
    res.status(400).json({
      error: error.message,
    });
  }
};

export const restoreHistoryVersion = async (req, res) => {
  try {
    const data = await restoreNoteVersion(
      req.params.id,
      req.params.versionId,
      req.user.id,
    );
    res.status(200).json({
      message: "Note restored successfully",
      data,
    });
  } catch (error) {
    console.error("restoreHistoryVersion error:", error);
    res.status(400).json({
      error: error.message,
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    await deleteUserNote(req.params.id, req.user.id);

    res.status(200).json({
      message: "deleted successfully",
    });
  } catch (error) {
    console.error("deleteNote error:", error);
    res.status(400).json({
      error: error.message,
    });
  }
};

export const deleteAllNotes = async (req, res) => {
  try {
    const data = await deleteAllUserNotes(req.user.id);

    if (data) {
      res.status(200).json({
        message: "successfully deleted",
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error.messgae,
    });
  }
};

export const tagRemoveFromNote = async (req, res) => {
  try {
    const data = await removeTagFromNote(req.body, req.params.id, req.user.id);

    if (data) {
      res.status(200).json({
        message: "Tag remove from note successfully",
        data,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error.messgae,
    });
  }
};

export const getNotesWithTagName = async (req, res) => {
  try {
    const data = await tagNote(req.body.name, req.user.id);

    if (data) {
      res.status(200).json({
        message: `Successfully filter oute note with tag name ${req.body.name}`,
        data,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error.messgae,
    });
  }
};
