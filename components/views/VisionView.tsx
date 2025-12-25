import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Sparkles, Globe, ExternalLink } from 'lucide-react';
import { analyzeImage } from '../../services/geminiService';
import { ModelType, GroundingSource } from '../../types';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { motion, AnimatePresence } from 'framer-motion';

interface VisionViewProps {
    model: ModelType;
}

export const VisionView: React.FC<VisionViewProps> = ({ model }) => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setSources([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
          setAnalysis(null);
          setSources([]);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsLoading(true);
    setAnalysis(null);
    setSources([]);
    try {
      const result = await analyzeImage(image, prompt, model);
      setAnalysis(result.text);
      setSources(result.sources || []);
    } catch (error) {
      setAnalysis(`**Error Trace:** ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-y-auto custom-scrollbar pb-24 lg:pb-0">
       <div className="p-6 lg:p-12 max-w-6xl mx-auto w-full space-y-8 lg:space-y-12">
            <div className="space-y-3">
                <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tight">Vision Lab</h2>
                <p className="text-slate-500 text-sm lg:text-lg max-w-2xl">Multimodal reasoning for visual data decoding and global context extraction.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Input Column */}
                <div className="space-y-6 lg:space-y-8">
                    <motion.div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className={`relative group rounded-2xl lg:rounded-[2.5rem] p-4 flex flex-col items-center justify-center text-center transition-all h-[300px] lg:h-[500px] overflow-hidden ${
                            image ? 'bg-slate-900/40 border border-slate-800' : 'bg-slate-900/20 border-2 border-dashed border-slate-800 hover:border-blue-500/50'
                        }`}
                    >
                        {image ? (
                            <div className="relative w-full h-full flex items-center justify-center p-2">
                                <img src={image} alt="Preview" className="max-w-full max-h-full rounded-xl object-contain shadow-2xl" />
                                <button 
                                    onClick={() => { setImage(null); setAnalysis(null); setSources([]); }}
                                    className="absolute top-2 right-2 p-2 bg-slate-950/80 text-slate-200 rounded-full border border-white/10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 pointer-events-none">
                                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto border border-slate-700">
                                    <Upload className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-200">Initialize Visual Link</p>
                                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Upload or Drag Media</p>
                                </div>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className={`absolute inset-0 opacity-0 cursor-pointer ${image ? 'hidden' : 'block'}`}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </motion.div>

                    <div className="space-y-4">
                        <div className="relative flex flex-col sm:flex-row gap-3">
                            <input 
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Analyze this data..."
                                className="flex-1 bg-slate-950/50 glass border border-slate-800 rounded-xl lg:rounded-2xl px-5 py-3 lg:py-4 text-slate-100 placeholder-slate-600 outline-none"
                            />
                            <button 
                                onClick={handleAnalyze}
                                disabled={!image || isLoading}
                                className="px-6 py-3 lg:py-4 bg-blue-600 text-white rounded-xl lg:rounded-2xl hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-2 font-black transition-all"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
                                        <span className="text-xs lg:text-sm">EXECUTE</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Output Column */}
                <div className="flex flex-col">
                     <div className="bg-slate-950/40 glass border border-slate-800/60 rounded-2xl lg:rounded-[2.5rem] p-6 lg:p-8 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-6 lg:mb-8">
                            <div className="flex items-center gap-2 lg:gap-3">
                                <ImageIcon className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />
                                <h3 className="font-black text-white uppercase tracking-widest text-[10px] lg:text-sm">Output Stream</h3>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                            {analysis ? (
                                <div className="space-y-6 lg:space-y-8">
                                    <MarkdownRenderer content={analysis} />
                                    
                                    {sources.length > 0 && (
                                        <div className="pt-6 border-t border-slate-800/60">
                                            <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Referenced Data</p>
                                            <div className="grid grid-cols-1 gap-2 lg:gap-3">
                                                {sources.map((src, i) => (
                                                    <a
                                                        key={i}
                                                        href={src.uri}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-3 lg:p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-blue-500/40 transition-all group"
                                                    >
                                                        <span className="text-[10px] lg:text-xs font-bold text-slate-300 group-hover:text-blue-400 truncate pr-4">{src.title}</span>
                                                        <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4 text-slate-600 group-hover:text-blue-500 flex-shrink-0" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : isLoading ? (
                                <div className="h-[200px] flex flex-col items-center justify-center text-slate-500 space-y-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                                    <div className="text-center">
                                        <p className="text-white text-sm font-bold">Decoding Visual Context</p>
                                        <p className="text-[8px] font-mono uppercase tracking-widest mt-1">Cross-referencing Global Data...</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[200px] flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800/40 rounded-2xl">
                                    <p className="text-xs font-medium uppercase tracking-tighter opacity-40">Awaiting visual input</p>
                                </div>
                            )}
                        </div>
                     </div>
                </div>
            </div>
       </div>
    </div>
  );
};
