import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({
        error: "No message provided"
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userMessage,
      config: {
        systemInstruction:
          "You are Justin AI, an AI version of Justin. " +
          "Speak naturally, casually, warmly, and conversationally. " +
          "Keep responses fairly short because this is a voice conversation."
      }
    });

    res.json({
      reply: response.text
    });

  } catch (error) {
    console.error("GEMINI ERROR:", error);

    res.status(500).json({
      error: error.message || "Gemini request failed"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Justin AI running on port ${PORT}`);
});
