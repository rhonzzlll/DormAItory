import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';

const DormBot = () => {
    const userId = localStorage.getItem("_id");
    const [chatroomId, setChatroomId] = useState(undefined);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [prompts, setPrompts] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
            }
        }, 10);
    };

    const handleSend = async (text = input) => {
        if (text.trim()) {
            const newMessage = { sender: userId, receiver: "67258d7c80b699eba26fcece", content: text };

            setMessages(prev => [...prev, newMessage]);
            
            setInput('');
            setIsTyping(true);

            scrollToBottom();

            const req = await fetch(`http://localhost:8080/api/chat/message/send/${chatroomId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    sender: localStorage.getItem("_id"),
                    receiver: "673349dfb3adad07a8d18919",
                    content: text
                })
            });
            const res = await req.json();

            setTimeout(() => {
                setMessages(prev => [...prev, { sender: '673349dfb3adad07a8d18919', receiver: userId, content: res.data.response }]);
                setIsTyping(false);
                scrollToBottom();
            }, 1500);
        }
    };

    const handleClear = () => {
        setMessages([]);
        setIsTyping(false);
    };

    useEffect(() => {
        const fetchPrompts = async () => {
            try {
                const req = await fetch("http://localhost:8080/api/chat/prompts", {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                });
                const res = await req.json();

                setPrompts(res.data.prompts);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchChatroomId = async () => {
            const otherId = "67258d7c80b699eba26fcece";

            const c_req = await fetch("http://localhost:8080/api/chat/chatroom", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId,
                    otherId
                })
            });
            const c_res = await c_req.json();

            const chatroomId = c_res["data"].chatroomId;

            if (c_req.status === 200) {
                setChatroomId(chatroomId);
            }

            const m_req = await fetch(`http://localhost:8080/api/chat/messages/${chatroomId}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });
            const m_res = await m_req.json();

            setMessages(m_res["data"].messages ?? []);

            scrollToBottom();
        };
        
        fetchPrompts();
        fetchChatroomId();
    }, []);

    return (
        <div className="max-w-2xl mx-auto my-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-teal-600 p-4 flex items-center justify-between text-white">
                <h2 className="text-2xl font-bold">DormBot</h2>
                <p className="text-sm">Your Dorm Assistant</p>
            </div>

            <div ref={messagesEndRef} className="h-96 overflow-y-auto p-4 bg-gray-100">
                {messages.length > 0 ? messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 flex ${message.sender === userId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`p-3 rounded-lg max-w-xs ${message.sender === userId ? 'bg-blue-500 text-white' : 'bg-white text-black'
                            }`}>
                            {message.content}
                        </div>
                    </div>
                )) : (
                    <div className="w-full h-full flex justify-center items-center">
                        <svg className="text-teal-700" xmlns="http://www.w3.org/2000/svg" width="4rem" height="4rem" viewBox="0 0 24 24"><path fill="currentColor" d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"><animateTransform attributeName="transform" dur="0.75s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></svg>
                    </div>
                )}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-300 text-black p-3 rounded-lg max-w-xs">
                            DormBot is typing...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-200">
                <div className="flex flex-wrap gap-2 mb-2">
                    {prompts.slice(0, 4).map((prompt, index) => (
                        <button
                            key={index}
                            onClick={() => handleSend(prompt.query)}
                            className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm hover:bg-teal-700 transition-colors"
                            disabled={isTyping}
                        >
                            {prompt.query}
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
                        disabled={isTyping}
                    />
                    <button
                        onClick={() => handleSend()}
                        className="bg-teal-600 text-white p-2 rounded-r-lg hover:bg-teal-700 transition-colors"
                        disabled={isTyping}
                    >
                        <Send size={20} />
                    </button>
                    <button
                        onClick={handleClear}
                        className="bg-red-600 text-white p-2 rounded-r-lg hover:bg-red-700 transition-colors ml-2"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DormBot;