import { readonly } from "zod";
import {
  addTagToNote,
  allTagDeletion,
  getAllTag,
  getTag,
  tagCreation,
  tagDeletion,
  tagUpdate,
} from "../services/tag.services.js";

export const createTag = async (req, res) => {
  try {
    const data = await tagCreation(req.body, req.user.id);

    if (data) {
      res.status(200).json({
        message: "tag created successfully",
        data,
      });
    }
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const updateTag = async (req, res) => {
  try {
    const data = await tagUpdate(req.body, req.params.id, req.user.id);

    if (data) {
      res.status(200).json({
        message: "tag updated successfully",
        data,
      });
    }
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const allTag = async (req, res) => {
  try {
    const data = await getAllTag(req.user.id);

    if (data) {
      res.status(200).json({
        message: "success, all user tag collected",
        quantity: data.length,
        data,
      });
    }
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const aTag = async (req, res) => {
  try {
    const data = await getTag(req.params.id, req.user.id);

    if (data) {
      res.status(200).json({
        message: "success, tag fetched!",
        data,
      });
    }
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const data = await tagDeletion(req.params.id, req.user.id);

    if (data) {
      res.status(200).json({
        message: "deleted successfully",
      });
    }
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

export const deleteAllTags = async (req, res) => {
  try {
    const data = await allTagDeletion(req.user.id);

    if (data) {
      res.status(200).json({
        message: "deleted successfully",
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const tagToNote = async (req, res) => {
  try {
    const data = await addTagToNote(req.body, req.params.id, req.user.id);

    if (data) {
      res.status(200).json({
        message: "Note-Tag linked successfully",
        data,
      });
    }
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};
