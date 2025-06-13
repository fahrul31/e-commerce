import React, { useState, useEffect, useRef } from "react";
import { Send, User, UserCheck } from "lucide-react";

const ChatComponent = ({ senderId, receiverId = 4, isAdmin = false }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    console.log("ChatComponent rendered with:", senderId, receiverId);

    // Auto scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                console.log(`Fetching messages for senderId=${senderId} & receiverId=${receiverId}`);
                const res = await fetch(`http://localhost:5000/api/messages?senderId=${senderId}&receiverId=${receiverId}`);

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Failed to fetch messages:", res.status, errorText);
                    return;
                }

                const data = await res.json();
                console.log("Fetched messages:", data);
                setMessages(data);
            } catch (error) {
                console.error("Error during fetch:", error);
            }
        };

        fetchMessages();
    }, [senderId, receiverId]);

    // WebSocket message handler
    useEffect(() => {
        if (!senderId || !receiverId) {
            console.warn("senderId or receiverId is undefined, WebSocket not created.");
            return;
        }

        const socket = new WebSocket(`ws://localhost:5000?senderId=${senderId}&receiverId=${receiverId}`);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log(senderId, receiverId);
            console.log("WebSocket connection established");
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received via WebSocket:", data);
            setMessages((prevMessages) => [...prevMessages, data]);
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
        };

        return () => {
            socket.close();
            setIsConnected(false);
        };
    }, [senderId, receiverId]);

    // Handle message send
    const handleSendMessage = () => {
        if (!message.trim() || !socketRef.current) return;

        const messageData = { senderId, receiverId, message };
        socketRef.current.send(JSON.stringify(messageData));
        console.log("Sending via WebSocket:", messageData);

        setMessage("");
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`chat-container bg-white/50 ${isAdmin
            ? 'h-full w-full bg-transparent min-h-full'
            : 'max-w-2xl mx-auto bg-gradient-to-br rounded-2xl shadow-lg'
            } overflow-hidden flex flex-col`}>
            {/* Header - Hide when admin */}
            {!isAdmin && (
                <div className="chat-header bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold">Chat dengan Admin</h3>
                            <div className="flex items-center space-x-2 text-sm opacity-90">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                <span>{isConnected ? 'Terhubung' : 'Terputus'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area - Full height for admin */}
            <div className={`chat-box overflow-auto bg-white/50  ${isAdmin
                ? 'flex-1 p-6 min-h-0'
                : 'p-4 max-h-[480px] backdrop-blur-sm'
                }`}>
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User size={24} className="text-gray-400" />
                        </div>
                        <p>Belum ada pesan. Mulai percakapan!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwnMessage = msg.user_id === senderId;
                        return (
                            <div key={index} className={`message mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isOwnMessage
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                    : 'bg-white shadow-md text-gray-800 rounded-bl-md border border-gray-100'
                                    } ${isAdmin ? 'lg:max-w-2xl' : ''}`}>
                                    {/* Show sender name and timestamp only when not admin */}
                                    {!isAdmin && (
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className={`text-xs font-medium ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                                {isOwnMessage ? "Anda" : "Admin"}
                                            </span>
                                            {msg.timestamp && (
                                                <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {/* When admin, show timestamp only on hover or always show timestamp */}
                                    {isAdmin && msg.timestamp && (
                                        <div className="flex justify-end mb-1">
                                            <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.contents}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`chat-input border-t border-gray-100 ${isAdmin ? 'bg-white p-6' : 'bg-white p-4'
                }`}>
                <div className="flex items-end space-x-3">
                    <div className="flex-1">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                            placeholder="Ketik pesan Anda..."
                            rows="1"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || !isConnected}
                        className="p-4 mb-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                    Tekan Enter untuk mengirim pesan
                </div>
            </div>
        </div>
    );
};

export default ChatComponent;