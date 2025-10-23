import React from 'react';
import type { Mode } from '../types';
import { BotMessageSquare, BrainCircuit, Image, Zap, Search, Sparkles, X } from 'lucide-react';

interface SidebarProps {
    activeMode: Mode;
    onModeChange: (mode: Mode) => void;
    isOpen: boolean;
    onClose: () => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isActive
                ? 'bg-blue-600/20 text-blue-300'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeMode, onModeChange, isOpen, onClose }) => {
    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity md:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            ></div>

            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/70 backdrop-blur-lg border-r border-slate-800 p-4 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Sparkles className="text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Nexus AI</h1>
                    </div>
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex flex-col space-y-2">
                    <NavItem
                        label="Sohbet"
                        icon={<BotMessageSquare size={20} />}
                        isActive={activeMode === 'CHAT'}
                        onClick={() => onModeChange('CHAT')}
                    />
                    <NavItem
                        label="Düşünme Modu"
                        icon={<BrainCircuit size={20} />}
                        isActive={activeMode === 'COMPLEX_QUERY'}
                        onClick={() => onModeChange('COMPLEX_QUERY')}
                    />
                     <NavItem
                        label="Hızlı Yanıtlar"
                        icon={<Zap size={20} />}
                        isActive={activeMode === 'LOW_LATENCY'}
                        onClick={() => onModeChange('LOW_LATENCY')}
                    />
                    <NavItem
                        label="Arama Temelli"
                        icon={<Search size={20} />}
                        isActive={activeMode === 'SEARCH_GROUNDING'}
                        onClick={() => onModeChange('SEARCH_GROUNDING')}
                    />
                    <NavItem
                        label="Görsel Düzenleyici"
                        icon={<Image size={20} />}
                        isActive={activeMode === 'IMAGE_EDIT'}
                        onClick={() => onModeChange('IMAGE_EDIT')}
                    />
                </nav>
            </aside>
        </>
    );
};