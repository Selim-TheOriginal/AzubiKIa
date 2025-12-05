"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface ProfileSettings {
  companyName: string
  aiName: string
  aiSubtitle: string
  description: string
  phone: string
  email: string
  website: string
  address: string
  stat1Label: string
  stat1Value: string
  stat2Label: string
  stat2Value: string
  stat3Label: string
  stat3Value: string
}

export interface AvatarSettings {
  type: "animated" | "image" | "gif"
  imageUrl: string
  enabled: boolean
  selectedId: string // Added selectedId to track which avatar is selected
}

interface Settings {
  theme: "dark" | "light"
  profile: ProfileSettings
  avatar: AvatarSettings
}

interface SettingsContextType {
  settings: Settings
  updateTheme: (theme: "dark" | "light") => void
  updateProfile: (profile: Partial<ProfileSettings>) => void
  updateAvatar: (avatar: Partial<AvatarSettings>) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  avatar: {
    enabled: true,
    type: "character",
    imageUrl: "",
  },
  profile: {
    companyName: "Grunewald GmbH",
    aiName: "Wolfgang",
    aiSubtitle: "Dein digitaler Ausbilder",
    // ✅ ADRESSE - MANUELL EINGETRAGEN
    address: "Biemenhorster Weg 19, 46395 Bocholt, Deutschland",
    phone: "+49 176 11025715",
    email: "w.overbeck@grunewald.de",
    website: "www.grunewald.de",
    // ✅ ÜBER UNS - MANUELL EINGETRAGEN
    description:
      "Die Grunewald GmbH ist spezialisiert auf Präzisionsfertigung und Zerspanung. Unser digitaler Ausbilder unterstützt Azubis bei Fragen zu Mathe, Technik und allem rund um die Ausbildung als Industriemechaniker oder Zerspanungsmechaniker. Mit über 30 Jahren Erfahrung sind wir ein kompetenter Partner in der Metallindustrie.",
    stat1Label: "Erfahrung",
    stat1Value: "30+ Jahre",
    stat2Label: "Team",
    stat2Value: "50+ Mitarbeiter",
    stat3Label: "Auszubildende",
    stat3Value: "15+ pro Jahr",
  },
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("ausbilder-settings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch {
        // Ignore parse errors
      }
    }
    setMounted(true)
  }, [])

  // Save settings to localStorage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("ausbilder-settings", JSON.stringify(settings))
      // Apply theme
      document.documentElement.classList.toggle("dark", settings.theme === "dark")
      document.documentElement.classList.toggle("light", settings.theme === "light")
    }
  }, [settings, mounted])

  const updateTheme = (theme: "dark" | "light") => {
    setSettings((prev) => ({ ...prev, theme }))
  }

  const updateProfile = (profile: Partial<ProfileSettings>) => {
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } }))
  }

  const updateAvatar = (avatar: Partial<AvatarSettings>) => {
    setSettings((prev) => ({ ...prev, avatar: { ...prev.avatar, ...avatar } }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  if (!mounted) {
    return null
  }

  return (
    <SettingsContext.Provider value={{ settings, updateTheme, updateProfile, updateAvatar, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return context
}
