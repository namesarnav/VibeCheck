import express from "express";
import { Router } from "express";

import dotenv from "dotenv";

const app = express();
const router = Router();

dotenv.config();

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.use(express.json());