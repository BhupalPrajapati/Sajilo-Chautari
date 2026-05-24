# Sajilo Chautari • सजिलो चौतारी 🇳🇵
### AI-Powered Multilingual Speech Translation Bridge for Rural Nepal

Sajilo Chautari ("Easy Meeting Spot") is a production-ready, full-stack speech translation application designed to bridge the communication gap between global travelers/foreign specialists and rural Nepalese villagers. It operates out-of-the-box in regions with low connectivity, catering to elderly, illiterate, or offline populations through micro-audio compression and zero-overhead local speech synthesis.

---

## 🚀 Key Features

* **Multilingual Input & Dynamic Detection**: Translates spoken speech in major foreign languages (English, Spanish, Chinese, Hindi, Arabic, French) to Nepali.
* **Smart Bidirectional Processing**: Toggles between Foreigner-to-Nepali and Nepali-to-Foreigner translation cards instantly.
* **Low Latency Combined Inferences**: Sends compressed `.webm` audio blocks to the backend which performs STT, Language Detection, and Translation in a single LLM inference cycle via **Gemini 3.5**.
* **Zero-Bandwidth Text-To-Speech (TTS)**: Leverages browser-side `SpeechSynthesis` Web APIs natively, making audio playbacks absolutely costless ($0 database or server egress) with zero network overhead. Offers high-quality server-side voice amplification as an optional toggle.
* **Offline Caching & Local Logs**: Preserves historic translations in `localStorage` for complete offline reference on trekking trails.

---

## 🛠 Tech Stack & Architecture Specs

### Frontend:
* **React 19 & Vite**: Ultra-fast hot-reloading SPA with responsive interactive components.
* **Tailwind CSS & Outfit/Inter Typography**: Custom tailored styling with friendly responsive buttons designed for rugged environment touch targets (>44px).
* **MediaRecorder API**: Real-time microphone audio capture with optimized sample rates (16KHz mono) to reduce data payloads.

### Production Backend (Python FastAPI Version):
Sajilo Chautari includes a ready-to-run FastAPI Python setup in `src/components/ArchitectureDocs.tsx` or `main.py` mimicking the Node Express core logic:
* **FastAPI**: Async core routing to scale concurrent audio streams.
* **Multer / Multipart-Form**: Standard audio binary uploads.
* **OpenAI Whisper / Gemini API integration**: Direct stream-to-base64 parser.

---

## 📂 Project Structure

```
├── /src
│   ├── /components
│   │   ├── LandingHero.tsx       # Landing page introductory module
│   │   ├── TranslatorCard.tsx    # Recording, translation console, log dashboard
│   │   ├── InstructionsGuide.tsx # Bilingual accessibility guide for villagers
│   │   └── ArchitectureDocs.tsx  # Developer specifications, docker, & optimizations
│   ├── types.ts                  # Shared typescript enums and structures
│   ├── index.css                 # Custom Google Fonts, color themes, pulse animations
│   ├── App.tsx                   # Central router & Express connection layer
│   └── main.tsx                  # Client entry point
├── server.ts                     # Full-stack integrated Node.js Express server
├── package.json                  # Dependencies tracker
├── Dockerfile                    # Multi-stage production alpine container configuration
└── tsconfig.json                 # Strict typescript configurations
```

---

## 🔧 Local Development & Setup Instructions

To launch the integrated Node.js + Express Fullstack platform:

### 1. Configure Secrets
Create an `.env` file at the root:
```env
GEMINI_API_KEY="your_api_key_here"
NODE_ENV="development"
PORT=3000
```

### 2. Install Packages
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to test speech recordings.

### 4. Build and Start Production CJS Server
```bash
npm run build
npm run start
```

---

## 🐳 Docker Deployment

To package the service in an isolated minimal lightweight container:

```bash
# Build the Docker image
docker build -t sajilo-chautari .

# Run the container
docker run -p 3000:3000 --env-file .env sajilo-chautari
```

---

## 💰 Cost Optimization & Rural Scaling Strategies

1. **Free Speech Synthesis**: Device-level `window.speechSynthesis` translates Nepali audio without single-byte data transmission to servers, avoiding recurring compute billing.
2. **5-Sec Audio Gate**: Imposes automatic record triggers. Restricting audio capture size to speech frequencies keeps data packets under 200KB.
3. **Unified Single-Cycle Requests**: Compresses STT, Translation, and metadata responses into one single JSON API response, dramatically boosting satellite internet responsiveness in remote Nepalese villages.
