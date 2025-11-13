import jwt from "jsonwebtoken";
import userService from "../services/user.service.js";
import spotifyService from "../services/spotify.service.js";

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.userID, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await userService.createUser({ username, email, password, name });
    const token = generateToken(user);

    res.status(201).json({
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await userService.verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);
    const sanitizedUser = userService.sanitizeUser(user);

    res.json({
      message: "Login successful",
      user: sanitizedUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSpotifyAuthUrl = async (req, res) => {
  try {
    const authUrl = spotifyService.getAuthorizeURL();
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const spotifyCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: "Authorization code required" });
    }

    const tokens = await spotifyService.authorizeCode(code);
    // In a real app, you'd store these tokens in the database associated with the user
    res.json({
      message: "Spotify authorization successful",
      tokens,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

