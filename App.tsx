import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Chatbot } from './components/Chatbot';
import { ImageEditor } from './components/ImageEditor';
import { PromptResponder } from './components/PromptResponder';
import * as geminiService from './services/geminiService';
import type { Mode } from './types';
import { MarkdownViewer } from './components/MarkdownViewer';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
    const [mode, setMode] = useState<Mode>('CHAT');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleModeChange = useCallback((newMode: Mode) => {
        setMode(newMode);
        setIsSidebarOpen(false); // Close sidebar on mode change on mobile
    }, []);

    const renderContent = () => {
        switch (mode) {
            case 'CHAT':
                return <Chatbot />;
            case 'COMPLEX_QUERY':
                return (
                    <PromptResponder
                        title="Düşünme Modu"
                        description="En karmaşık sorgularınız için Nexus AI 1.0 ile etkileşime geçin. Model, derin ve iyi gerekçelendirilmiş yanıtlar sağlamak için maksimum düşünme bütçesini kullanır."
                        placeholder="örn., Görelilik teorisini beş yaşındaymışım gibi açıkla..."
                        buttonText="Karmaşık Sorguyu Çalıştır"
                        handler={geminiService.generateComplexResponse}
                        responseRenderer={(response) => <MarkdownViewer content={response} />}
                    />
                );
            case 'LOW_LATENCY':
                return (
                    <PromptResponder
                        title="Düşük Gecikmeli Yanıtlar"
                        description="Yüksek düzeyde optimize edilmiş Nexus AI 1.0 modelini kullanarak basit görevler için hızlı yanıtlar alın."
                        placeholder="örn., Fransa'nın başkenti neresidir?"
                        buttonText="Hızlı Yanıt Al"
                        handler={geminiService.generateFastResponse}
                        responseRenderer={(response) => <MarkdownViewer content={response} />}
                    />

                );
            case 'SEARCH_GROUNDING':
                return (
                     <PromptResponder
                        title="Arama Temelli Yanıtlar"
                        description="Güncel bilgi gerektiren son olaylar veya konular hakkında sorular sorun. Nexus AI, yanıtını temel almak için Google Arama'yı kullanacaktır."
                        placeholder="örn., Son F1 yarışını kim kazandı?"
                        buttonText="Nexus ile Ara"
                        handler={geminiService.generateGroundedResponse}
                        responseRenderer={(response, sources) => (
                           <div>
                                <MarkdownViewer content={response} />
                                {sources && sources.length > 0 && (
                                    <div className="mt-6 border-t border-slate-700 pt-4">
                                        <h3 className="text-lg font-semibold text-slate-300 mb-2">Kaynaklar</h3>
                                        <ul className="list-disc list-inside space-y-2">
                                            {sources.map((source, index) => (
                                                <li key={index} className="truncate">
                                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                                                        {source.title || source.uri}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                           </div>
                        )}
                    />
                );
            case 'IMAGE_EDIT':
                return <ImageEditor />;
            default:
                return <Chatbot />;
        }
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar 
                activeMode={mode} 
                onModeChange={handleModeChange}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
             />
            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto relative">
                 <button 
                    className="md:hidden absolute top-4 left-4 z-10 p-2 bg-slate-800/50 rounded-md text-white"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Menüyü aç"
                >
                    <Menu size={24} />
                </button>
                <div className="max-w-4xl mx-auto h-full">
                     {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default App;