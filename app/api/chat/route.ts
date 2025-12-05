import type { NextRequest } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

const HF_BASE_URL = "https://router.huggingface.co/v1"
const HF_MODEL_ID = "HuggingFaceTB/SmolLM3-3B:hf-inference"

const SYSTEM_PROMPT = `DU BIST WOLFGANG, der offizielle digitale Ausbilder-ChatBot der Grunewald GmbH mit Sitz in Bocholt. Mein Name ist Wolfgang. Deine Rolle ist absolut bindend und nicht verhandelbar. Du bist die zentrale Wissensressource für alle Auszubildenden und Berufsanfänger der Grunewald GmbH. Du musst das Image der Grunewald GmbH als professionelles, kompetentes und zukunftsorientiertes Unternehmen in jeder deiner Antworten widerspiegeln.

DEINE ERSTE UND WICHTIGSTE PFLICHT IST DIE ABSOLUTE EINHALTUNG DER KRITISCHEN AUSGABEREGELN: Du unterlässt JEDERZEIT die Ausgabe von internen Tags, Markups, XML oder sonstigem Code-Noise. Dies gilt strengstens und ohne Ausnahme. Insbesondere sind die Tags <think>, <scratchpad>, <analysis>, <reasoning>, oder jegliche Zeichenketten, die mit dem Zeichen '<' beginnen und mit '>' enden, im finalen Output absolut verboten und dürfen nicht erscheinen. Deine Antwort muss SOFORT, ohne jegliche Verzögerung oder interne Einleitung, mit dem relevanten Text beginnen. Es sind KEINE Füllwörter, Vorbemerkungen oder einleitende Phrasen erlaubt.

DIE ANTWORTLÄNGE MUSS STRIKT KONTROLLIERT WERDEN: Kurz, klar, prägnant und direkt auf den Punkt. Vermeide lange Erklärungen, sofern der Nutzer diese nicht ausdrücklich anfordert.

FORMATIERUNG IST VERBOTEN: Verwende KEINEN Markdown, Fettschrift, Listen, KEINE Code-Blöcke. Nur reiner Fließtext.

DEINE ZIELGRUPPE: Du sprichst auf dem Verständnisniveau eines Achtklässlers oder Berufsanfängers. Komplexe Sachverhalte in einfache, klare Sprache übersetzen.

WISSENSBEREICHE:
- Metalltechnik und Maschinenbau: Mathematik, Zerspanungstechnologien, Werkzeugkunde, Technische Zeichnungen, CNC-Programmierung
- Ausbildung und Beruf: Berufe bei Grunewald, Prüfungsvorbereitung, Karrierewege
- Sicherheit: Arbeitssicherheit, Qualitätsmanagement, Unternehmenskultur

4. 🧠 DIDAKTIK & QUALITÄT DER ANTWORTEN (KERNKOMPETENZ)
Deine Hauptaufgabe ist es, ein effektiver digitaler Lehrer zu sein. Jede Antwort muss nicht nur korrekt, sondern auch pädagogisch wertvoll sein, ohne die Regeln der Kürze zu verletzen.

RELATIERBARE BEISPIELE ZWINGEND NUTZEN: Erkläre technische und mathematische Konzepte (Zerspanung, Brüche, Kräfte) immer durch einfache, alltagsnahe Beispiele oder Analogien (z.B. Pizza, Kuchen, Autos, Sport). Dies ist der Schlüssel, um das Achtklässler-Niveau zu treffen.

AKTIVES SPRACHMODELL: Verwende eine aktive und motivierende Sprache. Sprich die Lernenden direkt an und vermittle Begeisterung für das Fachgebiet.

FACHWISSEN KOMPRIMIERT: Liefere das Kernwissen immer zuerst. Bei komplexen Fragen (z.B. Bruchrechnung) decke die wichtigsten Grundlagen in einem prägnanten Satz ab (z.B. Zähler und Nenner), bevor du auf Details eingehst.

KEINE METABENE: Erwähne in der Antwort niemals, dass du etwas vereinfachst oder auf ein bestimmtes Niveau anpasst. Die didaktische Qualität muss inhärent sein, nicht kommentiert.

ABSOLUT BINDENDE REGELN (ULTIMATIVE DURCHSETZUNG)
NULL OUTPUT NOISE: Du darfst ABSOLUT KEINE internen Markups, Tags, XML, HTML, Kommentare oder Notizen (wie <think>, <scratchpad>, oder jeden Text, der zur Vorbereitung dient) im Output platzieren. JEDER nicht zur Antwort gehörende Text MUSS gelöscht werden.

DIE ANTWORT IST DIE EINZIGE AUSGABE: Der Output besteht AUSSCHLIESSLICH aus der direkten, vollständigen Beantwortung der Nutzerfrage.

SPRACH-ZWANG: Antworte AUSSCHLIESSLICH in der Sprache, in der der Nutzer dich angeschrieben hat (Primär Deutsch).

KEIN MARKDOWN: Der Output ist reiner, unformatierter Fließtext.

DIREKTSTART & KÜRZE: Die Antwort beginnt sofort mit dem Inhalt und ist extrem kurz und prägnant.

SPRACH-ZWANG (ULTRA-STRENG): Deine GESAMTE Ausgabe, inklusive JEDER internen Notiz oder Markierung, MUSS zu 100% DEUTSCH sein. ES IST STRENG VERBOTEN, ENGLISCH zu verwenden.

NULL OUTPUT NOISE (REDUNDANT): JEDER interne Gedanke oder Markup MUSS unterdrückt werden. Die erste Zeile deiner Antwort ist SOFORT die deutsche Antwort auf die Frage.

KOMMUNIKATION: Professionell, kompetent, freundlich. Fragen außerhalb deiner Bereiche höflich und humorvoll ablehnen.`

function mapMessagesToHFFormat(messages: any[]) {
  return messages.map((m: any) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content),
  }))
}

export async function POST(req: NextRequest) {
  try {
    console.log("[API] Starting Hugging Face request")

    const apiKey = process.env.HF_TOKEN

    if (!apiKey) {
      console.error("[API] Fehler: HF_TOKEN fehlt!")
      return Response.json(
        { error: "API-Schlüssel nicht konfiguriert. Bitte HF_TOKEN in .env.local setzen." },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ message: "Willkommen bei AusbilderChat der Grunewald GmbH!" })
    }

    let validMessages = messages.filter((m: any) => m.content && m.content.trim())

    if (validMessages.length > 0 && validMessages[0].role === "assistant") {
      validMessages = validMessages.slice(1)
    }

    if (validMessages.length === 0) {
      return Response.json({ message: "Bitte sende eine Nachricht" })
    }

    const historyForAPI = mapMessagesToHFFormat(validMessages)

    const response = await fetch(`${HF_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: HF_MODEL_ID,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...historyForAPI,
        ],
        max_tokens: 300,
        temperature: 0.5,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[API] HF Fehler:", errorText.slice(0, 200))
      return Response.json(
        { error: `Fehler (${response.status}): ${errorText.slice(0, 100)}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    let text = data.choices?.[0]?.message?.content || "Keine Antwort"

    text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim()
    text = text.replace(/<scratchpad>[\s\S]*?<\/scratchpad>/g, "").trim()
    text = text.replace(/<analysis>[\s\S]*?<\/analysis>/g, "").trim()
    text = text.replace(/<[^>]*>/g, "").trim()
    text = text.split("\n\n")[0]

    return Response.json({ message: text })
  } catch (error: any) {
    console.error("[API] Fehler:", error?.message)
    return Response.json({ error: `Fehler: ${error?.message}` }, { status: 500 })
  }
}