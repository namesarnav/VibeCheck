import mongoose  from "mongoose";
import dotenv    from "dotenv";

dotenv.config();

const Chat = new mongoose.Schema({
    participants:  { type: [String], required: true }, // Array of user IDs
    messages:      { type: [{ sender: String, content: String, timestamp: Date }], default: [] },
    createdAt:     { type: Date, default: Date.now },
    updatedAt:     { type: Date, default: Date.now },
    chatID:        { type: String, required: true, unique: true },
});

export default mongoose.model("Chat", Chat);