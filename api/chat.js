export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid payload: messages array is required.' });
        }

        // 2. Fetch response from Groq API using Environment Variable
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                max_tokens: 250,
                messages: messages
            })
        });

        const data = await response.json();

        // 3. Send Groq response back to frontend (ai.js)
        return res.status(200).json(data);

    } catch (error) {
        console.error("Vercel Serverless Function Error:", error);
        return res.status(500).json({ error: "Server Internal Error" });
    }
                  }
