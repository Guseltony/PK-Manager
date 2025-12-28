import { readonly } from "zod";
import {
  getAllTag,
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
