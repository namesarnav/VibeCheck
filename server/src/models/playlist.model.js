import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const Playlist = new mongoose.Schema({
    title:          { type: String, required: true },
    description:    { type: String, required: false },
    tracks:         { type: [String], default: [] }, // Array of track IDs
    createdBy:      { type: String, required: true }, // User ID of the creator
    createdAt:      { type: Date, default: Date.now },
    updatedAt:      { type: Date, default: Date.now },
    playlistID:     { type: String, required: true, unique: true },
});

export default mongoose.model("Playlist", Playlist);
