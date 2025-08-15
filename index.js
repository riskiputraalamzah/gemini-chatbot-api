import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const model = "gemini-2.5-flash";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function extractText(resp) {
  try {
    return (
      // Coba ambil dari jalur 1
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      // Kalau gagal, coba jalur 2
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
      // Kalau gagal, coba jalur 3
      resp?.response?.candidates?.[0]?.content?.text ??
      // Kalau semua gagal, ubah seluruh resp jadi string JSON
      JSON.stringify(resp, null, 2)
    );
  } catch (error) {
    console.log("Error extracting text : ", error);
    return JSON.stringify(res, null, 2);
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) throw new Error("messages must be an array");
    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));
    const resp = await ai.models.generateContent({
      model,
      contents,
    });

    res.json({ result: extractText(resp) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = 3000;
app.listen(port, () => console.log(`Server ready on http://localhost:${port}`));
