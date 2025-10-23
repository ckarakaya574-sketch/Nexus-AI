import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Sparkles } from 'lucide-react';
import type { ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import { MarkdownViewer } from './MarkdownViewer';

export const Chatbot: React.FC = () => {
    const [history, setHistory] = useState<ChatMessage[]>(() => {
        try {
            const savedHistory = localStorage.getItem('nexus_chatHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        } catch (error) {
            console.error("Sohbet geçmişi okunurken hata oluştu:", error);
            return [];
        }
    });
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        try {
            localStorage.setItem('nexus_chatHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Sohbet geçmişi kaydedilirken hata oluştu:", error);
        }
        scrollToBottom();
    }, [history]);

    const handleSend = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setHistory(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const chat = await geminiService.getChatSession();
            const result = await chat.sendMessageStream({ message: currentInput });
            
            let currentModelMessage = '';
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            for await (const chunk of result) {
                currentModelMessage += chunk.text;
                setHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: currentModelMessage + '▋' }] };
                    return newHistory;
                });
            }
             setHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: currentModelMessage }] };
                return newHistory;
            });


        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Üzgünüm, bir hatayla karşılaştım. Lütfen tekrar deneyin." }] };
            setHistory(prev => {
                const newHistory = [...prev];
                 // Replace the placeholder if it exists
                if (newHistory[newHistory.length - 1]?.parts[0]?.text === '') {
                    newHistory[newHistory.length - 1] = errorMessage;
                    return newHistory;
                }
                return [...newHistory, errorMessage];
            });
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {history.length === 0 && (
                     <div className="text-center py-20">
                        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Merhaba!</h1>
                        <p className="text-xl text-slate-400 mt-4">Bugün size nasıl yardımcı olabilirim?</p>
                    </div>
                )}
                {history.map((msg, index) => (
                    <div key={index} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-500' : 'bg-slate-700'}`}>
                           {msg.role === 'user' ? <User size={20} /> : <Sparkles size={20} className="text-purple-400" />}
                        </div>
                        <div className={`flex-1 p-4 rounded-xl ${msg.role === 'user' ? 'bg-slate-800' : 'bg-slate-800'}`}>
                            <MarkdownViewer content={msg.parts[0].text} />
                        </div>
                    </div>
                ))}
                
                <div ref={messagesEndRef} />
            </div>
            <div className="px-4 pb-4">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Nexus AI'a bir şey sorun..."
                        className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none rounded-xl p-4 pr-16"
                        rows={1}
                        style={{ minHeight: '56px', paddingTop: '18px' }}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Gönder"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};