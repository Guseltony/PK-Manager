import { readonly } from "zod";
import { tagCreation, tagUpdate } from "../services/tag.services.js";

export const createTag = async (req, res) => {
  try {
    const data = await tagCreation(req.body, req.user.id);

    if (data) {
      res.status(200).json({
        message: "Note created successfully",
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
