import React, { useState, useCallback } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import type { GroundedResponse } from '../types';

interface PromptResponderProps {
    title: string;
    description: string;
    placeholder: string;
    buttonText: string;
    handler: (prompt: string) => Promise<string | GroundedResponse>;
    responseRenderer: (response: string, sources?: any[]) => React.ReactNode;
}

export const PromptResponder: React.FC<PromptResponderProps> = ({
    title,
    description,
    placeholder,
    buttonText,
    handler,
    responseRenderer
}) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState<string | null>(null);
    const [sources, setSources] = useState<any[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResponse(null);
        setSources(undefined);

        try {
            const result = await handler(prompt);
            if (typeof result === 'string') {
                setResponse(result);
            } else {
                setResponse(result.text);
                setSources(result.sources);
            }
        } catch (e) {
            console.error(e);
            setError("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    }, [prompt, isLoading, handler]);

    return (
        <div className="flex flex-col h-full justify-between">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">{title}</h2>
                <p className="text-slate-400 max-w-2xl mx-auto mt-2">{description}</p>
            </div>

            <div className="flex-1 flex flex-col justify-end">
                {(isLoading || response || error) && (
                     <div className="mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700 min-h-[150px] overflow-y-auto">
                        {isLoading && (
                           <div className="flex items-center justify-center h-full">
                               <div className="flex items-center space-x-2 text-slate-400">
                                   <RefreshCw size={20} className="animate-spin" />
                                   <span>İsteğiniz işleniyor...</span>
                               </div>
                           </div>
                        )}
                        {error && (
                            <div className="text-red-400">{error}</div>
                        )}
                        {response && (
                            <div className="text-slate-200">
                               {responseRenderer(response, sources)}
                            </div>
                        )}
                    </div>
                )}

                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
                        placeholder={placeholder}
                        className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none rounded-xl p-4 pr-16"
                        rows={2}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        aria-label={buttonText}
                    >
                        {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
