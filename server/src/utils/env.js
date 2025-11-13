import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory (two levels up from src/utils/)
export function loadEnv() {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

