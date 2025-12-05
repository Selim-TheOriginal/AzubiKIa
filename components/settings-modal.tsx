"use client"

import { X, Sparkles, Volume2, VolumeX } from "lucide-react"
import { useSettings } from "./settings-provider"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

// ============================================
// HIER AVATARE ÄNDERN/HINZUFÜGEN
// Füge deine GIFs in /public/avatars/ ein
// ============================================
const AVAILABLE_AVATARS = [
  {
    id: "animated",
    type: "animated" as const,
    name: "Wolfgang",
    emoji: "🤖",
    description: "Dein animierter Ausbilder",
    preview: null,
  },
  {
    id: "robot-wave",
    type: "gif" as const,
    name: "Robo-Wave",
    emoji: "👋",
    description: "Freundlicher Roboter",
    preview: "/avatars/robot-wave.gif",
  },
  {
    id: "robot-think",
    type: "gif" as const,
    name: "Denker",
    emoji: "🤔",
    description: "Der Grübler",
    preview: "/avatars/robot-think.gif",
  },
  {
    id: "robot-happy",
    type: "gif" as const,
    name: "Happy Bot",
    emoji: "😄",
    description: "Immer gut gelaunt",
    preview: "/avatars/robot-happy.gif",
  },
  {
    id: "mascot",
    type: "image" as const,
    name: "Maskottchen",
    emoji: "🦾",
    description: "Firmen-Maskottchen",
    preview: "/avatars/mascot.jpg",
  },
  {
    id: "custom",
    type: "image" as const,
    name: "Custom",
    emoji: "✨",
    description: "Dein eigener Avatar",
    preview: "/avatars/custom.jpg",
  },
]

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateAvatar } = useSettings()

  if (!isOpen) return null

  const isDark = settings.theme === "dark"

  const handleAvatarSelect = (avatar: (typeof AVAILABLE_AVATARS)[0]) => {
    updateAvatar({
      type: avatar.type,
      imageUrl: avatar.preview || "",
      selectedId: avatar.id,
    })
  }

  const currentAvatarId = settings.avatar.selectedId || "animated"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div
        className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ${
          isDark
            ? "bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-[#2a2a2a]"
            : "bg-gradient-to-b from-white to-gray-50 border border-gray-200"
        }`}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#10a37f] to-[#0d8a6a] p-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4 text-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Wähle deinen Begleiter</h2>
              <p className="text-white/70 text-sm">Wer soll dir heute helfen?</p>
            </div>
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-3">
            {AVAILABLE_AVATARS.map((avatar) => {
              const isSelected = currentAvatarId === avatar.id

              return (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar)}
                  className={`relative p-3 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 ${
                    isSelected
                      ? "bg-[#10a37f] text-white scale-105 shadow-lg shadow-[#10a37f]/30"
                      : isDark
                        ? "bg-[#1f1f1f] text-gray-300 hover:bg-[#2a2a2a]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {/* Avatar Preview */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${
                      isSelected ? "bg-white/20" : isDark ? "bg-[#2a2a2a]" : "bg-white"
                    }`}
                  >
                    {avatar.type === "animated" ? (
                      <Sparkles className={`h-6 w-6 ${isSelected ? "text-white" : "text-[#10a37f]"}`} />
                    ) : (
                      <span className="text-2xl">{avatar.emoji}</span>
                    )}
                  </div>

                  {/* Name */}
                  <span className="text-xs font-semibold truncate w-full text-center">{avatar.name}</span>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-3 h-3 text-[#10a37f]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sprache Toggle */}
        <div className={`mx-4 mb-4 p-4 rounded-2xl ${isDark ? "bg-[#1f1f1f]" : "bg-gray-100"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.avatar.enabled ? (
                <Volume2 className="h-5 w-5 text-[#10a37f]" />
              ) : (
                <VolumeX className={`h-5 w-5 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
              )}
              <div>
                <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Sprachausgabe</p>
                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>Avatar spricht Antworten vor</p>
              </div>
            </div>
            <button
              onClick={() => updateAvatar({ enabled: !settings.avatar.enabled })}
              className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                settings.avatar.enabled ? "bg-[#10a37f]" : isDark ? "bg-[#333]" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                  settings.avatar.enabled ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Button */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#10a37f] to-[#0d8a6a] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#10a37f]/20"
          >
            Los geht's! 🚀
          </button>
        </div>
      </div>
    </div>
  )
}
