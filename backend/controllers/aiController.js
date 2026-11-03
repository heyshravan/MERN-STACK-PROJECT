// AI Tourist Assistant Controller for ExploreX

const SYSTEM_INSTRUCTION = `You are ExploreX AI Tourist Assistant, a world-class travel guide and vacation planning expert.
Your mission is to help travelers discover incredible destinations, uncover hidden gems, plan budget-friendly day-by-day itineraries, learn about local history and culture, and prepare with essential travel tips and packing checklists.

Guidelines:
- Provide structured, practical, and inspiring answers using clean Markdown (bold titles, bullet points, numbered days for itineraries).
- Include estimated budgets (in INR ₹ and USD $) when discussing trips or planning.
- Highlight the best time to visit, key attractions, local food, and safety tips where relevant.
- Keep responses friendly, engaging, and easy to read.`;

// Check if Gemini API is configured
const getAIStatus = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const isConfigured = Boolean(apiKey && apiKey !== "your_gemini_api_key_here");

  res.status(200).json({
    configured: isConfigured,
    provider: "Google Gemini",
    model: "gemini-1.5-flash",
  });
};

// Chat with AI Assistant
const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // If no API key is provided, clearly inform the client without pretending
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return res.status(200).json({
        success: false,
        configured: false,
        message:
          "Gemini API key is not configured in backend/.env. Please add GEMINI_API_KEY=your_key to backend/.env and restart the server to enable live AI responses.",
      });
    }

    // Format chat history for Gemini API
    const formattedContents = [];

    if (Array.isArray(history)) {
      // Keep up to the last 10 messages for context
      const recentHistory = history.slice(-10);
      for (const item of recentHistory) {
        if (item.text && item.role) {
          formattedContents.push({
            role: item.role === "assistant" || item.role === "model" ? "model" : "user",
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Append the current user message
    formattedContents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents: formattedContents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1500,
      },
    };

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      const errorMessage =
        data.error?.message || `Gemini API returned status ${response.status}`;

      return res.status(502).json({
        success: false,
        message: `Gemini API error: ${errorMessage}`,
      });
    }

    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response for that. Please try asking again!";

    return res.status(200).json({
      success: true,
      configured: true,
      reply: replyText,
      isLiveAI: true,
    });
  } catch (error) {
    console.error("AI Controller error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An unexpected error occurred in the AI assistant.",
    });
  }
};

module.exports = {
  getAIStatus,
  chatWithAI,
};
