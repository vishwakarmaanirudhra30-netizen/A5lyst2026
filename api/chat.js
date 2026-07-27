import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// System Context (Optimized for Tokens & Natural Tone)
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
  // 1. Method check
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request. 'messages' array is required." });
    }

    // 💡 TOKEN OPTIMIZATION 1: Smart History Slicing
    // Sirf last 6 messages (3 turns of conversation) bhejenge.
    // Isse purani chat ki saari context memory rehti hai, lekin hazaron purane tokens waste nahi hote.
    const recentHistory = messages.slice(-6);

    // 💡 TOKEN OPTIMIZATION 2: Inject System Prompt dynamically at index 0
    const fullPayload = [
      { role: "system", content: A5LYST_CONTEXT },
      ...recentHistory
    ];

    // 2. Primary Model: llama-3.3-70b-versatile (Smartest)
    try {
      const completion = await groq.chat.completions.create({
        messages: fullPayload,
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
        max_tokens: 300, // Response length limit taaki output token waste na ho
      });

      return res.status(200).json({ reply: completion.choices[0].message.content });

    } catch (primaryError) {
      console.warn("Primary 70B model busy/limit hit. Switching to 8B Instant fallback...", primaryError.message);

      // 3. Fallback Model: llama-3.1-8b-instant (Super Fast & Massive Limits)
      const fallbackCompletion = await groq.chat.completions.create({
        messages: fullPayload,
        model: "llama-3.1-8b-instant",
        temperature: 0.6,
        max_tokens: 300,
      });

      return res.status(200).json({ reply: fallbackCompletion.choices[0].message.content });
    }

  } catch (error) {
    console.error("Chat API Error:", error);
    return res.status(500).json({ error: "Server busy hai, please thodi der baad try karein." });
  }
}
