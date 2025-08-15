import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Inisialisasi AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

// Fungsi untuk ambil teks dari response
function extractText(resp) {
  try {
    return (
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.response?.candidates?.[0]?.content?.text ??
      JSON.stringify(resp, null, 2)
    );
  } catch (error) {
    console.log("Error extracting text:", error);
    return JSON.stringify(resp, null, 2);
  }
}

// Endpoint POST /api/chat
router.post("/", async (req, res) => {
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

export default router;
