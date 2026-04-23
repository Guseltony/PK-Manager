import { getAllUser, getUser } from "../services/user.service.js";

export const getUserController = async (req, res) => {
  try {
    const user_id = req.user.id;

    const data = await getUser(user_id);

    if (!data) {
      res.status(403).json({
        nessage: "error fetching user",
      });
    }

    res.status(200).json({
      message: "User successfully fetched",
      data: data,
    });
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};

export const getAllUserController = async (req, res) => {
  try {
    const data = await getAllUser();

    if (!data) {
      res.status(403).json({
        nessage: "error fetching user",
      });
    }

    res.status(200).json({
      message: "All User successfully fetched",
      data,
    });
  } catch (error) {
    res.status(400).json({
      error: error,
    });
  }
};
