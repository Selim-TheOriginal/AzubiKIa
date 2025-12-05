"use client"

import { useEffect, useRef } from "react"

interface AvatarCharacterProps {
  isSpeaking: boolean
  isLoading: boolean
}

export default function AvatarCharacter({ isSpeaking, isLoading }: AvatarCharacterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const blinkTimerRef = useRef<number>(0)
  const isBlinkingRef = useRef(false)
  const mouthOpenRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let time = 0

    const draw = () => {
      const width = canvas.width
      const height = canvas.height
      const centerX = width / 2
      const centerY = height / 2 - 15

      ctx.clearRect(0, 0, width, height)

      // Idle animation - smoother floating
      const floatY = Math.sin(time * 0.025) * 4
      const floatX = Math.cos(time * 0.018) * 2

      // Head shadow
      ctx.save()
      ctx.translate(centerX + floatX + 4, centerY + floatY + 6)
      ctx.beginPath()
      ctx.arc(0, 0, 52, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)"
      ctx.fill()
      ctx.restore()

      // Main head
      ctx.save()
      ctx.translate(centerX + floatX, centerY + floatY)

      ctx.beginPath()
      ctx.arc(0, 0, 52, 0, Math.PI * 2)
      const headGradient = ctx.createLinearGradient(-52, -52, 52, 52)
      headGradient.addColorStop(0, "#12b88a")
      headGradient.addColorStop(0.5, "#10a37f")
      headGradient.addColorStop(1, "#0d9070")
      ctx.fillStyle = headGradient
      ctx.fill()

      ctx.beginPath()
      ctx.arc(-15, -20, 25, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
      ctx.fill()

      // Eyes
      const eyeY = -6
      const eyeSpacing = 18

      blinkTimerRef.current++
      if (blinkTimerRef.current > 180 && !isBlinkingRef.current) {
        if (Math.random() > 0.97) {
          isBlinkingRef.current = true
          blinkTimerRef.current = 0
        }
      }
      if (isBlinkingRef.current && blinkTimerRef.current > 8) {
        isBlinkingRef.current = false
      }

      const eyeOpenness = isBlinkingRef.current ? 0.15 : 1

      ctx.beginPath()
      ctx.ellipse(-eyeSpacing, eyeY, 11, 13 * eyeOpenness, 0, 0, Math.PI * 2)
      ctx.fillStyle = "#ffffff"
      ctx.fill()
      ctx.strokeStyle = "rgba(0,0,0,0.1)"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.beginPath()
      ctx.ellipse(eyeSpacing, eyeY, 11, 13 * eyeOpenness, 0, 0, Math.PI * 2)
      ctx.fillStyle = "#ffffff"
      ctx.fill()
      ctx.stroke()

      if (eyeOpenness > 0.5) {
        const pupilOffsetX = Math.sin(time * 0.012) * 2.5
        const pupilOffsetY = Math.cos(time * 0.015) * 1.5

        ctx.beginPath()
        ctx.arc(-eyeSpacing + pupilOffsetX, eyeY + pupilOffsetY, 5, 0, Math.PI * 2)
        ctx.fillStyle = "#1a1a1a"
        ctx.fill()

        ctx.beginPath()
        ctx.arc(eyeSpacing + pupilOffsetX, eyeY + pupilOffsetY, 5, 0, Math.PI * 2)
        ctx.fillStyle = "#1a1a1a"
        ctx.fill()

        ctx.beginPath()
        ctx.arc(-eyeSpacing - 1 + pupilOffsetX * 0.3, eyeY - 2 + pupilOffsetY * 0.3, 2, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"
        ctx.fill()

        ctx.beginPath()
        ctx.arc(eyeSpacing - 1 + pupilOffsetX * 0.3, eyeY - 2 + pupilOffsetY * 0.3, 2, 0, Math.PI * 2)
        ctx.fillStyle = "#ffffff"
        ctx.fill()
      }

      // Mouth animation
      if (isSpeaking) {
        const targetMouth = 7 + Math.sin(time * 0.35) * 5 + Math.cos(time * 0.5) * 3
        mouthOpenRef.current += (targetMouth - mouthOpenRef.current) * 0.3
      } else if (isLoading) {
        const targetMouth = 2 + Math.sin(time * 0.1) * 1.5
        mouthOpenRef.current += (targetMouth - mouthOpenRef.current) * 0.2
      } else {
        mouthOpenRef.current = Math.max(0, mouthOpenRef.current - 0.4)
      }

      const mouthY = 20
      if (mouthOpenRef.current > 1) {
        ctx.beginPath()
        ctx.ellipse(0, mouthY, 14, mouthOpenRef.current, 0, 0, Math.PI * 2)
        ctx.fillStyle = "#0a0a0a"
        ctx.fill()

        if (mouthOpenRef.current > 4) {
          ctx.beginPath()
          ctx.ellipse(0, mouthY + 2, 7, 3, 0, 0, Math.PI)
          ctx.fillStyle = "#e57373"
          ctx.fill()
        }
      } else {
        ctx.beginPath()
        ctx.arc(0, mouthY - 6, 18, 0.15 * Math.PI, 0.85 * Math.PI, false)
        ctx.strokeStyle = "#0a0a0a"
        ctx.lineWidth = 3
        ctx.lineCap = "round"
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.ellipse(-32, 8, 6, 4, 0, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 180, 180, 0.2)"
      ctx.fill()

      ctx.beginPath()
      ctx.ellipse(32, 8, 6, 4, 0, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 180, 180, 0.2)"
      ctx.fill()

      ctx.restore()

      // Body/Shoulders
      ctx.save()
      ctx.translate(centerX + floatX, centerY + floatY + 58)

      ctx.beginPath()
      ctx.moveTo(-45, 0)
      ctx.quadraticCurveTo(-55, 35, -35, 55)
      ctx.lineTo(39, 55)
      ctx.quadraticCurveTo(59, 35, 49, 0)
      ctx.closePath()
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.fill()

      ctx.translate(-4, -4)

      ctx.beginPath()
      ctx.moveTo(-45, 0)
      ctx.quadraticCurveTo(-55, 35, -35, 55)
      ctx.lineTo(35, 55)
      ctx.quadraticCurveTo(55, 35, 45, 0)
      ctx.closePath()

      const bodyGradient = ctx.createLinearGradient(-45, 0, 45, 55)
      bodyGradient.addColorStop(0, "#10a37f")
      bodyGradient.addColorStop(1, "#0a7a60")
      ctx.fillStyle = bodyGradient
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(-18, 0)
      ctx.lineTo(0, 18)
      ctx.lineTo(18, 0)
      ctx.strokeStyle = "#087a5f"
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.stroke()

      ctx.restore()

      if (isSpeaking) {
        const waveCount = 3
        for (let i = 0; i < waveCount; i++) {
          const waveProgress = (time * 0.03 + i * 0.33) % 1
          const waveRadius = 65 + waveProgress * 40
          const waveAlpha = (1 - waveProgress) * 0.4

          ctx.beginPath()
          ctx.arc(centerX + floatX, centerY + floatY, waveRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(16, 163, 127, ${waveAlpha})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      time++
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [isSpeaking, isLoading])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={200} height={180} className="rounded-xl" />
      <div className="flex items-center gap-2 mt-2">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            isSpeaking ? "bg-[#10a37f] animate-pulse" : "bg-[#333333]"
          }`}
        />
        <span className="text-xs text-[#666666]">
          {isSpeaking ? "Spricht..." : isLoading ? "Denkt nach..." : "Bereit"}
        </span>
      </div>
    </div>
  )
}
