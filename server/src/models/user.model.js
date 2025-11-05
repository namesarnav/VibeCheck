import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const User = new mongoose.Schema({
    username:   { type: String, required: true, unique: true },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, required: true },
    name:       { type: String, required: true },
    createdAt:  { type: Date, default: Date.now },
    updatedAt:  { type: Date, default: Date.now },
    userID:     { type: String, required: true, unique: true, primaryKey: true },
});

export default mongoose.model("User", User);