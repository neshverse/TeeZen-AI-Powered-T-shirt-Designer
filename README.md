# TeeGen Z | AI-Powered T-Shirt Design Studio 🎨👕

![TeeGen Z Banner](https://cdn-icons-png.flaticon.com/512/3305/3305943.png)

**TeeGen Z** is a "Neo-Brutalist" styled, Gen Z-focused web application that leverages Google Gemini AI to help users create viral, witty, and aesthetic T-shirt designs. 

Built with **React 19**, **TypeScript**, and **Vite**, it features a robust canvas editor, AI text/image generation, local LLM support, and full mobile optimization.

---

## 🚀 Key Features

### 🧠 AI Powerhouse
*   **AI Quote Generator**: Generates short, viral, and witty quotes based on a specific "Topic" and "Mood" (e.g., Unhinged, Y2K, Goth).
*   **AI Art Studio**: Generates vector-style graphic assets using **Gemini 2.5 Flash Image** based on custom prompts and selectable aesthetics (Cyberpunk, Vaporwave, 90s, etc.).
*   **AI Cartoonifier**: Transforms user-uploaded photos into specific cartoon styles (Anime, 3D Pixar, Retro Comic, Pixel Art) using multimodal AI processing.
*   **Dual Backend Support**: Switch between **Google Gemini Cloud** and **Local LLMs** (Ollama, LM Studio) directly from the UI settings.

### 🎨 Advanced Design Editor
*   **Drag & Drop Canvas**: Intuitive touch-optimized canvas with drag, rotate, and resize gestures.
*   **Dual-Sided Design**: Switch seamlessly between **Front** and **Back** of the T-shirt.
*   **Smart Text Tools**:
    *   **Waterfall Split**: Instantly split a sentence into individual draggable words.
    *   **Typography**: Curated selection of fonts (Inter, Mono, Marker, Righteous, Pixel, etc.).
    *   **Text Effects**: Adjustable stroke (outline), drop shadows, opacity, and letter spacing.
*   **Image Tools**: 
    *   Upload custom images from device.
    *   Apply AI stylization to uploads.
*   **Layer Blending**: Support for CSS blend modes (Multiply, Screen, Overlay, Difference) for professional composite looks.
*   **History System**: Full **Undo/Redo** functionality for all canvas actions.

### 🌈 Color Studio
*   **Movable Palette**: A floating, draggable color control window (Desktop) that morphs into a bottom sheet on Mobile.
*   **Granular Control**: Adjust colors for the **T-Shirt Body**, **Text**, **Strokes**, and **Shadows** independently.
*   **HSL & Hex**: Fine-tune colors with Hue/Saturation/Lightness sliders or direct Hex input.
*   **Presets**: Quick access to trending color palettes.

### 📱 System & UX
*   **Mobile-First Design**: Fully responsive layout with safe-area handling for notched phones.
*   **PWA Ready**: Installable as a native app with offline caching strategies (Service Workers included).
*   **Native Sharing**: Integrated with `navigator.share` for direct social media sharing on mobile devices.
*   **High-Res Export**: Generates 2x scale PNG downloads with a subtle "TeeGenZ.AI" watermark.
*   **Ad-Supported Workflow**: Includes a simulated "Ad Unlock" modal flow for downloads and an **Ad-Blocker Detector**.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (Custom config for Neo-Brutalist shadows/colors)
*   **AI SDK**: `@google/genai` (Google Gemini 2.5 Flash & Pro models)
*   **Icons**: Lucide React
*   **Export**: `html2canvas`
*   **State Management**: Custom React Hooks (`useHistory`)

---

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/teegenz.git
    cd teegenz
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```env
    # Get your key from aistudio.google.com
    API_KEY=your_google_gemini_api_key_here
    ```
    *Note: The app uses `process.env.API_KEY` for the Google GenAI SDK.*

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

5.  **Build for Production**
    ```bash
    npm run build
    ```

---

## 🤖 Configuring Local AI (Optional)

TeeGen Z supports connecting to local LLMs (like Ollama) instead of using the cloud API for privacy or cost savings.

1.  Open the app and click the **Settings (Gear)** icon in the AI Generator panel.
2.  Select **Custom / Local**.
3.  Enter your endpoint (default: `http://localhost:11434/v1/chat/completions`).
4.  Enter your model name (e.g., `llama3`, `mistral`).
5.  Save Configuration.

---

## 📂 Project Structure

```
/
├── components/          # React UI Components
│   ├── Controls.tsx     # Main editor toolbar (Text/Image/AI tools)
│   ├── TShirtCanvas.tsx # The visual design area (SVG + Elements)
│   ├── QuoteGenerator.tsx # AI Text generation UI
│   ├── BackgroundGenerator.tsx # AI Image generation UI
│   ├── MovableColorPalette.tsx # Floating color picker
│   └── ...
├── services/
│   ├── ai.ts            # Google GenAI and Local LLM logic
│   └── gemini.ts        # Gemini specific configuration
├── types.ts             # TypeScript interfaces (DesignState, Element)
├── hooks/               # Custom hooks (useHistory)
├── App.tsx              # Main application layout and logic
├── index.html           # SEO meta tags and entry point
└── sw.js                # Service Worker for PWA capabilities
```

---

## 📝 License

This project is open-source. Please check the `LICENSE` file for details.

---

*Built with ❤️ and ☕ by TeeGen Z Team.*
