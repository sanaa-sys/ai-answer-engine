"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";

type Message = {
    role: "user" | "system";
    content: string;
    timestamp: Date;
};

export default function Home() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "system", content: "Hello! How can I help you today?", timestamp: new Date() },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!message.trim()) return;

        // Add user message to the conversation
        const userMessage: Message = { role: "user", content: message, timestamp: new Date() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setMessage("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Something went wrong");
            }

            const data = await response.json();

            if (data && data.response) {
                const aiMessage: Message = { role: "system", content: data.response, timestamp: new Date() };
                setMessages(prev => [...prev, aiMessage]);
            } else {
                throw new Error("Unexpected response format");
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage: Message = {
                role: "system",
                content: "I'm sorry, but I encountered an error. Please try again or contact support if the problem persists.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Header */}
            <div className="w-full bg-gray-800 border-b border-gray-700 p-4 ">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-xl font-semibold text-white">Chat</h1>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto pb-32 pt-4">
                <div className="max-w-3xl mx-auto px-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex gap-4 mb-6 ${msg.role === "system" ? "justify-start" : "justify-end flex-row-reverse"}`}
                        >
                            <div className="flex flex-col">
                                <div
                                    className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.role === "system"
                                        ? "bg-gray-800 border border-gray-700 text-gray-100"
                                        : "bg-cyan-600 text-white"
                                        }`}
                                >
                                    <div className="font-medium mb-1">
                                        {msg.role === "system" ? "AI Assistant:" : "You:"}
                                    </div>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                                <div
                                    className={`text-xs mt-1 ${msg.role === "system" ? "text-left" : "text-right"
                                        } text-gray-400`}
                                >
                                    {format(msg.timestamp, "MMM d, yyyy HH:mm")}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-gray-400 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <div className="px-4 py-2 rounded-2xl bg-gray-800 border border-gray-700 text-gray-100">
                                <div className="font-medium mb-1">AI Assistant</div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 w-full bg-gray-800 border-t border-gray-700 p-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex gap-3 items-center">
                        <input
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyPress={e => e.key === "Enter" && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading}
                            className="bg-cyan-600 text-white px-5 py-3 rounded-xl hover:bg-cyan-700 transition-all disabled:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Sending..." : "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}