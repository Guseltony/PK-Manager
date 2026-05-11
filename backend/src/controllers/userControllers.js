import { getAllUser, getUser, updateUser, getUserStats } from "../services/user.service.js";

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

export const updateUserController = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name, username, avatar, email } = req.body;

    const data = await updateUser(user_id, {
      ...(Object.prototype.hasOwnProperty.call(req.body, "name") && { name }),
      ...(Object.prototype.hasOwnProperty.call(req.body, "username") && {
        username: username || null,
      }),
      ...(Object.prototype.hasOwnProperty.call(req.body, "avatar") && {
        avatar: avatar || null,
      }),
      ...(Object.prototype.hasOwnProperty.call(req.body, "email") && { email }),
    });

    res.status(200).json({
      message: "User successfully updated",
      data,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

export const getUserStatsController = async (req, res) => {
  try {
    const user_id = req.user.id;

    const data = await getUserStats(user_id);

    res.status(200).json({
      message: "User stats successfully fetched",
      data,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
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
