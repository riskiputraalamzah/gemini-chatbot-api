import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "../public")));

// Routes
import chatRoute from "./chat.js";
app.use("/api/chat", chatRoute);

// Dual mode: Local vs Vercel
const port = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(port, () =>
    console.log(`Server running locally at http://localhost:${port}`)
  );
}

export default app;
