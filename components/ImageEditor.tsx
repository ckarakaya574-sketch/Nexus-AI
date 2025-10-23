import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadCloud, Wand2, RefreshCw, X } from 'lucide-react';
import * as geminiService from '../services/geminiService';

export const ImageEditor: React.FC = () => {
    const [sourceImage, setSourceImage] = useState<File | null>(null);
    const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(() => localStorage.getItem('nexus_sourceImageUrl'));
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(() => localStorage.getItem('nexus_editedImageUrl'));
    const [prompt, setPrompt] = useState<string>(() => localStorage.getItem('nexus_imagePrompt') || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (sourceImageUrl) {
            localStorage.setItem('nexus_sourceImageUrl', sourceImageUrl);
        } else {
            localStorage.removeItem('nexus_sourceImageUrl');
        }
    }, [sourceImageUrl]);

    useEffect(() => {
        if (editedImageUrl) {
            localStorage.setItem('nexus_editedImageUrl', editedImageUrl);
        } else {
            localStorage.removeItem('nexus_editedImageUrl');
        }
    }, [editedImageUrl]);

    useEffect(() => {
        if (prompt) {
            localStorage.setItem('nexus_imagePrompt', prompt);
        } else {
            localStorage.removeItem('nexus_imagePrompt');
        }
    }, [prompt]);


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSourceImage(file);
            setSourceImageUrl(URL.createObjectURL(file));
            setEditedImageUrl(null);
            setError(null);
        }
    };

    const handleEdit = useCallback(async () => {
        if (!sourceImage || !prompt.trim()) {
            setError("Lütfen bir resim yükleyin ve bir istem girin.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImageUrl(null);

        try {
            const result = await geminiService.editImage(sourceImage, prompt);
            if (result) {
                setEditedImageUrl(result);
            } else {
                setError("Resim düzenlenemedi. Model bir resim döndürmemiş olabilir.");
            }
        } catch (e) {
            console.error(e);
            setError("Beklenmeyen bir hata oluştu. Lütfen konsolu kontrol edin.");
        } finally {
            setIsLoading(false);
        }
    }, [sourceImage, prompt]);
    
    const handleReset = () => {
        setSourceImage(null);
        setSourceImageUrl(null);
        setEditedImageUrl(null);
        setPrompt('');
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        localStorage.removeItem('nexus_sourceImageUrl');
        localStorage.removeItem('nexus_editedImageUrl');
        localStorage.removeItem('nexus_imagePrompt');
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                 <h2 className="text-3xl font-bold text-white">Nexus AI Görsel Düzenleyici</h2>
                 <p className="text-slate-400 mt-2">Görmek istediğiniz değişiklikleri açıklayın, gerisini yapay zeka halletsin.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Left Column: Uploader and Controls */}
                <div className="flex flex-col space-y-4">
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                    />
                    <div className="relative w-full aspect-square">
                        <div
                            className={`w-full h-full bg-slate-800/50 rounded-xl flex items-center justify-center border-2 border-dashed  transition-colors ${sourceImageUrl ? 'border-slate-700' : 'border-slate-600 hover:border-blue-500 cursor-pointer'}`}
                            onClick={!sourceImageUrl ? triggerFileInput : undefined}
                        >
                            {sourceImageUrl ? (
                                <img src={sourceImageUrl} alt="Source" className="object-contain max-w-full max-h-full rounded-lg" />
                            ) : (
                                <div className="text-center text-slate-400 p-8">
                                    <UploadCloud size={48} className="mx-auto text-slate-500" />
                                    <p className="mt-4 font-semibold">Bir resim yüklemek için tıklayın</p>
                                    <p className="text-sm text-slate-500">PNG, JPG, veya WEBP</p>
                                </div>
                            )}
                        </div>
                        {sourceImageUrl && (
                             <button
                                onClick={handleReset}
                                className="absolute -top-2 -right-2 bg-slate-600 text-white p-1.5 rounded-full hover:bg-slate-500 transition-colors shadow-lg"
                                aria-label="Resmi kaldır"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    
                    {sourceImageUrl && (
                        <>
                         <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="örn., Retro bir filtre ekle, sulu boya resmine dönüştür..."
                            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            rows={3}
                            disabled={isLoading}
                        />

                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        
                        {!sourceImage && sourceImageUrl && (
                            <p className="text-amber-400 text-sm p-2 bg-amber-900/20 rounded-md">Sayfayı yenilediğiniz için düzenlemeye devam etmek için lütfen resmi tekrar yükleyin.</p>
                        )}

                        <button
                            onClick={handleEdit}
                            disabled={isLoading || !prompt.trim() || !sourceImage}
                            className="w-full flex items-center justify-center bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all font-semibold text-base"
                        >
                            {isLoading ? (
                                <RefreshCw size={20} className="animate-spin mr-2" />
                            ) : (
                                <Wand2 size={20} className="mr-2" />
                            )}
                            {isLoading ? 'Oluşturuluyor...' : 'Değişikliği Uygula'}
                        </button>
                        </>
                    )}
                </div>

                {/* Right Column: Result */}
                <div className="w-full aspect-square bg-slate-800/50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-700 p-2">
                    {isLoading && (
                        <div className="text-center text-slate-400">
                             <RefreshCw size={48} className="animate-spin mx-auto text-slate-500" />
                             <p className="mt-4">Resminiz düzenleniyor...</p>
                        </div>
                    )}
                    {!isLoading && editedImageUrl && (
                        <img src={editedImageUrl} alt="Edited" className="object-contain max-w-full max-h-full rounded-lg" />
                    )}
                     {!isLoading && !editedImageUrl && (
                        <div className="text-center text-slate-400 p-8">
                             <Wand2 size={48} className="mx-auto text-slate-500" />
                            <p className="mt-4">Düzenlenen resminiz burada görünecek</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};