// AI Tourist Assistant Controller for ExploreX
const destinationService = require("../services/destinationService");

const SYSTEM_INSTRUCTION = `You are ExploreX AI Tourist Assistant, a world-class travel guide and vacation planning expert.
Your mission is to help travelers discover incredible destinations, uncover hidden gems, plan realistic day-by-day itineraries, learn about local history and culture, and prepare with essential travel tips and packing checklists.

Strict Guidelines:
- Provide structured, practical, and inspiring answers using clean Markdown (bold titles, bullet points, numbered days for itineraries).
- Clearly distinguish verified factual destination information from estimates, general recommendations, and personal travel tips.
- Never invent or fabricate ticket prices, monument entry fees, exact operating hours, real-time transport schedules, or government restrictions. State estimates clearly as estimates.
- Include estimated budgets (in INR ₹ and USD $) only when asked or relevant to itinerary planning, clearly marking them as estimates.
- Highlight the best time to visit, key attractions, authentic regional cuisine, and practical safety advice.
- Keep responses friendly, engaging, concise, and easy to read.`;

// Factual offline synthesizer when Gemini API key is in standby
function generateContextualDossierReply(message, context, lang = "en") {
  const m = (message || "").toLowerCase();
  const title = context.title || "this destination";
  const type = context.type || "Tourist Destination";
  const weather = context.weather;
  const attractions = Array.isArray(context.attractions) ? context.attractions : [];
  const travel = context.travelInfo || {};
  const budget = context.budget || {};

  // 1. Itinerary planning query
  if (m.includes("itinerary") || m.includes("plan") || m.includes("3-day") || m.includes("day") || m.includes("schedule")) {
    const topPois = attractions.slice(0, 5).map((a) => a.name);
    return `### 🗺️ Recommended 3-Day Travel Itinerary for ${title}

*Note: Below is a realistic curated itinerary based on verified points of interest and geographic proximity.*

**Day 1: Heritage & Iconic Landmarks**
- **Morning:** Explore the primary historical and cultural highlights of **${title}**.
${topPois[0] ? `- **Afternoon:** Visit **${topPois[0]}**, soaking in the architecture and scenic viewpoints.` : "- **Afternoon:** Scenic walking tour around central cultural quarters."}
- **Evening:** Sunset walk around the waterfront or local bazaar; taste authentic regional snacks.

**Day 2: Cultural Exploration & Local Flavors**
${topPois[1] ? `- **Morning:** Excursion to **${topPois[1]}**; photography and guided cultural exploration.` : "- **Morning:** Local museums and heritage buildings."}
- **Lunch:** Sample authentic regional specialties and traditional cuisine.
${topPois[2] ? `- **Afternoon:** Tour **${topPois[2]}** and nearby artisan markets.` : "- **Afternoon:** Browse handicraft emporiums and textile shops."}
- **Evening:** Relaxing dinner at a traditional local dining establishment.

**Day 3: Nature, Panoramic Views & Leisure**
${topPois[3] ? `- **Morning:** Morning excursion to **${topPois[3]}** for photography and fresh air.` : "- **Morning:** Botanical gardens or scenic nature promenades."}
- **Afternoon:** Souvenir shopping for local crafts, spices, and keepsakes.
- **Evening:** Farewell sunset viewpoint and departure preparation.

*💡 Tip: Check locally for monument entry tickets and photography permits before visiting.*`;
  }

  // 2. Food & Cuisine query
  if (m.includes("food") || m.includes("cuisine") || m.includes("eat") || m.includes("dish") || m.includes("restaurant") || m.includes("taste")) {
    return `### 🍲 Authentic Culinary Guide for ${title}

${travel.localCuisine || `Exploring ${title} offers an authentic journey through rich regional culinary traditions.`}

**Must-Try Food Experiences:**
- **Regional Specialties:** Savor the most famous traditional cooked dishes celebrated across ${title}.
- **Street Food & Sweets:** Sample authentic artisanal sweets, aromatic herbal teas, and regional street foods from bustling local markets.
- **Dining Recommendations:** Look for busy dining spots patronized by local families, ensuring fresh ingredients and authentic heritage recipes.

*💡 Health Tip: Always prefer freshly prepared hot meals and filtered or bottled drinking water while traveling.*`;
  }

  // 3. Weather & Packing checklist query
  if (m.includes("weather") || m.includes("pack") || m.includes("clothes") || m.includes("climate") || m.includes("temperature")) {
    return `### 🌤️ Weather & Packing Checklist for ${title}

${weather ? `**Current Live Conditions:** ${weather.icon || "🌤️"} **${weather.temperature}°C**, ${weather.condition}. Humidity: ${weather.humidity}%, Wind: ${weather.windSpeed} km/h.\n**Advisory:** ${weather.advisory}` : `**Climate Overview:** ${travel.bestTime || "Pleasant seasonal conditions."}`}

**Recommended Packing Checklist:**
- Comfortable, durable walking shoes suitable for exploring heritage sites and cobblestone streets.
${weather && weather.temperature < 15 ? "- Thermal innerwear, fleece jacket, gloves, and warm woolen socks." : "- Breathable cotton clothes, UV-protection sunglasses, and wide-brim sunhat."}
${weather && weather.condition?.toLowerCase().includes("rain") ? "- Lightweight waterproof rain jacket or compact travel umbrella." : "- Lightweight windcheater or light cardigan for breezy evenings."}
- Universal power adapter, portable power bank, and camera with extra memory cards.
- Personal first-aid kit with prescribed medicines, hand sanitizer, and electrolyte sachets.`;
  }

  // 4. Budget & Cost query
  if (m.includes("budget") || m.includes("cost") || m.includes("price") || m.includes("expense") || m.includes("money") || m.includes("how much")) {
    return `### 💰 Estimated Travel Budget Guidelines for ${title}

*Note: The figures below are realistic daily estimates per person. Exact expenses depend on seasonality, booking time, and personal travel style.*

${budget.tiers ? budget.tiers.map((t) => `**${t.tier} (${t.dailyEstimateINR} / ${t.dailyEstimateUSD}):**\n- **Stay:** ${t.stay}\n- **Food:** ${t.food}\n- **Transit:** ${t.transport}`).join("\n\n") : "- Budget Traveler: ₹1,500 – ₹2,500 / day\n- Standard Explorer: ₹4,000 – ₹7,000 / day\n- Premium Luxury: ₹12,000 – ₹25,000+ / day"}

*💡 Money Saving Tip: Book accommodations and express transit tickets several weeks in advance for peak seasonal travel.*`;
  }

  // 5. History & Background query
  if (m.includes("history") || m.includes("culture") || m.includes("background") || m.includes("heritage") || m.includes("monument")) {
    return `### 🏛️ History & Cultural Significance of ${title}

${context.extract || `${title} is a world-renowned ${type} renowned for its historic significance and cultural heritage.`}

**Heritage Highlights:**
- **Significance:** Prominent cultural and historical legacy spanning centuries.
${attractions.length > 0 ? `- **Notable Historic Sites:** ${attractions.slice(0, 4).map((a) => a.name).join(", ")}.` : ""}
- **Preservation:** Travelers are encouraged to respect local customs, sacred precincts, and heritage architectural guidelines.`;
  }

  // 6. Safety & Transit query
  if (m.includes("safe") || m.includes("reach") || m.includes("transport") || m.includes("cab") || m.includes("taxi") || m.includes("airport") || m.includes("train")) {
    return `### 🛡️ Safety & Travel Transit Guide for ${title}

**How to Reach:**
- **Air:** ${travel.howToReach?.air || `Connected via regional and international airports.`}
- **Rail:** ${travel.howToReach?.rail || `Served by primary express and superfast rail networks.`}
- **Road:** ${travel.howToReach?.road || `Accessible via national expressways and state bus routes.`}

**Local Transit Options:**
${travel.localTransport || "City taxis, app-based ride hailing (Uber / Ola), metro rail, and auto-rickshaws."}

**Essential Safety Tips:**
${travel.safetyTips ? travel.safetyTips.map((tip) => `- ${tip}`).join("\n") : "- Keep digital copies of travel IDs.\n- Use authorized prepaid cabs or verified app rides.\n- Dress modestly at sacred shrines."}`;
  }

  // Default general overview answer
  return `### 🧭 Travel Guide Insights for ${title} (${type})

${context.extract || `${title} is an exceptional ${type} celebrated by travelers worldwide.`}

${weather ? `**Live Weather:** ${weather.icon || "🌤️"} ${weather.temperature}°C (${weather.condition})` : ""}
${attractions.length > 0 ? `**Top Nearby Attractions:** ${attractions.slice(0, 4).map((a) => a.name).join(", ")}` : ""}
${travel.bestTime ? `**Best Time to Visit:** ${travel.bestTime}` : ""}
${travel.recommendedDuration ? `**Recommended Duration:** ${travel.recommendedDuration}` : ""}

*Feel free to ask for a custom 3-day itinerary, must-try food recommendations, packing checklist, or budget advice!*`;
}

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

// Chat with AI Assistant (supports general chat + destination contextual chat)
const chatWithAI = async (req, res) => {
  try {
    const { message, history, destinationContext, language = "en" } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // Normalize destination context (if string was passed, auto-fetch full destination dossier)
    let activeContext = destinationContext;
    if (typeof destinationContext === "string" && destinationContext.trim()) {
      try {
        const details = await destinationService.getDestinationDetails(destinationContext.trim());
        if (details) {
          activeContext = details;
        } else {
          activeContext = { title: destinationContext.trim() };
        }
      } catch (err) {
        activeContext = { title: destinationContext.trim() };
      }
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    // If no API key is provided, provide authentic factual synthesis if activeContext exists
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      if (activeContext && activeContext.title) {
        const offlineReply = generateContextualDossierReply(message, activeContext, language);
        return res.status(200).json({
          success: true,
          configured: false,
          reply: offlineReply,
          isLiveAI: false,
          fallbackMode: true,
          note: "Synthesized from verified Destination Dossier (Gemini API key is in standby mode).",
        });
      }

      return res.status(200).json({
        success: false,
        configured: false,
        message:
          "Gemini API key is not configured in backend/.env. Please add GEMINI_API_KEY=your_key to backend/.env and restart the server to enable live AI responses.",
      });
    }

    // Build Context-Aware System Instruction
    let contextualSystemPrompt = SYSTEM_INSTRUCTION;

    if (activeContext && activeContext.title) {
      contextualSystemPrompt += `\n\nACTIVE DESTINATION CONTEXT:
Destination: ${activeContext.title} (${activeContext.type || "Tourist Destination"})
Subtitle: ${activeContext.subtitle || ""}
Factual Overview: ${activeContext.extract || ""}
Coordinates: ${activeContext.coordinates ? `Lat ${activeContext.coordinates.lat}, Lon ${activeContext.coordinates.lon}` : "N/A"}
Live Weather: ${activeContext.weather ? `${activeContext.weather.temperature}°C, ${activeContext.weather.condition}. Advisory: ${activeContext.weather.advisory}` : "Not available"}
Nearby Attractions (Verified via Geosearch): ${
        activeContext.attractions
          ? activeContext.attractions.map((a) => `${a.name} (~${a.distanceKm} km)`).join("; ")
          : "N/A"
      }
Best Time to Visit: ${activeContext.travelInfo?.bestTime || "Seasonal"}
Recommended Duration: ${activeContext.travelInfo?.recommendedDuration || "3-4 Days"}
How to Reach: Air: ${activeContext.travelInfo?.howToReach?.air || "N/A"}; Rail: ${activeContext.travelInfo?.howToReach?.rail || "N/A"}; Road: ${activeContext.travelInfo?.howToReach?.road || "N/A"}
Local Transport: ${activeContext.travelInfo?.localTransport || "N/A"}
Safety Tips: ${activeContext.travelInfo?.safetyTips?.join("; ") || "Standard precautions"}
Estimated Budget Tiers: ${
        activeContext.budget?.tiers
          ? activeContext.budget.tiers.map((t) => `${t.tier}: ${t.dailyEstimateINR} (${t.dailyEstimateUSD})`).join(" | ")
          : "Standard guidelines"
      }

FACTUAL INTEGRITY RULES:
1. Always base your advice on the verified facts above.
2. NEVER invent ticket fees, exact monument opening times, transport timetables, or imaginary flight routes.
3. Label budgets and itinerary recommendations clearly as realistic estimates.`;
    }

    if (language && language !== "en") {
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
      contextualSystemPrompt += `\n\nLANGUAGE REQUIREMENT: Respond fluently and helpfully in ${langNames[language] || language}. Keep proper nouns, monument names, place names, numbers, and currency symbols (₹, $) accurate and intact.`;
    }

    // Format chat history for Gemini API
    const formattedContents = [];

    if (Array.isArray(history)) {
      const recentHistory = history.slice(-8);
      for (const item of recentHistory) {
        if (item.text && item.role) {
          formattedContents.push({
            role: item.role === "assistant" || item.role === "model" ? "model" : "user",
            parts: [{ text: item.text }],
          });
        }
      }
    }

    formattedContents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: contextualSystemPrompt }],
      },
      contents: formattedContents,
      generationConfig: {
        temperature: 0.6,
        topP: 0.9,
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
      console.warn("Gemini API error, falling back to contextual dossier:", data);
      if (destinationContext && destinationContext.title) {
        const fallbackReply = generateContextualDossierReply(message, destinationContext, language);
        return res.status(200).json({
          success: true,
          configured: true,
          reply: fallbackReply,
          isLiveAI: false,
          fallbackMode: true,
          note: `Gemini API returned error (${data.error?.message || response.status}). Served verified Destination Dossier.`,
        });
      }

      return res.status(502).json({
        success: false,
        message: `Gemini API error: ${data.error?.message || response.status}`,
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
