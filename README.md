<div align="center">

# 💊 MediScan
### AI-Powered Medicine Label Translator for Bharat

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-mediscan--six.vercel.app-F59E0B?style=for-the-badge)](https://mediscan-six.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-amritanshushaw--cpu%2Fmediscan-181717?style=for-the-badge&logo=github)](https://github.com/amritanshushaw-cpu/mediscan)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Scan any medicine label → Get plain-English (or local language) explanation → Hear it spoken aloud**

*Built for the 850M+ people in India who struggle to read medicine labels*

---

</div>

## 🎯 Problem Statement

Every year, thousands of patients in India take wrong medicine doses because they cannot read or understand medicine labels. Labels are printed in English with dense medical jargon — inaccessible to:

- Low-literacy patients in rural areas
- Elderly patients unfamiliar with English
- Patients prescribed medicines with complex dosage schedules
- Non-English speakers across 12+ Indian language groups

**MediScan solves this with a single camera scan.**

---

## ✨ Features

| Feature | Description |
|---|---|
| 📷 **Camera Scan** | Point camera at any medicine label — tablet, syrup, injection |
| 🧠 **AI Vision OCR** | Llama 4 Scout reads label text even on curved/glossy surfaces |
| 📝 **Plain English** | Rewrites complex dosage at 3rd grade reading level |
| 🌐 **12 Indian Languages** | Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, English |
| 🔊 **Local Language Audio** | Google TTS proxy delivers native-quality audio in all 12 languages |
| 🗣️ **Bhashini TTS** | Optional official Indian government AI voices via Bhashini ULCA |
| 📋 **Scan History** | Last 20 scans saved locally with thumbnails |
| 📤 **Share Results** | Native share sheet or clipboard copy |
| ⚡ **Smart Caching** | SHA-256 image hash prevents duplicate API calls |
| 📱 **PWA** | Installable on Android/iOS home screen, works offline (shell) |
| ♿ **Accessible** | WCAG AA contrast, ARIA labels, 56px+ touch targets, Atkinson Hyperlegible font |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser / PWA)                      │
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────────────┐   │
│  │  IdleScreen  │    │ CameraScreen │    │   ResultsScreen     │   │
│  │  Lang Select │───▶│ getUserMedia │───▶│  4 Result Cards     │   │
│  │  History     │    │ Capture JPEG │    │  TTS Controls       │   │
│  └──────────────┘    └──────┬───────┘    │  Share Button       │   │
│                             │            └─────────────────────┘   │
│                    ┌────────▼────────┐                              │
│                    │   useCamera.ts  │  Resize → 1024px max        │
│                    │   65% JPEG      │  SHA-256 cache key          │
│                    └────────┬────────┘                              │
│                             │ POST /api/scan                        │
│                             │ { image: base64, language: "hi" }    │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
                              ▼ HTTPS
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL SERVERLESS FUNCTIONS                       │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  api/scan.js                                                 │   │
│  │                                                               │   │
│  │  1. Rate limit check (15 req/min per IP)                     │   │
│  │  2. SHA-256 full-image hash → in-process cache lookup        │   │
│  │  3. Groq Vision API call (Llama 4 Scout)                     │   │
│  │     ┌─────────────────────────────────────────────────┐     │   │
│  │     │  SYSTEM PROMPT:                                  │     │   │
│  │     │  "Read label. Return JSON only. 3rd grade level" │     │   │
│  │     │  → { drugName, dosage, sideEffects, warnings,   │     │   │
│  │     │      confidence }                                │     │   │
│  │     └─────────────────────────────────────────────────┘     │   │
│  │  4. If lang ≠ en → Bhashini translate OR Groq translate      │   │
│  │  5. Cache result, return JSON                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  api/tts.js                                                  │   │
│  │                                                               │   │
│  │  GET /api/tts?text=दवाई&lang=hi                              │   │
│  │  → Proxy to Google Translate TTS                             │   │
│  │  → Returns audio/mpeg stream                                 │   │
│  │  → 24hr cache header                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
              ┌────────────┼────────────────┐
              ▼            ▼                ▼
    ┌──────────────┐  ┌──────────┐  ┌──────────────────┐
    │  Groq API    │  │ Bhashini │  │  Google TTS      │
    │  Llama 4     │  │  ULCA    │  │  Translate       │
    │  Scout       │  │  API     │  │  (proxy)         │
    │  (vision)    │  │ (text    │  │  (audio          │
    │              │  │  trans.) │  │   stream)        │
    └──────────────┘  └──────────┘  └──────────────────┘
```

---

## 🔄 Request Lifecycle

```
User taps "Scan" 
    │
    ▼
getUserMedia() → rear camera stream
    │
    ▼
User taps shutter → drawImage() to canvas
    │
    ▼
Resize to max 1024px × 65% JPEG quality (~200KB)
    │
    ▼
SHA-256 hash(base64 + language) → check client cache
    │                                      │
    │ (cache miss)                         │ (cache hit)
    ▼                                      ▼
POST /api/scan                        Show cached result
    │
    ▼
Server: SHA-256 hash → check server cache
    │                        │
    │ (cache miss)           │ (cache hit)
    ▼                        ▼
Groq Llama 4 Scout    Return cached JSON
(vision + OCR + LLM)
    │
    ▼
Parse strict JSON response
    │
    ▼
language ≠ en? → Bhashini API → fallback Groq translate
    │
    ▼
Cache result → return ScanResult
    │
    ▼
Client renders 4 result cards (slide-up animation)
    │
    ▼
Auto-trigger TTS:
  GET /api/tts?text=...&lang=hi
      │
      ▼
  Google TTS proxy → MP3 audio stream
      │
      ▼
  HTMLAudioElement.play()
  (fallback: Web Speech API with hi-IN/ta-IN voice)
```

---

## 🌐 APIs & Integrations

### 1. Groq API — Vision + Translation
| Property | Value |
|---|---|
| Model | `meta-llama/llama-4-scout-17b-16e-instruct` |
| Purpose | OCR + plain-English rewrite in single call |
| Fallback model | `llama-3.3-70b-versatile` (text translation only) |
| Free tier | 14,400 req/day |
| Endpoint | `https://api.groq.com/openai/v1/chat/completions` |
| Auth | Bearer token via `GROQ_API_KEY` env var |

**System prompt strategy:**
```
"You are a medication label reader for low-literacy patients in India.
Return ONLY raw JSON. No markdown. No backticks.
{"drugName":"...","dosage":"...","sideEffects":"...","warnings":"...","confidence":"high|medium|low"}
Rules: 3rd grade reading level. Short sentences. No medical jargon."
```

### 2. Bhashini ULCA API — Official Indian Language Translation
| Property | Value |
|---|---|
| Provider | Ministry of Electronics & IT, Government of India |
| Purpose | Text translation (en → 11 Indian languages) |
| TTS | Native Indian language voice synthesis |
| Endpoint | `https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline` |
| Auth | `userID` + `ulcaApiKey` headers |
| Registration | [bhashini.gov.in/ulca/user/register](https://bhashini.gov.in/ulca/user/register) |
| Cost | Free |

**Pipeline flow:**
```
getModelsPipeline() → serviceId + callbackUrl + inferenceApiKey
    ↓
callbackUrl (inference) → translated text / audio content (base64 WAV)
```

### 3. Google Translate TTS — Guaranteed Audio
| Property | Value |
|---|---|
| Purpose | Native-quality audio in all 12 languages |
| Endpoint | `https://translate.google.com/translate_tts` |
| Auth | None (proxied server-side to bypass CORS) |
| Format | audio/mpeg (MP3) |
| Languages | All 12 supported languages |

### 4. Web Speech API — Browser TTS Fallback
| Property | Value |
|---|---|
| Purpose | Fallback if Google TTS proxy fails |
| API | `window.speechSynthesis` |
| Voice mapping | `hi→hi-IN`, `ta→ta-IN`, `bn→bn-IN`, etc. |
| Availability | All modern browsers |

---

## 🗣️ Audio Strategy (3-Layer Fallback)

```
Layer 1: Google TTS Proxy (/api/tts)
    ✓ Native Google voices
    ✓ Works on all devices
    ✓ No API key needed
    ↓ (if fails)

Layer 2: Web Speech API with Indian BCP-47 codes
    ✓ hi-IN, ta-IN, bn-IN, te-IN etc.
    ✓ Uses device's built-in voices
    ↓ (if no Indian voice installed)

Layer 3: Web Speech API in English
    ✓ Always available
    ✓ Universal fallback
```

---

## 🌍 Supported Languages

| Language | Code | BCP-47 | Flag |
|---|---|---|---|
| English | `en` | `en-US` | 🇬🇧 |
| Hindi | `hi` | `hi-IN` | 🇮🇳 |
| Bengali | `bn` | `bn-IN` | 🇮🇳 |
| Tamil | `ta` | `ta-IN` | 🇮🇳 |
| Telugu | `te` | `te-IN` | 🇮🇳 |
| Marathi | `mr` | `mr-IN` | 🇮🇳 |
| Gujarati | `gu` | `gu-IN` | 🇮🇳 |
| Kannada | `kn` | `kn-IN` | 🇮🇳 |
| Malayalam | `ml` | `ml-IN` | 🇮🇳 |
| Punjabi | `pa` | `pa-IN` | 🇮🇳 |
| Odia | `or` | `or-IN` | 🇮🇳 |
| Urdu | `ur` | `ur-IN` | 🇮🇳 |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool + dev server |
| vite-plugin-pwa | PWA manifest + service worker |
| Atkinson Hyperlegible | Accessibility-first font (designed for low-vision users) |
| Bebas Neue | Display/heading font |
| Web Speech API | Browser TTS fallback |
| getUserMedia API | Camera capture |
| SubtleCrypto SHA-256 | Cache key generation |
| HTMLAudioElement | MP3 audio playback |

### Backend (Vercel Serverless)
| Technology | Purpose |
|---|---|
| Node.js | Serverless function runtime |
| Vercel Functions | Serverless deployment |
| `crypto` (Node built-in) | Server-side image hashing |
| In-process Map (LRU 500) | Server-side result cache |

### AI & APIs
| Service | Purpose | Cost |
|---|---|---|
| Groq (Llama 4 Scout) | Vision OCR + plain-English rewrite | Free (14,400/day) |
| Groq (Llama 3.3 70B) | Translation fallback | Free |
| Bhashini ULCA | Official Indian translation + TTS | Free (Government) |
| Google Translate TTS | Audio proxy | Free |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Hosting + serverless functions + CDN |
| GitHub | Version control + CI/CD trigger |

---

## 📁 Project Structure

```
mediscan/
├── api/
│   ├── scan.js              # Vision OCR + translation pipeline
│   └── tts.js               # Google TTS audio proxy
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── components/
│   │   ├── IdleScreen.tsx       # Home screen + language selector
│   │   ├── CameraScreen.tsx     # Camera viewfinder + scan frame
│   │   ├── ProcessingScreen.tsx # Loading with step indicators
│   │   ├── ResultsScreen.tsx    # 4 result cards + TTS + share
│   │   ├── HistoryScreen.tsx    # Past scans with thumbnails
│   │   └── ErrorScreen.tsx      # Error with smart tips
│   ├── hooks/
│   │   ├── useCamera.ts         # Camera stream + resize + capture
│   │   └── useTTS.ts            # 3-layer TTS with Google proxy
│   ├── styles/
│   │   └── global.css           # Design tokens, animations, components
│   ├── App.tsx                  # State machine (idle→camera→processing→results)
│   ├── main.tsx                 # React entry point
│   └── types.ts                 # TypeScript types + language config
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vercel.json                  # Serverless function + routing config
└── vite.config.ts
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Free Groq API key from [console.groq.com](https://console.groq.com)

### Steps

```bash
# 1. Clone
git clone https://github.com/amritanshushaw-cpu/mediscan.git
cd mediscan

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Add your GROQ_API_KEY to .env

# 4. Run (must use vercel dev to run api/ functions locally)
npm install -g vercel
vercel dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

| Variable | Required | Description | Get it |
|---|---|---|---|
| `GROQ_API_KEY` | ✅ | Groq API key for vision + translation | [console.groq.com](https://console.groq.com) |
| `BHASHINI_API_KEY` | Optional | Bhashini ULCA key (better translation) | [bhashini.gov.in](https://bhashini.gov.in/ulca/user/register) |
| `BHASHINI_USER_ID` | Optional | Bhashini user ID | Same as above |

---

## 📱 User Manual

### Step 1 — Open the App
Visit `mediscan-six.vercel.app` on any browser. On Android/iOS tap **Add to Home Screen** to install as an app.

### Step 2 — Select Your Language
Scroll the language bar at the bottom of the home screen. Tap your preferred language — Hindi (हिंदी), Tamil (தமிழ்), Bengali (বাংলা), etc.

### Step 3 — Scan a Label
Tap **Scan a Label**. Allow camera access when prompted. Hold your medicine bottle so the label is inside the gold scanning frame. Tap the yellow shutter button.

### Step 4 — Read & Listen
Results appear in ~2 seconds as 4 cards:
- 💊 **Medicine Name** — what the medicine is called
- 📋 **How to Take It** — dose and timing in simple words
- ⚡ **Side Effects** — what to watch out for
- ⚠️ **Warnings** — important safety notes

The app **automatically reads the results aloud** in your selected language.

### Step 5 — Actions
| Button | Action |
|---|---|
| 🔊 Listen | Read aloud again in your language |
| 📤 Share | Share results via WhatsApp, SMS, etc. |
| 📷 Scan Again | Scan another label |
| 📋 History | View your past scans |
| 🏠 Home | Return to start |

### Tips for Best Results
- 💡 Hold the label flat — avoid curved angles
- 💡 Use good lighting — avoid shadows on the label
- 💡 Keep the camera steady when tapping the shutter
- 💡 If confidence shows "Unclear" — retake the photo

---

## ♿ Accessibility

| Feature | Implementation |
|---|---|
| Font | Atkinson Hyperlegible — designed for low-vision readers |
| Contrast | WCAG AA compliant (4.5:1 minimum ratio) |
| Touch targets | All buttons minimum 56px tall |
| ARIA | Full `aria-label` on all interactive elements |
| Live regions | `aria-live` announces results to screen readers |
| Keyboard | Fully navigable without mouse |
| Auto TTS | Results read aloud automatically on render |
| Large text | Minimum 17px body, 20px+ for results |

---

## 🔒 Privacy & Security

- 📸 **Photos are never stored** — images are processed in memory and discarded
- 🔑 **API keys are server-side only** — never exposed to the browser
- 🚫 **No user accounts** — no sign-up, no tracking
- ⚡ **Results cached by image hash** — your scan data stays in-memory only
- 🌐 **HTTPS only** — all communication encrypted

---

## 📊 Performance

| Metric | Value |
|---|---|
| Time to first scan result | ~2–3 seconds |
| Image payload size | ~150–300 KB (after resize + compression) |
| Server cache | In-process LRU, 500 entries max |
| Client cache | SHA-256 keyed Map, per session |
| PWA shell load | < 1 second on repeat visits |
| Supported devices | Any smartphone with a camera and browser |

---

## 🤝 Contributors

| Name | Role | GitHub |
|---|---|---|
| **Amritanshu Shaw** | Full Stack Developer — Architecture, Backend, API, Deployment | [@amritanshushaw-cpu](https://github.com/amritanshushaw-cpu) |
| **Shrinivas Ghosh** | AI & Integration — Groq Pipeline, Bhashini API, Language Support | [@devnivas](https://github.com/devnivas) |
| **Saptak Sarathi Chakraborty** | Product & Design — UX, Accessibility, User Research | [@saptakgg](https://github.com/saptakgg) |
| **Ritam Karmakar** | Full Stack Developer — Frontend,   | [@ritam07karmakar-prog](https://github.com/ritam07karmakar-prog) |

---

## 🏆 Hackathon Submission

This project was built for a 850-participant hackathon focusing on **AI for Social Good** and **Digital Inclusion in Bharat**.

### Problem we solve
Medicine label illiteracy causes preventable harm to millions of patients across India daily.

### Our approach
- Single camera scan → AI reads → plain language explanation → local language audio
- No internet dependency for core UI (PWA shell cached)
- No sign-up friction — works instantly
- Designed for feature phones upgrading to smartphones

### Impact potential
- 300M+ low-literacy adults in India
- 600M+ non-English speakers
- Rural healthcare workers with limited training
- Elderly patients managing complex medication schedules

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

Built with ❤️ for Bharat 🇮🇳

**MediScan** — Making medicine accessible to every Indian

[mediscan-six.vercel.app](https://mediscan-six.vercel.app)

</div>
