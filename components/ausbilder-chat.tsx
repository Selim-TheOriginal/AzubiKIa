"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import {
  Send,
  ImagePlus,
  X,
  Loader2,
  Sparkles,
  ChevronLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Settings,
  Sun,
  Moon,
  Mic,
  MicOff,
} from "lucide-react"
import { useSettings } from "./settings-provider"
import AvatarDisplay from "./avatar-display"
import SettingsModal from "./settings-modal"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  image?: string
  timestamp: Date
}

const COMPANY_IMAGES = [
  { url: "/images/company-1.jpg", title: "Firmengebäude" },
  { url: "/images/company-2.jpg", title: "Werkstatthalle" },
  { url: "/images/company-3.jpg", title: "Hallenkran" },
  { url: "/images/company-4.jpg", title: "CNC Fräsmaschine" },
  { url: "/images/company-5.jpg", title: "Industriepresse" },
  { url: "/images/company-6.jpg", title: "Bandsäge" },
  { url: "/images/company-7.jpg", title: "Werkbänke" },
  { url: "/images/company-8.jpg", title: "Roboterarm" },
  { url: "/images/company-9.jpg", title: "Präzisionsteile" },
]

export default function AusbilderChat() {
  const { settings, updateTheme, updateAvatar } = useSettings()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<number | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [triggerAnimation, setTriggerAnimation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Herzlich willkommen! 👋 Ich bin dein digitaler Ausbilder bei der ${settings.profile.companyName}. Stell mir Fragen rund um Mathe, Technik und Zerspanung! 🧠 Du kannst auch Bilder hochladen! 📸 Wie kann ich dir heute helfen?`,
        timestamp: new Date(),
      },
    ])
  }, [settings.profile.companyName])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }, [input])

  const speakText = (text: string) => {
    if (isMuted || !settings.avatar.enabled || typeof window === "undefined") return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "de-DE"
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => setSelectedImage(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      image: selectedImage || undefined,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setSelectedImage(null)
    setIsLoading(true)

    try {
      // Alle Nachrichten sammeln
      const allMessages = [...messages, userMessage]
      
      // Überspringe die Willkommensnachricht wenn sie am Anfang steht
      const messagesToSend = allMessages[0]?.id === "welcome" 
        ? allMessages.slice(1) 
        : allMessages

      const payload = {
        messages: messagesToSend.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }

      console.log("[Client] Sending payload with", payload.messages.length, "messages")

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("[Client] Response status:", response.status)

      const responseText = await response.text()
      console.log("[Client] Response text:", responseText.slice(0, 200))

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`)
      }

      const data = JSON.parse(responseText)

      if (!data.message) {
        throw new Error("Keine 'message' im Response")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      speakText(data.message)

      setTriggerAnimation(true)
      setTimeout(() => setTriggerAnimation(false), 100)
    } catch (error) {
      console.error("[Client] Full error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `❌ Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })

  const toggleAvatar = () => {
    if (settings.avatar.enabled) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
    updateAvatar({ enabled: !settings.avatar.enabled })
  }

  const isDark = settings.theme === "dark"
  const bgMain = isDark ? "bg-[#0a0a0a]" : "bg-gray-50"
  const bgHeader = isDark ? "bg-[#111111]" : "bg-white"
  const bgCard = isDark ? "bg-[#1a1a1a]" : "bg-white"
  const bgInput = isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const textSecondary = isDark ? "text-[#888888]" : "text-gray-600"
  const textMuted = isDark ? "text-[#666666]" : "text-gray-400"
  const borderColor = isDark ? "border-[#1a1a1a]" : "border-gray-200"

  // Profile View - ✅ HIER IST DIE PROFIL-LANDINGPAGE
  if (showProfile) {
    return (
      <div className={`min-h-screen ${bgMain} flex flex-col max-w-md mx-auto`}>
        {/* Header mit Back-Button */}
        <div className={`${bgHeader} px-4 py-4 flex items-center gap-3 border-b ${borderColor}`}>
          <button
            onClick={() => setShowProfile(false)}
            className={`p-2 ${isDark ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-100"} rounded-full transition-colors`}
          >
            <ChevronLeft className={`h-6 w-6 ${textPrimary}`} />
          </button>
          <h1 className={`font-semibold ${textPrimary} text-lg`}>{settings.profile.companyName}</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Gradient Header mit Avatar */}
          <div className="relative h-40 bg-gradient-to-br from-[#10a37f] via-[#0d9070] to-[#0a7a60]">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 400 160">
                <circle cx="50" cy="30" r="80" fill="white" />
                <circle cx="350" cy="130" r="60" fill="white" />
              </svg>
            </div>
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
              <div
                className={`w-28 h-28 bg-[#10a37f] rounded-full flex items-center justify-center border-4 ${isDark ? "border-[#0a0a0a]" : "border-gray-50"} shadow-xl shadow-[#10a37f]/20`}
              >
                <span className="text-4xl font-black text-white">{settings.profile.companyName.charAt(0)}</span>
              </div>
            </div>
          </div>

          {/* Profil-Inhalt */}
          <div className="pt-18 px-6 pb-6">
            <h2 className={`text-2xl font-bold ${textPrimary} text-center mt-4`}>{settings.profile.aiName}</h2>
            <p className={`${textSecondary} text-center text-sm mt-1`}>{settings.profile.aiSubtitle}</p>

            {/* Stats (Erfahrung, Team, Auszubildende) */}
            <div className={`flex justify-center gap-12 mt-6 py-5 border-y ${borderColor}`}>
              <div className="text-center">
                <div className={`text-xl font-bold ${textPrimary}`}>{settings.profile.stat1Value}</div>
                <div className={`text-xs ${textMuted} mt-1`}>{settings.profile.stat1Label}</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${textPrimary}`}>{settings.profile.stat2Value}</div>
                <div className={`text-xs ${textMuted} mt-1`}>{settings.profile.stat2Label}</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${textPrimary}`}>{settings.profile.stat3Value}</div>
                <div className={`text-xs ${textMuted} mt-1`}>{settings.profile.stat3Label}</div>
              </div>
            </div>

            {/* Über uns */}
            <div className="mt-6">
              <h3 className={`${textPrimary} font-semibold mb-3`}>Über uns</h3>
              <p className={`${textSecondary} text-sm leading-relaxed`}>{settings.profile.description}</p>
            </div>

            {/* Kontakt */}
            <div className="mt-6 space-y-4">
              <h3 className={`${textPrimary} font-semibold mb-3`}>Kontakt</h3>
              <div className={`flex items-center gap-3 ${textSecondary}`}>
                <MapPin className="h-5 w-5 text-[#10a37f] flex-shrink-0" />
                <span className="text-sm">{settings.profile.address}</span>
              </div>
              <div className={`flex items-center gap-3 ${textSecondary}`}>
                <Phone className="h-5 w-5 text-[#10a37f] flex-shrink-0" />
                <span className="text-sm">{settings.profile.phone}</span>
              </div>
              <div className={`flex items-center gap-3 ${textSecondary}`}>
                <Mail className="h-5 w-5 text-[#10a37f] flex-shrink-0" />
                <span className="text-sm">{settings.profile.email}</span>
              </div>
              <div className={`flex items-center gap-3 ${textSecondary}`}>
                <Globe className="h-5 w-5 text-[#10a37f] flex-shrink-0" />
                <span className="text-sm">{settings.profile.website}</span>
              </div>
            </div>

            {/* Unternehmen Galerie */}
            <div className="mt-8">
              <h3 className={`${textPrimary} font-semibold mb-4`}>Unser Unternehmen</h3>
              <div className="grid grid-cols-3 gap-2">
                {COMPANY_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedGalleryImage(idx)}
                    className={`aspect-square rounded-xl overflow-hidden ${bgCard} hover:opacity-80 transition-opacity`}
                  >
                    <img
                      src={img.url || "/placeholder.svg"}
                      alt={img.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback for missing images
                        ;(e.target as HTMLImageElement).src =
                          `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(img.title)}`
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedGalleryImage !== null && (
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col" onClick={() => setSelectedGalleryImage(null)}>
            <div className="p-4 flex items-center justify-between">
              <button onClick={() => setSelectedGalleryImage(null)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="h-6 w-6 text-white" />
              </button>
              <span className="text-white font-medium">{COMPANY_IMAGES[selectedGalleryImage].title}</span>
              <div className="w-10" />
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={COMPANY_IMAGES[selectedGalleryImage].url || "/placeholder.svg"}
                alt={COMPANY_IMAGES[selectedGalleryImage].title}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src =
                    `/placeholder.svg?height=600&width=800&query=${encodeURIComponent(COMPANY_IMAGES[selectedGalleryImage].title)}`
                }}
              />
            </div>
            <div className={`p-4 text-center ${textMuted} text-sm`}>
              {selectedGalleryImage + 1} / {COMPANY_IMAGES.length}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Chat View
  return (
    <div className={`min-h-screen ${bgMain} flex flex-col max-w-md mx-auto relative`}>
      <div className={`${bgHeader} px-4 py-3 flex items-center gap-3 border-b ${borderColor}`}>
        <button onClick={() => setShowProfile(true)} className="relative">
          <div className="w-11 h-11 bg-[#10a37f] rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">{settings.profile.companyName.charAt(0)}</span>
          </div>
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#10a37f] rounded-full border-2 ${isDark ? "border-[#111111]" : "border-white"}`}
          />
        </button>
        <div className="flex-1 cursor-pointer" onClick={() => setShowProfile(true)}>
          <h1 className={`font-semibold ${textPrimary} text-base`}>{settings.profile.aiName}</h1>
          <p className="text-[#10a37f] text-xs flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Online - Tippe für Profil
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateTheme(isDark ? "light" : "dark")}
            className={`p-2.5 rounded-full transition-colors ${isDark ? "bg-[#1a1a1a] text-[#666666] hover:bg-[#222222]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleAvatar}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              settings.avatar.enabled
                ? "bg-[#10a37f] text-white shadow-lg shadow-[#10a37f]/30"
                : `${isDark ? "bg-[#1a1a1a] text-[#666666] hover:bg-[#222222]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`
            }`}
          >
            {settings.avatar.enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleMute}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              isMuted
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : `${isDark ? "bg-[#1a1a1a] text-[#666666] hover:bg-[#222222]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`
            }`}
            title={isMuted ? "Audio aktivieren" : "Audio stummschalten"}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className={`p-2.5 rounded-full transition-colors ${isDark ? "bg-[#1a1a1a] text-[#666666] hover:bg-[#222222]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AvatarDisplay isSpeaking={isSpeaking} isLoading={isLoading} triggerAnimation={triggerAnimation} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-4 ${msg.role === "user" ? "flex justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="flex gap-3 group">
                <div className="w-8 h-8 bg-[#10a37f] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div
                    className={`${bgCard} rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] relative ${isDark ? "" : "shadow-sm"}`}
                  >
                    <p className={`${textPrimary} whitespace-pre-wrap text-sm leading-relaxed`}>{msg.content}</p>
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className={`absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 ${isDark ? "hover:bg-[#1a1a1a]" : "hover:bg-gray-100"} transition-all`}
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-4 w-4 text-[#10a37f]" />
                      ) : (
                        <Copy className={`h-4 w-4 ${textMuted}`} />
                      )}
                    </button>
                  </div>
                  <span className={`${textMuted} text-xs mt-1 ml-1 block`}>{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div className="flex flex-col items-end">
                <div className="bg-[#10a37f] rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]">
                  {msg.image && (
                    <img
                      src={msg.image || "/placeholder.svg"}
                      alt="Uploaded"
                      className="rounded-lg mb-2 max-h-48 w-full object-cover"
                    />
                  )}
                  <p className="text-white whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
                <span className={`${textMuted} text-xs mt-1 mr-1`}>{formatTime(msg.timestamp)}</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 bg-[#10a37f] rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className={`${bgCard} rounded-2xl rounded-tl-sm px-4 py-3`}>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-[#10a37f] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {selectedImage && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Preview"
              className="h-20 rounded-xl border-2 border-[#10a37f]"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className={`p-4 ${bgHeader} border-t ${borderColor}`}>
        <div className={`flex items-end gap-2 ${bgInput} rounded-2xl px-3 py-2`}>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 ${isDark ? "hover:bg-[#222222]" : "hover:bg-gray-200"} rounded-full transition-colors flex-shrink-0`}
          >
            <ImagePlus className={`h-5 w-5 ${textMuted}`} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={`Nachricht an ${settings.profile.aiName}...`}
            rows={1}
            className={`flex-1 bg-transparent ${textPrimary} placeholder:${textMuted} resize-none focus:outline-none py-2 text-sm max-h-30`}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className={`p-2 rounded-full transition-all flex-shrink-0 ${
              input.trim() || selectedImage
                ? "bg-[#10a37f] hover:bg-[#0d9070] text-white shadow-lg shadow-[#10a37f]/30"
                : textMuted
            }`}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
