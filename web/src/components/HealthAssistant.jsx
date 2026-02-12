import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToGemini, isLocationRequest, isEmergencyRequest, extractCityFromMessage } from '../services/geminiService';
import { getUserLocation, searchNearbyHospitals, getEmergencyHelplines, getLocationName, geocodeCityName } from '../services/locationService';

const HealthAssistant = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hello! I\'m your NeuraHealth AI Assistant. I can help you with:\n\n• Symptom analysis and health guidance\n• Finding nearby hospitals and doctors\n• Emergency helpline information\n• General health questions\n\nHow can I assist you today?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setError('');

        // Add user message
        const newUserMessage = {
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            // Check if it's a location-based request
            if (isLocationRequest(userMessage)) {
                await handleLocationRequest(userMessage);
                return;
            }

            // Check if it's an emergency helpline request
            if (isEmergencyRequest(userMessage)) {
                handleEmergencyRequest();
                return;
            }

            // Regular AI response
            const aiResponse = await sendMessageToGemini(userMessage, messages);

            const assistantMessage = {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to get response. Please try again.');

            const errorMessage = {
                role: 'assistant',
                content: `⚠️ I apologize, but I encountered an error: ${err.message}\n\nPlease try again or rephrase your question.`,
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLocationRequest = async (userMessage) => {
        try {
            // Check if user mentioned a specific city
            const cityName = extractCityFromMessage(userMessage);

            let location;
            let locationName;

            if (cityName) {
                // City-based search
                const statusMessage = {
                    role: 'assistant',
                    content: `🌍 Searching for hospitals in ${cityName}...`,
                    timestamp: new Date(),
                    isStatus: true
                };
                setMessages(prev => [...prev, statusMessage]);

                // Geocode the city name
                location = await geocodeCityName(cityName);
                locationName = {
                    city: cityName,
                    state: '',
                    country: '',
                    displayName: location.displayName
                };
            } else {
                // GPS-based search
                const statusMessage = {
                    role: 'assistant',
                    content: '📍 Requesting your location... Please allow location access if prompted.',
                    timestamp: new Date(),
                    isStatus: true
                };
                setMessages(prev => [...prev, statusMessage]);

                // Get user location
                location = await getUserLocation();

                // Update status
                setMessages(prev => prev.map((msg, idx) =>
                    idx === prev.length - 1 && msg.isStatus
                        ? { ...msg, content: '🔍 Location acquired! Searching for nearby hospitals...' }
                        : msg
                ));

                locationName = await getLocationName(location.latitude, location.longitude);
            }

            // Update status for hospital search
            setMessages(prev => prev.map((msg, idx) =>
                idx === prev.length - 1 && msg.isStatus
                    ? { ...msg, content: '🔍 Searching for nearby hospitals...' }
                    : msg
            ));

            // Search nearby hospitals
            const hospitals = await searchNearbyHospitals(location.latitude, location.longitude);

            // Format location display
            const locationDisplay = cityName
                ? cityName.charAt(0).toUpperCase() + cityName.slice(1)  // Capitalize city name
                : `${locationName.city}${locationName.state ? ', ' + locationName.state : ''}`;

            let responseContent = `📍 **Location**: ${locationDisplay}\n\n`;

            if (hospitals.length === 0) {
                responseContent += '❌ No hospitals found in this area.\n\n';
                responseContent += '**Try:**\n';
                responseContent += '• Searching for a nearby major city\n';
                responseContent += '• Using "Emergency helplines" for immediate assistance\n';
                responseContent += '• Checking Google Maps manually';
            } else {
                responseContent += `🏥 **Found ${hospitals.length} healthcare facilities:**\n\n`;

                hospitals.forEach((hospital, index) => {
                    responseContent += `**${index + 1}. ${hospital.name}**\n`;
                    responseContent += `   • Type: ${hospital.type}\n`;
                    responseContent += `   • Distance: ${hospital.distance} km\n`;
                    responseContent += `   • Address: ${hospital.address}\n`;
                    if (hospital.phone !== 'N/A') {
                        responseContent += `   • Phone: ${hospital.phone}\n`;
                    }
                    if (hospital.emergency) {
                        responseContent += `   • ⚡ Emergency services available\n`;
                    }
                    responseContent += '\n';
                });
            }

            // Replace status message with final result
            setMessages(prev => prev.map((msg, idx) =>
                idx === prev.length - 1 && msg.isStatus
                    ? {
                        role: 'assistant',
                        content: responseContent,
                        timestamp: new Date(),
                        type: 'location'
                    }
                    : msg
            ));

        } catch (err) {
            console.error('Location error:', err);

            // Build helpful error message based on error type
            let errorContent = `⚠️ **Unable to Find Nearby Hospitals**\n\n`;

            if (err.message.includes('mapping services are currently unavailable')) {
                errorContent += '🔧 **Service Temporarily Unavailable**\n\n';
                errorContent += 'The hospital mapping services are experiencing high traffic or maintenance.\n\n';
                errorContent += '**What you can do:**\n';
                errorContent += '• Try again in a few minutes\n';
                errorContent += '• Use the "Emergency helplines" button for immediate assistance\n';
                errorContent += '• Search manually on Google Maps for "hospitals near me"\n';
            } else if (err.message.includes('permission') || err.message.includes('denied')) {
                errorContent += '🔒 **Location Permission Required**\n\n';
                errorContent += err.message + '\n\n';
                errorContent += '**How to enable location:**\n';
                errorContent += '1. Click the lock icon 🔒 in your browser address bar\n';
                errorContent += '2. Set "Location" to "Allow"\n';
                errorContent += '3. Refresh the page and try again\n';
            } else {
                errorContent += err.message + '\n\n';
                errorContent += '**Troubleshooting:**\n';
                errorContent += '• Check your internet connection\n';
                errorContent += '• Enable location services in system settings\n';
                errorContent += '• Try refreshing the page (Ctrl+Shift+R)\n';
            }

            const errorMessage = {
                role: 'assistant',
                content: errorContent,
                timestamp: new Date(),
                isError: true
            };

            // Replace status message with error, or add new error message
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.isStatus) {
                    return prev.map((msg, idx) =>
                        idx === prev.length - 1 ? errorMessage : msg
                    );
                }
                return [...prev, errorMessage];
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmergencyRequest = () => {
        const helplines = getEmergencyHelplines('india'); // Default to India, can be made dynamic

        let responseContent = `🚨 **Emergency Helplines - ${helplines.country}**\n\n`;
        responseContent += '⚠️ **If this is a life-threatening emergency, call immediately!**\n\n';

        helplines.helplines.forEach(helpline => {
            responseContent += `**${helpline.name}**: ${helpline.number}\n`;
            responseContent += `   ${helpline.description}\n\n`;
        });

        responseContent += '\n💡 **When to call emergency services:**\n';
        responseContent += '• Chest pain or difficulty breathing\n';
        responseContent += '• Severe bleeding or injuries\n';
        responseContent += '• Loss of consciousness\n';
        responseContent += '• Severe allergic reactions\n';
        responseContent += '• Stroke symptoms (face drooping, arm weakness, speech difficulty)\n';

        const assistantMessage = {
            role: 'assistant',
            content: responseContent,
            timestamp: new Date(),
            type: 'emergency'
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
    };

    const handleQuickAction = (action) => {
        setInputMessage(action);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            {
                role: 'assistant',
                content: '👋 Chat cleared! How can I assist you today?',
                timestamp: new Date()
            }
        ]);
        setError('');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '600px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px solid var(--color-glass-border)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '1.25rem',
                borderBottom: '1px solid var(--color-glass-border)',
                background: 'rgba(79, 70, 229, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🤖 NeuraHealth AI Assistant
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Powered by Google Gemini
                    </p>
                </div>
                <button
                    onClick={clearChat}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid var(--color-glass-border)',
                        borderRadius: '8px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                    Clear Chat
                </button>
            </div>

            {/* Quick Actions */}
            <div style={{
                padding: '0.75rem 1.25rem',
                borderBottom: '1px solid var(--color-glass-border)',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                background: 'rgba(0,0,0,0.2)'
            }}>
                {['Find nearby hospitals', 'Emergency helplines', 'I have a headache', 'Wellness tips'].map(action => (
                    <button
                        key={action}
                        onClick={() => handleQuickAction(action)}
                        style={{
                            padding: '0.4rem 0.8rem',
                            background: 'rgba(79, 70, 229, 0.2)',
                            border: '1px solid rgba(79, 70, 229, 0.3)',
                            borderRadius: '20px',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(79, 70, 229, 0.3)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(79, 70, 229, 0.2)'}
                    >
                        {action}
                    </button>
                ))}
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <div style={{
                            maxWidth: '75%',
                            padding: '0.875rem 1.125rem',
                            borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: message.role === 'user'
                                ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                                : message.isError
                                    ? 'rgba(239, 68, 68, 0.15)'
                                    : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${message.role === 'user' ? 'transparent' : 'var(--color-glass-border)'}`,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '0.95rem',
                            lineHeight: '1.6'
                        }}>
                            {message.content}
                            <div style={{
                                fontSize: '0.7rem',
                                marginTop: '0.5rem',
                                opacity: 0.6,
                                textAlign: 'right'
                            }}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            padding: '0.875rem 1.125rem',
                            borderRadius: '16px 16px 16px 4px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--color-glass-border)'
                        }}>
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                <div className="typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', animation: 'typing 1.4s infinite' }}></div>
                                <div className="typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', animation: 'typing 1.4s infinite 0.2s' }}></div>
                                <div className="typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', animation: 'typing 1.4s infinite 0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Error Display */}
            {error && (
                <div style={{
                    padding: '0.75rem 1.25rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    borderTop: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    fontSize: '0.85rem'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Input */}
            <div style={{
                padding: '1.25rem',
                borderTop: '1px solid var(--color-glass-border)',
                background: 'rgba(0,0,0,0.2)'
            }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me about your health concerns..."
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: '0.875rem 1.125rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--color-glass-border)',
                            borderRadius: '12px',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.95rem'
                        }}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        style={{
                            padding: '0.875rem 1.75rem',
                            background: isLoading || !inputMessage.trim()
                                ? 'rgba(79, 70, 229, 0.3)'
                                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            opacity: isLoading || !inputMessage.trim() ? 0.5 : 1
                        }}
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>
                <p style={{
                    margin: '0.75rem 0 0 0',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center'
                }}>
                    ⚠️ This AI assistant provides general information only. Always consult healthcare professionals for medical advice.
                </p>
            </div>

            <style>{`
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-10px); }
        }
      `}</style>
        </div>
    );
};

export default HealthAssistant;
