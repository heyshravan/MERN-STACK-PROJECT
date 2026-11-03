const {
  searchDestinations,
  getDestinationDetails,
} = require("../services/destinationService");

// Search destinations (hybrid: MongoDB + Global)
const searchDestinationsController = async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q.trim()) {
      return res.status(200).json([]);
    }

    const results = await searchDestinations(q);
    res.status(200).json(results);
  } catch (error) {
    console.error("Search destinations controller error:", error);
    res.status(500).json({ message: error.message || "Failed to search destinations" });
  }
};

// Get rich destination dossier
const getDestinationDetailsController = async (req, res) => {
  try {
    const q = req.query.q || req.query.slug || "";
    if (!q.trim()) {
      return res.status(400).json({ message: "Destination query or slug is required." });
    }

    const details = await getDestinationDetails(q);
    res.status(200).json(details);
  } catch (error) {
    console.error("Get destination details controller error:", error);
    res.status(404).json({ message: error.message || "Destination not found." });
  }
};

// Multilingual Translation Controller (Gemini API or Linguistic dictionary)
const translateDestinationController = async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    if (!text || !targetLang) {
      return res.status(400).json({ message: "Text and targetLang are required." });
    }

    if (targetLang === "en") {
      return res.status(200).json({ translatedText: text, targetLang: "en" });
    }

    const langNames = {
      hi: "Hindi (हिन्दी)",
      bn: "Bengali (বাংলা)",
      te: "Telugu (తెలుగు)",
      ta: "Tamil (தமிழ்)",
      kn: "Kannada (ಕನ್ನಡ)",
      ml: "Malayalam (മലയാളം)",
      es: "Spanish (Español)",
      fr: "French (Français)",
    };

    const targetLangName = langNames[targetLang] || targetLang;
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // If Gemini API is configured, use it for high-accuracy contextual translation
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const prompt = `Translate the following travel guide text accurately into ${targetLangName}. 
Preserve technical place names, proper nouns, monuments, numbers, and currency symbols (₹, $). 
Return ONLY the translated text without commentary or prefixes:

${text}`;

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (translated) {
          return res.status(200).json({ translatedText: translated, targetLang });
        }
      }
    }

    // Fallback: return original text if translation service unavailable
    return res.status(200).json({ translatedText: text, targetLang, fallback: true });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ message: error.message || "Translation failed." });
  }
};

module.exports = {
  searchDestinationsController,
  getDestinationDetailsController,
  translateDestinationController,
};
