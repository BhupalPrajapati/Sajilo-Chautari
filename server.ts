import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

// Ensure Gemini API key is defined
if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI-powered translation will fail.");
}

// Initialize Gemini Client with correct User-Agent for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const app = express();
const PORT = 3000;

// Configure body parsers with limits ( rural/mobile friendliness: protect against huge payloads )
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Configure multer for audio uploads (store in memory (buffer) for instant streaming to Gemini to optimize latency)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit audio file size to 10MB
  },
});

// Simple Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// HEALTH CHECK API
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// BACKEND API Route proxies

/**
 * 1. POST /api/transcribe
 * Accepts an audio file, transcribes it in its original language using Gemini 3.5.
 */
app.post("/api/transcribe", upload.single("audio"), async (req: any, res: any) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "Missing GEMINI_API_KEY. Please configure your API key in settings/secrets to activate this feature."
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Missing audio file in upload" });
    }

    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    const speechPart = {
      inlineData: {
        data: audioBuffer.toString("base64"),
        mimeType: mimeType || "audio/webm",
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        speechPart,
        {
          text: "Transcribe this audio file verbatim in its original language. Keep punctuation natural. Do not translate. Output ONLY the transcription and nothing else.",
        },
      ],
    });

    const text = response.text?.trim() || "";

    return res.json({ text });
  } catch (err: any) {
    console.error("Transcribe API Error:", err);
    return res.status(500).json({ error: err.message || "Failed to transcribe audio" });
  }
});

/**
 * 2. POST /api/translate
 * Translates a source text to Nepali or from Nepali to foreign language.
 */
app.post("/api/translate", async (req: any, res: any) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "Missing GEMINI_API_KEY. Please configure your API key in settings/secrets to activate this feature."
      });
    }

    const { text, direction = "foreign-to-nepali", targetLanguage = "English" } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required for translation" });
    }

    let prompt = "";
    if (direction === "foreign-to-nepali") {
      prompt = `You are an expert bilingual interpreter translating to Nepali. 
Translate the following text into clear, simple, respect-oriented, and natural conversational Nepali that a rural villager in Nepal can easily comprehend. Do not use extremely complex Sanskritized vocabulary. Keep it simple, humble, and polite.
Text to translate: "${text}"
Return ONLY the direct Nepali translation and absolutely no other text.`;
    } else {
      prompt = `You are an expert bilingual interpreter translating from Nepali. 
Translate the following Nepali text into standard, natural, conversational ${targetLanguage} that a foreigner can easily understand.
Nepali Text: "${text}"
Return ONLY the translation in ${targetLanguage} and absolutely no other text.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const translation = response.text?.trim() || "";
    return res.json({ text: translation });
  } catch (err: any) {
    console.error("Translate API Error:", err);
    return res.status(500).json({ error: err.message || "Failed to translate text" });
  }
});

/**
 * 3. POST /api/process-audio
 * Accepts audio, transcribes, detects language, and translates to target language in a single API pass to reduce round-trip latency.
 */
app.post("/api/process-audio", upload.single("audio"), async (req: any, res: any) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "Missing GEMINI_API_KEY. Please configure your API key in settings/secrets to activate this translation pipeline."
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Missing audio file in upload" });
    }

    const direction = req.body.direction || "foreign-to-nepali";
    const targetLanguage = req.body.targetLanguage || "English";
    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    const speechPart = {
      inlineData: {
        data: audioBuffer.toString("base64"),
        mimeType: mimeType || "audio/webm",
      },
    };

    let instruction = "";
    if (direction === "foreign-to-nepali") {
      instruction = `Analyze the spoken audio.
1. Transcribe the verbatims spoken in the audio in its original language.
2. Detect the source language.
3. Translate the spoken text into polite, easy-to-understand, gentle, and conversational Nepali helpful for rural communication. Clean up any speech filler words (like 'um', 'uh', 'like').

Return your answer strictly in JSON matching the specified schema format.`;
    } else {
      instruction = `Analyze the spoken audio which is in Nepali language.
1. Transcribe the exact words spoken in Nepali.
2. Translate the spoken text into clear, simple, natural conversational ${targetLanguage} for a foreigner. Clean up speech fillers.

Return your answer strictly in JSON matching the specified schema format.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [speechPart, { text: instruction }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcribedText: {
              type: Type.STRING,
              description: "The verbatim clean text transcription of speakers in the audio input",
            },
            translatedText: {
              type: Type.STRING,
              description: "The direct, natural translation into the destination language",
            },
            detectedLanguage: {
              type: Type.STRING,
              description: "The name of the detected spoken source language",
            },
          },
          required: ["transcribedText", "translatedText", "detectedLanguage"],
        },
      },
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    return res.json(result);
  } catch (err: any) {
    console.error("Process Audio API Error:", err);
    return res.status(500).json({ error: err.message || "Failed to process audio" });
  }
});

/**
 * 4. POST /api/tts
 * Generates an audio representation of text to speak aloud in Nepali or target language using gemini-3.1-flash-tts-preview if possible.
 */
app.post("/api/tts", async (req: any, res: any) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({
        error: "Missing GEMINI_API_KEY. Please configure your API key in settings/secrets to activate server-side Nepal text speech synthesis."
      });
    }

    const { text, voice = "Kore" } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required for TTS synthesis" });
    }

    // Call high quality speech generation
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Read this text aloud with clean, pleasant pronunciation: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // 'Kore', 'Charon', 'Puck', 'Fenrir', 'Zephyr'
          },
        },
      },
    });

    const inlinePart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    const base64Audio = inlinePart?.data;
    const mimeType = inlinePart?.mimeType || "audio/wav";

    if (!base64Audio) {
      throw new Error("No synthesized audio returned from Gemini Speech API");
    }

    return res.json({ audio: base64Audio, mimeType: mimeType });
  } catch (err: any) {
    console.error("TTS API Error (Falling back to client-side synthesis):", err);
    const errString = String(err.message || "").toLowerCase();
    const isQuotaExceeded = 
      err.status === 429 || 
      err.statusCode === 429 ||
      errString.includes("429") || 
      errString.includes("quota") || 
      errString.includes("exhausted");
      
    if (isQuotaExceeded) {
      return res.status(429).json({
        error: "Gemini Speech synthesis daily limit reached (10 free requests per day limit of the free tier). Sajilo has automatically enabled offline local device-synthesis for uninterrupted voice support.",
        code: "QUOTA_EXCEEDED"
      });
    }
    return res.status(500).json({ error: err.message || "Failed to generate audio" });
  }
});

// JSON error handling middleware for all API routes (prevents Express from returning default HTML error pages)
app.use("/api", (err: any, req: any, res: any, next: any) => {
  console.error("[API Pipeline Error]:", err);
  return res.status(err.status || err.statusCode || 500).json({
    error: err.message || "Audio translation pipeline failure inside Sajilo Chautari."
  });
});

// Global error handler for uncaught express errors
app.use((err: any, req: any, res: any, next: any) => {
  console.error("[Global Server Error]:", err);
  return res.status(err.status || err.statusCode || 500).json({
    error: err.message || "An unexpected error occurred in the server wrapper."
  });
});

// Mount Vite middleware for development or serve built client static assets for production
async function runServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Guard: Do not fall back to index.html for static assets (helps debuggers/crawlers detect missing files correctly)
    app.get("*", (req, res, next) => {
      const ext = path.extname(req.path);
      if (ext && ext !== ".html") {
        return res.status(404).send("Not Found");
      }
      next();
    });

    // Serve client static assets
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nepali Translation Service running on port ${PORT}`);
    console.log(`Local Access: http://localhost:${PORT}`);
  });
}

runServer().catch((error) => {
  console.error("Critical server failure on boot:", error);
});
