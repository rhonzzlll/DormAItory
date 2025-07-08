import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2 } from 'lucide-react';

const AdminChatbot = () => {
    const userId = localStorage.getItem("_id");
    const [chatroomId, setChatroomId] = useState(undefined);
    const [messages, setMessages] = useState([]); // Initialize to an empty array
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            setTimeout(() => messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight, 10);
        }
    };

    const handleSend = async (text = input) => {
        if (text.trim()) {
            const newMessage = { sender: userId, receiver: "67473e746fe5733808401154", content: text };

            setMessages(prev => [...prev, newMessage]);

            setInput('');
            setIsTyping(true);

            scrollToBottom();

            try {
                const req = await fetch(`http://localhost:8080/api/chat/message/send/${chatroomId}?admin=true`, {
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
                    setMessages(prev => [...prev, { sender: '673349dfb3adad07a8d18919', receiver: userId, content: res.data?.response || 'No response' }]);
                    setIsTyping(false);
                    scrollToBottom();
                }, 1500);
            } catch (error) {
                console.error('Error sending message:', error);
                setIsTyping(false);
            }
        }
    };

    const handleDelete = () => {
        setMessages([]);
    };

    useEffect(() => {
        const fetchChatroomId = async () => {
            const otherId = "673349dfb3adad07a8d18919";

            try {
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
            } catch (error) {
                console.error('Error fetching chatroom or messages:', error);
            }
        };

        fetchChatroomId();
    }, [userId]);

    return (
        <div className="max-w-4xl mx-auto my-2 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-teal-600 p-4 flex items-center justify-between text-white">
                <h2 className="text-2xl font-bold">DormBot</h2>
                <p className="text-sm">Your Dorm Assistant</p>
            </div>

            <div ref={messagesEndRef} className="h-[26rem] overflow-y-auto p-4 bg-gray-100">
                {messages.length > 0 ? messages.map((message, index) => {
                    const isUser = message.sender === userId;
                    const isBot = message.sender === "673349dfb3adad07a8d18919";
                    return (
                        <div
                            key={index}
                            className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            {isBot ? (
                                <div
                                    className={`p-3 rounded-lg w-full bg-white text-black mr-8 whitespace-pre-line`}
                                    style={{ wordBreak: "break-word" }}
                                    dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, "<br/>") }}
                                />
                            ) : (
                                <div
                                    className={`p-3 rounded-lg w-full bg-blue-500 text-white ml-8 whitespace-pre-line`}
                                    style={{ wordBreak: "break-word" }}
                                >
                                    {message.content}
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="w-full h-full flex justify-center items-center">
                        <p className="text-gray-500">Start chatting</p>
                    </div>
                )}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-300 text-black p-3 rounded-lg w-full mr-8">
                            DormBot is typing...
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-200">
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
                        className="bg-teal-600 text-white p-2 hover:bg-teal-700 transition-colors"
                        disabled={isTyping}
                    >
                        <Send size={20} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-600 text-white p-2 rounded-r-lg hover:bg-red-700 transition-colors ml-2"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminChatbot;