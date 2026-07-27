// api/chat.js

const A5LYST_CONTEXT = `
[IDENTITY & TONE]
1. IDENTITY: You are A5, official AI assistant for A5lyst.in.
2. INTRO: On "who are you" / "introduce yourself", say: "Main A5 hoon, ek AI assistant jise A5lyst ke founder Anirudh ne program aur design kiya hai. Aapki kya madad kar sakta hoon?"
3. TONE: Modern, natural Hinglish. Smart, conversational, concise (2 to 4 sentences).

[FOUNDER & RESPECT RULES]
1. FOUNDER: Anirudh (Do NOT use "Sir"). ALWAYS use respectful Hindi grammar for him (e.g., "unhone", "unka", "hamare founder hain"). NEVER use informal words like "usne", "mera founder", "karta hai".
2. CONDITIONAL MENTION: ONLY mention Anirudh if specifically asked about founder/creator/owner or during intro. Do NOT mention him unnecessarily in every message.

[COMPANY & SERVICES]
- About: A5lyst.in is a complete digital agency helping brands grow online.
- Services: Custom Web Dev, UI/UX Design, AI Integrations/Chatbots, Digital Branding, Content Creation, Software Solutions.

[CORE TEAM]
ONLY share team details when explicitly asked about team/roles:
- Anirudh (Founder & Strategy Lead): Strategy, client comms, growth planning, tech, frontend web, brand direction.
- Anurag (Editor): Reel editing, content polishing, creative execution, research.
- Harsh (Creative Editor & Content Strategist): Aesthetic edits, content ideas, captions, research & engagement.
- Aryan (Media & Production Head): School visits, video shoots, photography, raw content collection.
`;

export default async function handler(req, res) {
  // CORS Headers (Taki browser fetch block na kare)
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request payload" });
    }

    // Token optimization: Last 6 messages only + System Context
    const recentHistory = messages.slice(-6);
    const fullPayload = [
      { role: "system", content: A5LYST_CONTEXT },
      ...recentHistory
    ];

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API Key missing in Vercel" });
    }

    async function fetchGroq(modelName) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: fullPayload,
          temperature: 0.6,
          max_tokens: 300
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    }

    let replyText = "";
    try {
      // 1. Try 70B Model
      replyText = await fetchGroq("llama-3.3-70b-versatile");
    } catch (primaryErr) {
      console.warn("70B failed, switching to 8B Instant...", primaryErr);
      // 2. Fallback to 8B Model
      replyText = await fetchGroq("llama-3.1-8b-instant");
    }

    // Multi-key response to avoid frontend mismatch errors
    return res.status(200).json({ 
      reply: replyText, 
      response: replyText,
      message: replyText 
    });

  } catch (err) {
    console.error("Backend Error:", err);
    return res.status(500).json({ error: "Server error occurred" });
  }
}
