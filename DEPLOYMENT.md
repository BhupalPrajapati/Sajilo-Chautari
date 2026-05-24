# Sajilo Chautari • सजिलो चौतारी 🇳🇵
## Deployment Guide: How to Deploy the Full-Stack Speech Translation App for Free

Sajilo Chautari is a full-stack web application with a **TypeScript React frontend** and an **Express.js backend**. 

Because this application relies on a backend Express server to:
1. Accept and parse audio files with multer.
2. Route secure requests to the **Gemini API** using `process.env.GEMINI_API_KEY` (safely hidden from visitors).
3. Synthesize premium spoken translations.

To deploy it successfully, you need to use a hosting method that supports full-stack applications. If you deploy it purely as a static site (e.g. on standard Vercel or Netlify without serverless function handlers), your frontend won't find the `/api/*` endpoints. Instead, the router fallbacks will serve the home page (`index.html`), resulting in the error:
`Translation Pipeline error: Unexpected token '<', "<!doctype "... is not valid JSON`

Below are the easiest and completely active free options to deploy Sajilo Chautari.

---

## 🌟 Option A: Persistent Free Node.js Hosting (Recommended)
These platforms run our Express backend (`server.ts` / `dist/server.cjs`) persistently as a standard Node.js server. **No code modifications or special rewrites are required!**

### 1. Koyeb (100% Free Tier, Highly Recommended)
Koyeb provides true persistent container microservices for free with auto-deployment from GitHub and built-in global CDN.

1. **Push your code to a GitHub repository.**
2. Sign up on [Koyeb.com](https://www.koyeb.com) and create a new **App**.
3. Select **GitHub** as the deployment source and choose your repository.
4. Koyeb automatically reads the `Dockerfile` inside our project. It configuration is fully production-configured!
5. In the **Environment Variables** section, add your secret key:
   - `GEMINI_API_KEY`: `your_real_gemini_api_key_here`
6. Click **Deploy**. Within 2 minutes, your persistent full-stack translation station is up and running!

---

### 2. Render (Free Web Service Tier)
Render offers a very popular free tier that hosts web services automatically on git push.

1. **Push your code to a GitHub repository.**
2. Register for free at [Render.com](https://render.com).
3. Click **New +** ➜ **Web Service**.
4. Connect your GitHub repository.
5. Configure the following build & run properties:
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start` (this runs `node dist/server.cjs` compiled using modern esbuild)
6. Scroll down to **Environment Variables** and define:
   - `GEMINI_API_KEY` = `your_real_gemini_api_key`
   - `NODE_ENV` = `production`
7. Click **Create Web Service**. Your app is live!
   *(Note: On Render's free tier, servers go to sleep after 15 minutes of inactivity. The first load may take ~50 seconds to boot up cold.)*

---

### 3. Railway (Free Trial / Developer Tier)
Railway is extremely easy to use and provides high-speed execution.

1. Create a free account at [Railway.app](https://railway.app).
2. Click **New Project** ➜ **Deploy from GitHub repo**.
3. Select this repository.
4. Click **Variables** on the service dashboard, and add:
   - `GEMINI_API_KEY` = `your_real_key_here`
5. In **Settings**, Railway automatically detects the custom start script.
6. Generate a Domain in the project dashboard and access your app!

---

## ⚡ Option B: Vercel Serverless Function Deployment
If you explicitly prefer to host on **Vercel** for free, you must tell Vercel to route any `/api/*` requests to dynamic Serverless Functions so it doesn't return HTML blocks.

Here is the exact setup to deploy on Vercel:

### 1. Add a `/vercel.json` to the project root
Create a file named `vercel.json` in the root of your directory with this content:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/$1.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 2. Create the `/api/` Serverless handlers
To match this architecture, place your server-side operations (transcribe, translate, process-audio, tts) under a root-level `/api` directory:
- `api/process-audio.ts`
- `api/translate.ts`
- `api/tts.ts`

These handlers will read `process.env.GEMINI_API_KEY` and interact with the `@google/genai` library server-side, returning direct JSON responses.

### 3. Deploy
1. Install Vercel CLI locally (`npm i -g vercel`) or link your GitHub repo directly to the Vercel Dashboard.
2. Add your environment variable `GEMINI_API_KEY` in **Vercel Settings ➜ Environment Variables**.
3. Deploy!

---

## 💸 Saving Money & Scaling Sajilo Chautari for Free

Our application is natively engineered to minimize hosting and API charges:

1. **Verve-level Bandwidth Optimization**: By default, you can click **OFFLINE LIGHT** inside our Speech synthesis toggle. This utilizes the user's actual browser-embedded hardware spoken speech synthesizers (absolutely $0 network costs and works offline!).
2. **Audio Size Limits**: The recorder limits microphone buffer capture to protect you against visitors uploading gigantic video/audio files which degrade server nodes.
3. **Multi-Step Gemini Consolidation**: When translating, the app compresses transcription, language extraction, and localized translation into **one single LLM payload cycle**. This saves 66% of the traditional token budget and ensures smooth operation within free-tier rate limits!
