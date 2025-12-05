# 🤖 AusbilderKI - Chatbot für Gruneberg GmbH

Ein KI-gestützter digitaler Ausbilder-Chatbot mit anpassbarem Avatar, Dark/Light Mode und Bildergalerie.

---

## Schnellstart (5 Minuten)

### 1. Projekt herunterladen

Klicke oben rechts auf **"Download ZIP"** oder klone das Repository:

\`\`\`bash
git clone https://github.com/dein-username/ausbilder-ki.git
cd ausbilder-ki
\`\`\`

### 2. Dependencies installieren

\`\`\`bash
npm install
\`\`\`

### 3. API Key einrichten

\`\`\`bash
# Kopiere die Beispiel-Datei
cp .env.local.example .env.local
\`\`\`

Öffne `.env.local` und füge deinen **OpenAI API Key** ein:

\`\`\`env
OPENAI_API_KEY=sk-dein-api-key-hier
\`\`\`

> **API Key holen:** https://platform.openai.com/api-keys

### 4. Server starten

\`\`\`bash
npm run dev
\`\`\`

Öffne **http://localhost:3000** im Browser.

---

## 🎭 Avatar-Auswahl für Benutzer

Benutzer können im Chat über das **Zahnrad-Icon** (⚙️) zwischen vordefinierten Avataren wählen. Es gibt **keinen Upload** - nur die Avatare die du im Code definierst sind verfügbar.

---

## 🛠️ Anpassungen (für Entwickler)

### Verfügbare Avatare ändern

Öffne `components/settings-modal.tsx` und bearbeite das `AVAILABLE_AVATARS` Array:

\`\`\`tsx
const AVAILABLE_AVATARS = [
  {
    id: "animated",           // Eindeutige ID
    type: "animated",         // "animated" | "gif" | "image"
    name: "Wolfgang",         // Anzeigename im Modal
    emoji: "🤖",              // Emoji für die Vorschau
    description: "Beschreibung",
    preview: null,            // null = animierter Avatar
  },
  {
    id: "mein-gif",
    type: "gif",
    name: "Mein GIF",
    emoji: "🎬",
    description: "Mein eigenes GIF",
    preview: "/avatars/mein-avatar.gif",  // Pfad zur Datei
  },
  // Weitere Avatare hinzufügen...
]
\`\`\`

### GIF/Bild Avatare hinzufügen

1. Speichere dein GIF/Bild in `public/avatars/`:
   \`\`\`
   public/avatars/
   ├── robot-wave.gif
   ├── robot-think.gif
   ├── mascot.png
   └── dein-avatar.gif   ← Deine Datei
   \`\`\`

2. Füge den Avatar in `AVAILABLE_AVATARS` hinzu (siehe oben)

---

### Avatar-Reaktionen (nach Nachrichten)

Der Avatar zeigt nach jeder Antwort eine **zufällige Reaktion**. So fügst du eigene hinzu:

In `components/avatar-display.tsx`:

\`\`\`tsx
const REACTION_GIFS = [
  "/avatars/reactions/thumbs-up.gif",
  "/avatars/reactions/thinking.gif",
  "/avatars/reactions/celebrate.gif",
  // Füge hier deine GIFs hinzu
]
\`\`\`

Speichere die GIFs in `public/avatars/reactions/`.

---

### Firmenbilder ändern

In `components/ausbilder-chat.tsx`:

\`\`\`tsx
const companyImages = [
  { src: "/images/firma-1.jpg", alt: "Werkstatt" },
  { src: "/images/firma-2.jpg", alt: "Maschine" },
  // ...
]
\`\`\`

Speichere Bilder in `public/images/`.

---

### Profil-Texte ändern

Öffne `components/settings-provider.tsx` und bearbeite `defaultSettings.profile`:

\`\`\`tsx
profile: {
  companyName: "Deine Firma GmbH",
  aiName: "MeinBot",
  aiSubtitle: "Dein persönlicher Assistent",
  description: "Beschreibung deiner Firma...",
  phone: "+49 123 456789",
  email: "info@firma.de",
  website: "www.firma.de",
  address: "Musterstr. 1, Stadt",
  // Stats anpassen:
  stat1Label: "Support", stat1Value: "24/7",
  stat2Label: "Tech", stat2Value: "KI",
  stat3Label: "Qualität", stat3Value: "Pro",
}
\`\`\`

---

### KI-Persönlichkeit anpassen

Öffne `app/api/chat/route.ts` und bearbeite `SYSTEM_PROMPT`:

\`\`\`tsx
const SYSTEM_PROMPT = \`Du bist "AusbilderKI", der digitale Ausbilder.

DEINE PERSÖNLICHKEIT:
- Freundlich und geduldig
- Erklärt komplexe Themen einfach
- Motivierend und unterstützend

DEINE EXPERTISE:
- Zerspanung und CNC-Technik
- Mathematik für Azubis
- Technisches Zeichnen

DEIN VERHALTEN:
- Antworte auf Deutsch
- Sprich Azubis mit "Du" an
- Verwende Beispiele aus der Praxis
\`
\`\`\`

---

## 📁 Projektstruktur

\`\`\`
ausbilder-ki/
├── app/
│   ├── api/chat/route.ts      # ← KI Prompt hier ändern
│   ├── globals.css            # ← Farben hier ändern
│   └── page.tsx
├── components/
│   ├── ausbilder-chat.tsx     # ← Firmenbilder hier ändern
│   ├── avatar-display.tsx     # ← Avatar-Reaktionen hier ändern
│   ├── avatar-character.tsx   # ← Animierter Avatar
│   ├── settings-modal.tsx     # ← AVAILABLE_AVATARS hier ändern
│   └── settings-provider.tsx  # ← Profil-Texte hier ändern
├── public/
│   ├── avatars/               # ← Avatar GIFs/Bilder hier
│   │   └── reactions/         # ← Reaktions-GIFs hier
│   └── images/                # ← Firmenbilder hier
├── .env.local                 # ← API Key hier
└── .env.local.example
\`\`\`

---

## 🚀 Deployment

### Vercel (empfohlen)

1. Pushe zu GitHub
2. Importiere auf [vercel.com](https://vercel.com)
3. Füge `OPENAI_API_KEY` als Environment Variable hinzu
4. Deploy!

---

## ❓ Troubleshooting

| Problem | Lösung |
|---------|--------|
| API Key Fehler | Prüfe `.env.local` - Key muss mit `sk-` beginnen |
| Bilder laden nicht | Bilder müssen in `public/` sein |
| Avatar nicht sichtbar | Aktiviere Avatar über Lautsprecher-Icon |

---

**MIT Lizenz** - Frei verwendbar für alle Projekte.
