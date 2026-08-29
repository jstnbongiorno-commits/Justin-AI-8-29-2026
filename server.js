import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function askGemini(message) {
  const models = [
    "gemini-3.7-flash",
    "gemini-3.6-flash"
  ];

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`Trying ${model}, attempt ${attempt + 1}`);

        const response = await ai.models.generateContent({
          model: model,
          contents: message,
          config: {
            systemInstruction:
              "You are Justin AI, an AI version of Justin. " +
              "Speak naturally, casually and warmly. " +
              "Keep responses fairly short because this is a voice conversation."
          }
        });

        return response.text;

      } catch (error) {
        console.error(`${model} failed:`, error.message);

        // Retry temporary Google server errors
        if (
          error.message.includes("503") ||
          error.message.includes("UNAVAILABLE")
        ) {
          const delay = 2000 * Math.pow(2, attempt);
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }
  }

  throw new Error("Gemini models are temporarily unavailable.");
}

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({
        error: "No message provided"
      });
    }

    const reply = await askGemini(userMessage);

    res.json({
      reply: reply
    });

  } catch (error) {
    console.error("FINAL GEMINI ERROR:", error);

    res.status(503).json({
      error: "Google AI is temporarily overloaded. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Justin AI running on port ${PORT}`);
});
