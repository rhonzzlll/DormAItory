import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const presetQuestions = [
    { id: 1, text: "What can DormBot do?" },
    { id: 2, text: "Where can I make a cash payment?" },
    { id: 3, text: "How do I request a repair?" },
    { id: 4, text: "Can I have visitors in my room?" },
];

const botResponses = {
    "what can dormbot do": "I can help you with various dorm-related queries, assist with maintenance requests, provide information about payments, and answer questions about dorm policies.",
    "where can i make a cash payment": "Cash payments can be made at the Bursar's Office located in the Administration Building. Their office hours are Monday to Friday, 9 AM to 4 PM.",
    "how do i request a repair": "To request a repair, please use the 'Maintenance Request' form on our dorm portal. Alternatively, you can contact the MLQU admin directly.",
    "can i have visitors in my room": "Yes, you can have visitors in your room. However, please refer to the dorm policy regarding visiting hours and overnight stays. All visitors must be signed in at the front desk.",
};

const DormBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = (text = input) => {
        if (text.trim()) {
            const newMessage = { text, sender: 'user' };
            setMessages(prev => [...prev, newMessage]);
            setInput('');
            setIsTyping(true);

            setTimeout(() => {
                const botResponse = botResponses[text.toLowerCase()] || "I'm sorry, I don't have specific information on that query. Please contact the MlQU admin for more detailed assistance.";
                setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
                setIsTyping(false);
            }, 1500);
        }
    };

    return (
        <div className="max-w-2xl mx-auto my-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-teal-600 p-4 flex items-center justify-between text-white">
                <h2 className="text-2xl font-bold">DormBot</h2>
                <p className="text-sm">Your Dorm Assistant</p>
            </div>

            <div className="h-96 overflow-y-auto p-4 bg-gray-100">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`p-3 rounded-lg max-w-xs ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-black'
                            }`}>
                            {message.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-300 text-black p-3 rounded-lg max-w-xs">
                            DormBot is typing...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-gray-200">
                <div className="flex flex-wrap gap-2 mb-2">
                    {presetQuestions.map((q) => (
                        <button
                            key={q.id}
                            onClick={() => handleSend(q.text)}
                            className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm hover:bg-teal-700 transition-colors"
                        >
                            {q.text}
                        </button>
                    ))}
                </div>
                <div className="flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 p-2 rounded-l-lg focus:outline-none"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={() => handleSend()}
                        className="bg-teal-600 text-white p-2 rounded-r-lg hover:bg-teal-700 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DormBot;