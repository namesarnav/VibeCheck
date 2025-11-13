import User from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

class UserService {
  async createUser(userData) {
    try {
      const { username, email, password, name } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        throw new Error("User with this email or username already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = new User({
        username,
        email,
        password: hashedPassword,
        name,
        userID: uuidv4(),
      });

      await user.save();
      return this.sanitizeUser(user);
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findOne({ userID: userId });
      if (!user) {
        throw new Error("User not found");
      }
      return this.sanitizeUser(user);
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      const user = await User.findOne({ username });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await User.findOneAndUpdate(
        { userID: userId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw error;
    }
  }

  async verifyPassword(user, password) {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      throw new Error("Password verification failed");
    }
  }

  sanitizeUser(user) {
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }
}

export default new UserService();

