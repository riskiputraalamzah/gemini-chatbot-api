import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-2.5-flash";

function extractText(resp) {
  try {
    return (
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.response?.candidates?.[0]?.content?.text ??
      JSON.stringify(resp, null, 2)
    );
  } catch (error) {
    console.log("Error extracting text : ", error);
    return JSON.stringify(resp, null, 2);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) throw new Error("messages must be an array");
    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));
    const resp = await ai.models.generateContent({ model, contents });

    return res.status(200).json({ result: extractText(resp) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
