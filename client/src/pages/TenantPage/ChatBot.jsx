import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

const DormBot = () => {
    const userId = localStorage.getItem("_id");
    const [chatroomId, setChatroomId] = useState(undefined);
    const [messages, setMessages] = useState(undefined);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [prompts, setPrompts] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight, 10);
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
                    receiver: "67258d7c80b699eba26fcece",
                    content: text
                })
            });
            const res = await req.json();

            setTimeout(() => {
                setMessages(prev => [...prev, { sender: '67258d7c80b699eba26fcece', receiver: userId, content: res.data.response }]);
                setIsTyping(false);
            }, 1500);
        }
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
                {messages ? messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-4 flex ${message.sender === userId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`p-3 rounded-lg max-w-xs ${message.sender === userId ? 'bg-blue-500 text-white' : 'bg-white text-black'
                            }`}>
                            {message.content}
                        </div>
                    </div>
                )) : (<p>lol</p>)}
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
                    {prompts ? prompts.map((prompt, index) => (
                        <button
                            key={index}
                            onClick={() => handleSend(prompt.query)}
                            className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm hover:bg-teal-700 transition-colors"
                            disabled={isTyping}
                        >
                            {prompt.query}
                        </button>
                    )) : (<p>Hello world</p>)}
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
                </div>
            </div>
        </div>
    );
};

export default DormBot;