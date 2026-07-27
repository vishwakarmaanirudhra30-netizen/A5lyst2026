console.log("✅ ai.js file loaded successfully!");

// 1. Declare Global Variables at the VERY TOP (Outside any function/event)
var customQA = JSON.parse(localStorage.getItem('a5_custom_qa')) || [];
var documentContext = localStorage.getItem('a5_document_context') || "";

// 2. Strict System Context
const A5LYST_CONTEXT = `
[IDENTITY & TONE]
1. IDENTITY: You are A5, the official AI assistant for A5lyst.in.
2. TONE & STYLE: Speak in smooth, natural Hinglish. Talk like a real, smart human teammate. Keep your answers natural, helpful, and crisp (2 to 4 sentences maximum).

[FOUNDER & RESPECT RULES]
1. FOUNDER: Anirudh is the founder and creator of A5lyst.in, and he built you (A5).
2. STRICT RESPECT (NO "SIR"): Always refer to him as "Anirudh" (do not use "Sir"), BUT you MUST ALWAYS use highly respectful Hindi grammar for him (e.g., "unhone", "unka", "hamare founder hain", "woh lead karte hain"). 
3. BANNED WORDS: NEVER use informal, casual, or disrespectful words for Anirudh like "usne", "mera founder", "karta hai", "usko".

[A5LYST COMPANY DETAILS & SERVICES]
- About: A5lyst.in is a complete digital agency that helps brands and businesses grow online.
- Services Provided: Custom Web Development, UI/UX Design, Full-Stack AI Integrations (like AI chatbots), Digital Branding, Content Creation, and end-to-end Software Solutions.

[A5LYST CORE TEAM]
When asked about the team, A5lyst, or specific roles, use this exact information:
- Anirudh (Strategy Lead & Founder): Idea development, client communication, growth planning, tech, frontend web, and overall brand direction.
- Anurag (Editor): Reel editing, content polishing, creative execution, and research.
- Harsh (Creative Editor & Content Strategist): Aesthetic edits, content improvement suggestions, captions, research, and engagement ideas.
- Aryan (Media & Production Head): School visits, video shoots, photography, and raw content collection.
`;




document.addEventListener('DOMContentLoaded', () => {
    
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const trainerToggleBtn = document.getElementById('trainerToggleBtn');
    const trainerPanel = document.getElementById('trainerPanel');
    const closeTrainer = document.getElementById('closeTrainer');
    const adminKeyInput = document.getElementById('adminKeyInput');
    const trainerStatus = document.getElementById('trainerStatus');
    const trainedList = document.getElementById('trainedList');
    const ADMIN_KEY = "Anirudh"; // Kept Anirudh as the admin key

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        msgDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function checkLocalMemory(query) {
        const lowerQuery = query.toLowerCase();
        for (let item of customQA) {
            if (lowerQuery.includes(item.question.toLowerCase())) {
                return item.answer;
            }
        }
        return null;
    }

    // 🚀 VERCEL BACKEND FETCH (Replaced config.js direct fetch)
    async function fetchAIResponse(userQuery) {
        try {
            // We now call the local /api/chat route provided by Vercel
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: `${A5LYST_CONTEXT}\nDocument Context: ${documentContext.substring(0, 1500)}` },
                        { role: "user", content: userQuery }
                    ]
                })
            });

            if (!response.ok) {
                 const errData = await response.json();
                 console.error("Vercel API Error:", errData);
                 return "Sir/Ma'am, backend se connect karne me error aayi hai. Kripya thodi der baad try karein.";
            }

            const data = await response.json();
            
            if (data.error) {
                console.error("Groq Error from backend:", data.error);
                return `API Error: ${data.error.message || "Unknown error occurred"}`;
            }

            if (data.choices && data.choices.length > 0) {
                return data.choices[0].message.content;
            } else {
                return "I apologize, Sir/Ma'am, but I encountered an issue generating a response.";
            }
        } catch (error) {
            console.error("Fetch Exception:", error);
            return "System offline. Please check network connection.";
        }
    }

    // Main Handler 
    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        userInput.value = '';

        let responseText = checkLocalMemory(text);

        if (!responseText) {
            appendMessage("A5 is processing...", 'thinking');
            responseText = await fetchAIResponse(text);
            const thinkingMsg = document.querySelector('.thinking-message');
            if (thinkingMsg) thinkingMsg.remove();
        }

        appendMessage(responseText, 'assistant');
    }

    // Listeners
    if (sendBtn) sendBtn.addEventListener('click', handleSend);
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    // Brain Console Controls
    if (trainerToggleBtn) {
        trainerToggleBtn.addEventListener('click', () => {
            trainerPanel.classList.remove('hidden');
            renderTrainedList();
        });
    }

    if (closeTrainer) {
        closeTrainer.addEventListener('click', () => {
            trainerPanel.classList.add('hidden');
            trainerStatus.textContent = '';
        });
    }

    document.getElementById('trainSubmitBtn')?.addEventListener('click', () => {
        if (adminKeyInput.value !== ADMIN_KEY) {
            showTrainerStatus("Access Denied: Invalid Administrative Key.", true);
            return;
        }

        const q = document.getElementById('trainQuestionInput').value.trim();
        const a = document.getElementById('trainAnswerInput').value.trim();

        if (q && a) {
            customQA.push({ id: Date.now(), question: q, answer: a });
            localStorage.setItem('a5_custom_qa', JSON.stringify(customQA));
            document.getElementById('trainQuestionInput').value = '';
            document.getElementById('trainAnswerInput').value = '';
            showTrainerStatus("Knowledge injected successfully!");
            renderTrainedList();
        } else {
            showTrainerStatus("Please provide both a query and response.", true);
        }
    });

    function showTrainerStatus(msg, isError = false) {
        trainerStatus.textContent = msg;
        trainerStatus.style.color = isError ? "var(--danger-color)" : "var(--success-color)";
        setTimeout(() => trainerStatus.textContent = '', 3000);
    }

    function renderTrainedList() {
        trainedList.innerHTML = '';
        customQA.forEach(item => {
            const div = document.createElement('div');
            div.className = 'trained-item';
            div.innerHTML = `
                <div class="trained-item-info">
                    <strong>Q: ${item.question}</strong>
                    A: ${item.answer}
                </div>
                <button class="delete-q-btn" onclick="deleteQA(${item.id})">Del</button>
            `;
            trainedList.appendChild(div);
        });
    }

    window.deleteQA = function(id) {
        if (adminKeyInput.value !== ADMIN_KEY) {
            alert("Enter the Administrative Key to delete memory.");
            return;
        }
        customQA = customQA.filter(item => item.id !== id);
        localStorage.setItem('a5_custom_qa', JSON.stringify(customQA));
        renderTrainedList();
    };

    // PDF / TXT File Processing
    document.getElementById('trainFileBtn')?.addEventListener('click', async () => {
        if (adminKeyInput.value !== ADMIN_KEY) {
            showTrainerStatus("Access Denied: Invalid Administrative Key.", true);
            return;
        }

        const fileInput = document.getElementById('fileUploadInput');
        if (!fileInput.files.length) {
            showTrainerStatus("Please select a document first.", true);
            return;
        }

        const file = fileInput.files[0];
        showTrainerStatus("Processing document... Please wait.");

        try {
            let text = "";
            if (file.type === "text/plain") {
                text = await file.text();
            } else if (file.type === "application/pdf") {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(" ");
                }
            } else {
                showTrainerStatus("Unsupported file type. Use TXT or PDF.", true);
                return;
            }

            documentContext += `\n[Context from ${file.name}]: ${text}`;
            localStorage.setItem('a5_document_context', documentContext);
            showTrainerStatus("Document ingested successfully!");
            fileInput.value = '';

        } catch (error) {
            console.error("File processing error:", error);
            showTrainerStatus("Failed to process document.", true);
        }
    });
});
