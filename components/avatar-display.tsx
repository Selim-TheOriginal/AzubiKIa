"use client";

import { useState, useEffect } from "react";
import { useSettings } from "./settings-provider";
import AvatarCharacter from "./avatar-character";

interface AvatarDisplayProps {
  isSpeaking: boolean;
  isLoading: boolean;
  triggerAnimation?: boolean;
}

const REACTION_GIFS = {
  thinking: "/avatars/thinking.gif",
  happy: "/avatars/happy.gif",
  wave: "/avatars/wave.gif",
  thumbsup: "/avatars/thumbsup.gif",
};

export default function AvatarDisplay({
  isSpeaking,
  isLoading,
  triggerAnimation,
}: AvatarDisplayProps) {
  const { settings } = useSettings();
  const [currentReaction, setCurrentReaction] = useState<
    keyof typeof REACTION_GIFS | null
  >(null);

  useEffect(() => {
    if (triggerAnimation && settings.avatar.type === "gif") {
      const reactions = Object.keys(REACTION_GIFS) as (keyof typeof REACTION_GIFS)[];
      const randomReaction =
        reactions[Math.floor(Math.random() * reactions.length)];
      setCurrentReaction(randomReaction);

      const timer = setTimeout(() => setCurrentReaction(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [triggerAnimation, settings.avatar.type]);

  if (!settings.avatar.enabled) return null;

  const isDark = settings.theme === "dark";

  if (
    (settings.avatar.type === "image" || settings.avatar.type === "gif") &&
    settings.avatar.imageUrl
  ) {
    const displayImage = currentReaction
      ? REACTION_GIFS[currentReaction]
      : settings.avatar.imageUrl;

    return (
      <div
        className={`py-4 border-b ${
          isDark
            ? "border-[#1a1a1a] bg-gradient-to-b from-[#111111] to-[#0a0a0a]"
            : "border-gray-200 bg-gradient-to-b from-gray-100 to-white"
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={displayImage || "/placeholder.svg"}
              alt="Avatar"
              className={`w-32 h-32 rounded-full object-cover border-4 ${
                isDark ? "border-[#10a37f]/30" : "border-[#10a37f]/50"
              } shadow-lg shadow-[#10a37f]/20 transition-all duration-300`}
            />
            {isSpeaking && (
              <div className="absolute inset-0 rounded-full border-4 border-[#10a37f] animate-pulse" />
            )}
            <div
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 ${
                isDark ? "border-[#0a0a0a]" : "border-white"
              } ${
                isSpeaking ? "bg-[#10a37f] animate-pulse" : isLoading ? "bg-yellow-500" : "bg-[#10a37f]"
              }`}
            />
            {currentReaction && (
              <div className="absolute -top-2 -right-2 px-2 py-1 bg-[#10a37f] rounded-full text-xs text-white font-medium animate-bounce">
                {currentReaction}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <div
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isSpeaking ? "bg-[#10a37f] animate-pulse" : isDark ? "bg-[#333333]" : "bg-gray-300"
              }`}
            />
            <span className={`text-xs ${isDark ? "text-[#666666]" : "text-gray-500"}`}>
              {isSpeaking
                ? "Spricht..."
                : isLoading
                ? "Denkt nach..."
                : currentReaction
                ? `Reaktion: ${currentReaction}`
                : "Bereit"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`py-4 border-b ${
        isDark
          ? "border-[#1a1a1a] bg-gradient-to-b from-[#111111] to-[#0a0a0a]"
          : "border-gray-200 bg-gradient-to-b from-gray-100 to-white"
      }`}
    >
      <AvatarCharacter isSpeaking={isSpeaking} isLoading={isLoading} />
    </div>
  );
}
