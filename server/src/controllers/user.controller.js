import userService from "../services/user.service.js";

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    res.json({ user });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Don't allow password updates through this endpoint
    delete updateData.password;
    delete updateData.userID;

    const user = await userService.updateUser(userId, updateData);
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    res.json({ user });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

