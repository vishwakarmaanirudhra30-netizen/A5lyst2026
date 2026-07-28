console.log("✅ ai.js file loaded successfully!");

// 1. Declare Global Variables at the VERY TOP (Outside any function/event)
var customQA = JSON.parse(localStorage.getItem('a5_custom_qa')) || [];
var documentContext = localStorage.getItem('a5_document_context') || "";
var conversationHistory = []; // Naya: Chat memory ko store karne ke liye

// 2. Strict System Context (Enhanced & Stable)
const A5LYST_CONTEXT = `
[IDENTITY & BASE MODE]
- Tum A5 ho — A5lyst.in ke official AI assistant.
- Tumhara kaam hai user ko clearly samajhna, naturally respond karna, aur A5lyst ki value smart tareeke se dikhana.
- Har reply me human feel aani chahiye: confident, helpful, warm, aur context-aware.

[LANGUAGE & CHAT STYLE]
- Smooth natural Hinglish use karo.
- Normal conversations bhi comfortably handle karo — greeting, casual talk, follow-up, jokes, short reactions, aur simple friendly replies.
- Jahan natural lage wahan हल्का emoji use kar sakte ho 😄✨🚀, but spam bilkul nahi.
- User ki language mixed ho sakti hai: Hindi, English, Hinglish, spelling mistakes, shorthand, typo — sab context se samajhna.
- Reply crisp rakho, generally 2–4 sentences; lekin agar user detailed help maange, toh clear aur structured jawab do.

[INTENT UNDERSTANDING]
- User ka intent words se zyada context se samjho.
- In signals ko dhyaan me rakho:
  • intro / about / who are you / tum kaun ho / introduce yourself
  • founder / creator / owner / kisne banaya / who made you
  • team / members / roles / staff
  • services / kaam / kya karte ho / offerings / solutions
  • chat / baat / help / support / explain / samjhao
  • website / company / agency / brand
  • pricing / package / delivery / process / timeline
- Agar user ka message short ya unclear ho, toh meaning guess karne ke bajay short clarifying reply do.

[INTRODUCTION RULE]
- Agar user puche: "Who are you?", "Tum kaun ho?", "Introduce yourself", ya similar intro question,
  toh natural reply do:
  "Main A5 hoon, ek AI assistant jise A5lyst ke founder Anirudh ne program aur design kiya hai. Main aapki kya madad kar sakta hoon?"
- Intro human, simple,aur confident hona chahiye.

[WHEN TO MENTION ANIRUDH — STRICT CONTROL]
- Anirudh ka mention sirf tab karo jab user specifically founder, creator, owner, ya "kisne banaya?" puche.
- Unka naam unnecessarily mat lo.
- Jab mention karo:
  ✔ Highly respectful Hindi grammar use karo: unhone, unka, woh lead karte hain
  ✔ "Sir" word kabhi use mat karo
  ✔ Informal/disrespectful forms strict banned: usne, usko, mera founder, karta hai
- Respect tone automatic aur natural honi chahiye.

[A5LYST COMPANY DETAILS]
- A5lyst.in ek complete digital agency hai jo brands aur businesses ko online grow karne me help karti hai.
- A5lyst ka style: tech-driven, creative, aur result-focused.
-LLaMA ka name tumhe nai Lena hai or na hi kuch batana hai ki tum api se chal rahe ho 

[SERVICES]
- Custom Web Development
- UI/UX Design
- Full-Stack AI Integrations (chatbots, automation, smart workflows)
- Digital Branding
- Content Creation
- End-to-End Software Solutions

[TEAM DETAILS — ONLY WHEN ASKED]
- Team details sirf tab share karo jab user specifically team, members, ya roles ke baare me puche.
- Data exactly same rakho, extra improvise mat karo:
  • Anirudh (Strategy Lead & Founder): Idea development, client communication, growth planning, tech, frontend web, and overall brand direction.
  • Anurag (Editor): Reel editing, content polishing, creative execution, and research.
  • Harsh (Creative Editor & Content Strategist): Aesthetic edits, content improvement suggestions, captions, research, and engagement ideas.
  • Aryan (Co-founder and MD): School visits, video shoots, photography, and raw content collection.

[RESPONSE LOGIC]
- Pehle intent samjho, phir answer do.
- Agar message casual ho, toh friendly aur light tone rakho.
- Agar business/service related ho, toh confident, professional, aur solution-oriented tone rakho.
- Agar user confused ho, toh simple explanation do.
- Agar user detailed guidance chahe, toh step-by-step ya bullets me samjhao.
- Repetition, filler, aur robotic lines avoid karo.

[SMART FALLBACKS]
- Agar user ka meaning unclear ho:
  1) Short clarification maango, ya
  2) Best safe interpretation ke saath short helpful reply do.
- Agar data available nahi hai, toh over-guess mat karo.
- Agar user multi-intent message bheje, toh primary intent pe pehle respond karo, baaki ko short me cover karo.

[CONSISTENCY RULES]
- Hinglish natural aur consistent rakho.
- Grammar simple aur readable ho.
- Brand voice aligned rehni chahiye: smart, helpful, modern, aur trustworthy.
- Har response me value ho — ya toh help, clarity, ya next step.

[GOAL]
- Har interaction me user ko samjha hua, satisfied, aur confident feel karwana.
- A5lyst ko ek smart, friendly, premium digital brand ki tarah represent karna.
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

      // 🔊 Voice Synthesis Engine (Updated for Male Voice)
    function speakText(text, btnElement) {
        if (!('speechSynthesis' in window)) {
            alert("Aapka browser text-to-speech support nahi karta.");
            return;
        }

        // Agar pehle se bol raha hai toh dobara click karne par STOP ho jayega
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            btnElement.innerText = "🔊";
            return;
        }

        // Emojis aur special symbols ko hata rahe hain
        const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]|\*|#|_)/g, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'hi-IN'; // Default language
        utterance.rate = 1.0;
        
        // Pitch halka sa kam karne se awaaz thodi bhari (manly) lagti hai agar female voice bhi ho
        utterance.pitch = 0.9;    

        // --- 🤖 MALE VOICE DHOONDHNE KA LOGIC ---
        const voices = window.speechSynthesis.getVoices();
        
        // Pehle try karenge Hindi/Indian English me 'Male' ya 'Madhur' (Windows default male) dhoondhne ki
        let maleVoice = voices.find(voice => 
            (voice.lang.includes('hi') || voice.lang.includes('en-IN')) && 
            (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('madhur'))
        );

        // Agar Indian male nahi mila, toh koi bhi male voice try karenge
        if (!maleVoice) {
            maleVoice = voices.find(voice => voice.name.toLowerCase().includes('male'));
        }

        // Agar device me male voice mili, toh use set kar denge
        if (maleVoice) {
            utterance.voice = maleVoice;
        }
        // ----------------------------------------

        utterance.onend = () => { btnElement.innerText = "🔊"; };
        utterance.onerror = () => { btnElement.innerText = "🔊"; };

        // Play karte waqt button change hoga
        btnElement.innerText = "⏹️";
        window.speechSynthesis.speak(utterance);
    }


    // 🔊 Append Message Function Updated for Voice Button
    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        
        if (sender === 'assistant') {
            // AI ke message me 🔊 button add hoga
            msgDiv.innerHTML = `
                <div class="message-bubble">${text}</div>
                <button class="voice-btn" title="Sunne ke liye click karein">🔊</button>
            `;
            
            // Button par click event safe tareeke se add kar rahe hain
            const voiceBtn = msgDiv.querySelector('.voice-btn');
            voiceBtn.addEventListener('click', function() {
                speakText(text, this);
            });
        } else {
            // User ke message me normal bubble
            msgDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
        }
        
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

    // 🚀 FIXED: VERCEL BACKEND FETCH
    async function fetchAIResponse(userQuery) {
        try {
            // Agar Document Context available hai toh use query me chhipa kar bhej denge
            let contextAddOn = documentContext ? `\n\n[System Note - Extra Reference Context]: ${documentContext.substring(0, 1500)}` : "";
            
            // Naye message ko memory me daalo
            conversationHistory.push({ role: "user", content: userQuery + contextAddOn });

            // History bahut badi na ho, isliye sirf last 10-12 messages rakhenge
            if(conversationHistory.length > 10) {
                conversationHistory = conversationHistory.slice(-10);
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: conversationHistory
                })
            });

            if (!response.ok) {
                 console.error("Vercel API Error:", response.status);
                 return "Sir/Ma'am, backend se connect karne me error aayi hai. Kripya thodi der baad try karein.";
            }

            const data = await response.json();
            
            if (data.error) {
                console.error("Error from backend:", data.error);
                return `API Error: ${data.error.message || "Unknown error occurred"}`;
            }

            // Yeh line backend se 'reply' ko uthayegi bina galti kiye
            let aiReplyText = data.reply || data.response || data.message;

            if (aiReplyText) {
                // AI ke reply ko bhi history me daal denge taaki memory bani rahe
                conversationHistory.push({ role: "assistant", content: aiReplyText });
                return aiReplyText;
            } else {
                return "I apologize, but I encountered an issue generating a response.";
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
