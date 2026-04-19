# 💊 MediScan — Medicine Label Translator

> I built this PWA to help low-literacy users understand their medicine labels. Point your camera at any medicine bottle, and the app explains the dosage, side effects, and warnings in plain, simple English — then reads it aloud automatically.

🌐 **Live:** https://mediscan-six.vercel.app

---

## 💡 Why I Built This

A lot of people struggle to read medicine labels — whether due to literacy barriers, language gaps, or just the tiny text and medical jargon packed onto every bottle. I wanted to build something that actually helps: scan a label, get a simple explanation, hear it spoken aloud. No sign-up, no complexity.

---

## 🎥 How It Works

1. Tap **Scan a Label** — camera opens
2. Hold your medicine bottle so the label is in the frame
3. Tap the shutter button
4. Wait ~2 seconds — AI reads and translates the label
5. Results appear as simple cards — drug name, dosage, side effects, warnings
6. The app **reads the results aloud automatically** using text-to-speech
7. Tap **Read Aloud** anytime to hear it again

---

## 🛠 What I Used

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| PWA | vite-plugin-pwa (installable, offline shell) |
| Backend | Vercel Serverless Functions (Node.js) |
| AI Vision | Groq API — Llama 4 Scout (vision model) |
| Camera | `getUserMedia` Web API |
| Text-to-Speech | Web Speech API |
| Deployment | Vercel (auto-deploys on every push) |

---

## 📁 Project Structure

```
mediscan/
├── api/
│   └── scan.js              # Serverless function — handles AI vision call
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   │   ├── IdleScreen.tsx       # Welcome screen
│   │   ├── CameraScreen.tsx     # Camera viewfinder with scan frame
│   │   ├── ProcessingScreen.tsx # Loading state
│   │   ├── ResultsScreen.tsx    # Result cards + TTS controls
│   │   └── ErrorScreen.tsx      # Error with retry
│   ├── hooks/
│   │   ├── useCamera.ts         # Camera stream + image capture + resize
│   │   └── useTTS.ts            # Text-to-speech hook
│   ├── styles/
│   │   └── global.css           # Dark theme, glassmorphism, animations
│   ├── App.tsx                  # App state machine
│   ├── main.tsx                 # Entry point
│   └── types.ts                 # Shared types
├── .env.example
├── vercel.json
├── vite.config.ts
└── package.json
```

---

## 🚀 Run It Locally

### Prerequisites
- Node.js 18+
- A free Groq API key from [console.groq.com](https://console.groq.com)

### Setup

```bash
git clone https://github.com/amritanshushaw-cpu/mediscan.git
cd mediscan
npm install
cp .env.example .env
```

Add your Groq key to `.env`:

```env
GROQ_API_KEY=gsk_your_key_here
```

### Run

```bash
npm install -g vercel
vercel dev
```

Visit [http://localhost:3000](http://localhost:3000)

> I use `vercel dev` instead of `npm run dev` because it runs the serverless `api/` functions locally alongside the frontend. Plain Vite won't run the backend.

---

## 🌐 Deploying

I deployed this on Vercel connected to this GitHub repo. Every `git push` auto-deploys.

If you want to deploy your own copy:

1. Fork this repo
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo
3. Add environment variable: `GROQ_API_KEY` = your key
4. Hit Deploy

---

## 🔑 Environment Variables

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — free, no credit card |

---

## 🏗 Architecture

```
Browser                        Vercel
──────────────────────         ──────────────────────────────
📷 Camera opens
   │
   │  capture frame
   │  resize → 1024px max
   │  compress → JPEG 65%
   │
   POST /api/scan ──────────► api/scan.js
   { image: base64 }              │
                                  ├─ check in-memory cache
                                  │
                                  ▼
                              Groq API
                              Llama 4 Scout (vision)
                              reads label + translates
                                  │
                              strict JSON response
                                  │
                                  ├─ cache result
                                  │
◄─────────────────────────────── ScanResult
   │
   ├─ render 4 result cards
   │  (slide-up animation)
   │
   └─ speechSynthesis
      auto-reads aloud
```

**Why one API call?**
I combined OCR and plain-English translation into a single Groq vision call. The model reads the label text AND rewrites it in simple language simultaneously — no separate OCR step needed, faster results.

**Image compression:**
I resize captures to max 1024px and compress to 65% JPEG quality before sending. This keeps the payload under 300KB while keeping label text sharp enough for the AI to read accurately.

---

## ♿ Accessibility Choices

I built this specifically for users who struggle with reading, so accessibility wasn't an afterthought:

- **Atkinson Hyperlegible** font — designed specifically for low-vision readers
- **WCAG AA contrast** throughout (4.5:1 minimum ratio)
- **Minimum 56px touch targets** on all buttons
- **Auto text-to-speech** — results are read aloud without any extra tap
- **ARIA live regions** — screen readers announce results automatically
- **Full keyboard navigation** — no mouse required

---

## 📖 API

### `POST /api/scan`

```json
// Request
{ "image": "<base64 JPEG>" }

// Success 200
{
  "drugName": "Paracetamol 500mg",
  "dosage": "Take 1 or 2 tablets every 4 to 6 hours. Do not take more than 8 tablets in one day.",
  "sideEffects": "Rarely causes side effects when taken correctly. May cause nausea in some people.",
  "warnings": "Do not take with alcohol. Keep away from children.",
  "confidence": "high",
  "cached": false
}

// Error 422
{ "error": "No medication label found in this photo" }
```

---

## 📄 License

MIT
