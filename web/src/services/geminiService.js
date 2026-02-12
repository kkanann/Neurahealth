// Gemini AI Service for Health Assistant
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const HEALTH_ASSISTANT_PROMPT = `You are NeuraHealth AI Assistant, a helpful and empathetic medical information assistant. Your role is to:

1. Provide preliminary health information and guidance based on symptoms
2. Offer general wellness and preventive health advice
3. Help users understand when to seek immediate medical attention
4. Suggest nearby healthcare facilities when asked
5. Provide emergency helpline information when needed

IMPORTANT GUIDELINES:
- Always include a disclaimer that you're not a replacement for professional medical advice
- For serious symptoms (chest pain, difficulty breathing, severe bleeding, etc.), immediately advise seeking emergency care
- Be empathetic and supportive in your responses
- Keep responses concise but informative (2-4 paragraphs max)
- If asked about nearby hospitals/doctors, acknowledge the request and mention that location services will help find them
- Never diagnose definitively - use phrases like "could indicate", "might be", "commonly associated with"
- Encourage users to consult healthcare professionals for proper diagnosis

Respond in a friendly, professional, and caring tone.`;

export const sendMessageToGemini = async (message, conversationHistory = []) => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.');
    }

    try {
        // Build conversation context
        const context = conversationHistory.length > 0
            ? conversationHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n')
            : '';

        const fullPrompt = `${HEALTH_ASSISTANT_PROMPT}\n\nConversation History:\n${context}\n\nUser: ${message}\n\nAssistant:`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        console.log('📤 Sending request to Gemini API...');

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Gemini API Error Response:', errorData);
            throw new Error(errorData.error?.message || 'Failed to get response from Gemini AI');
        }

        const data = await response.json();
        console.log('📥 Gemini API Response:', data);

        if (!data.candidates || data.candidates.length === 0) {
            console.error('❌ No candidates in response:', data);
            throw new Error('No response generated from Gemini AI');
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        console.log('✅ AI Response extracted:', aiResponse.substring(0, 100) + '...');
        return aiResponse;

    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        throw error;
    }
};

// Check if message is asking for location-based services
export const isLocationRequest = (message) => {
    const locationKeywords = [
        'nearby', 'near me', 'closest', 'find hospital', 'find doctor',
        'find clinic', 'find pharmacy', 'around me', 'in my area',
        'local hospital', 'local doctor', 'emergency room near'
    ];

    const lowerMessage = message.toLowerCase();
    return locationKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Check if message is asking for emergency helplines
export const isEmergencyRequest = (message) => {
    const emergencyKeywords = [
        'emergency', 'helpline', 'ambulance', 'emergency number',
        'crisis', 'urgent help', 'emergency contact', 'call for help',
        'poison control', 'suicide hotline', 'mental health crisis'
    ];

    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Extract city name from location request
export const extractCityFromMessage = (message) => {
    const lowerMessage = message.toLowerCase();

    // Patterns to match city names
    const patterns = [
        /(?:in|near|around)\s+([a-z\s]+?)(?:\s|$|,)/i,  // "in bhopal", "near delhi"
        /(?:hospitals?|doctors?|clinics?)\s+(?:in|at|near)\s+([a-z\s]+?)(?:\s|$|,)/i,  // "hospitals in mumbai"
        /find\s+(?:hospitals?|doctors?|clinics?)\s+([a-z\s]+?)(?:\s|$|,)/i  // "find hospitals bhopal"
    ];

    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            const cityName = match[1].trim();
            // Filter out common words that aren't cities
            const excludeWords = ['me', 'my', 'area', 'location', 'nearby', 'closest', 'the', 'a', 'an'];
            if (!excludeWords.includes(cityName.toLowerCase()) && cityName.length > 2) {
                return cityName;
            }
        }
    }

    return null;
};
