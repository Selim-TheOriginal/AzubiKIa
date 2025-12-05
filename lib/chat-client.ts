export async function sendMessage(messages: any[]) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("API Error:", error)
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response
  } catch (error) {
    console.error("Chat Client Error:", error)
    throw error
  }
}
