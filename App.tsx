
import React, { useState, useRef, useCallback } from 'react';
import { ImageState, EditHistoryItem } from './types';
import { editImage } from './services/geminiService';
import HistorySidebar from './components/HistorySidebar';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    edited: null,
    mimeType: null,
  });
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EditHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageState({
          original: event.target?.result as string,
          edited: null,
          mimeType: file.type,
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!imageState.original || !prompt.trim() || !imageState.mimeType) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await editImage(imageState.original, imageState.mimeType, prompt);
      
      if (result.imageUrl) {
        setImageState(prev => ({ ...prev, edited: result.imageUrl }));
        
        // Add to history
        const newItem: EditHistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          prompt: prompt,
          imageUrl: result.imageUrl,
        };
        setHistory(prev => [newItem, ...prev]);
        setPrompt('');
      } else if (result.text) {
        setError(`Gemini returned text instead of an image: ${result.text}`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while editing the image.');
      if (err.message?.includes('429')) {
         setError('Rate limit exceeded. Please try again in a few minutes.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemSelect = (item: EditHistoryItem) => {
    setImageState(prev => ({ ...prev, edited: item.imageUrl }));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageState.edited || imageState.original || '';
    link.download = 'edited-image.png';
    link.click();
  };

  const resetAll = () => {
    setImageState({ original: null, edited: null, mimeType: null });
    setPrompt('');
    setError(null);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {showHistory && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* History Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 md:relative md:flex transition-transform duration-300 transform ${showHistory ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <HistorySidebar 
          history={history} 
          onSelectItem={handleHistoryItemSelect} 
          onClear={clearHistory}
        />
      </div>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="md:hidden p-2 hover:bg-slate-800 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight">ImageAI <span className="text-blue-500">Edit</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {(imageState.original || imageState.edited) && (
              <button 
                onClick={resetAll}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Reset
              </button>
            )}
            {imageState.edited && (
              <button 
                onClick={downloadImage}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            )}
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 p-6 flex items-center justify-center overflow-auto custom-scrollbar bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
          {!imageState.original ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="max-w-md w-full border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-slate-900/40 p-12 rounded-3xl cursor-pointer transition-all group"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600/10 group-hover:scale-110 transition-all duration-300">
                   <svg className="w-10 h-10 text-slate-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-200">Upload your image</h3>
                <p className="text-slate-500 text-sm">PNG, JPG, or WEBP up to 10MB</p>
                <button className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20">
                  Choose File
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="relative max-w-4xl w-full h-full flex items-center justify-center group">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 max-h-full">
                <img 
                  src={imageState.edited || imageState.original} 
                  alt="Work in progress" 
                  className="max-w-full max-h-[70vh] object-contain block"
                />
                
                {isLoading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-blue-400 font-medium animate-pulse">Gemini is reimagining your image...</p>
                  </div>
                )}
              </div>

              {/* Compare Button (Peek original) */}
              {imageState.edited && !isLoading && (
                <div className="absolute bottom-4 right-4 z-20">
                   <button 
                    onMouseDown={() => {
                        const img = document.querySelector('img');
                        if (img) img.src = imageState.original || '';
                    }}
                    onMouseUp={() => {
                        const img = document.querySelector('img');
                        if (img) img.src = imageState.edited || '';
                    }}
                    className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md text-xs px-3 py-2 rounded-lg border border-slate-700 shadow-xl"
                  >
                    Hold to view original
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Bar (Sticky Footer) */}
        {imageState.original && (
          <div className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 sticky bottom-0">
            <div className="max-w-4xl mx-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-2">
                   <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tell Gemini what to do... (e.g., 'Make the background a neon city' or 'Remove the object on the left')"
                  className="w-full bg-slate-800/50 border border-slate-700 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-2xl py-4 pl-6 pr-32 resize-none h-20 text-slate-100 placeholder-slate-500 transition-all outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEdit();
                    }
                  }}
                />
                <button
                  onClick={handleEdit}
                  disabled={isLoading || !prompt.trim()}
                  className="absolute right-3 bottom-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {isLoading ? 'Editing...' : 'Edit'}
                </button>
              </div>
              
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="text-xs text-slate-500 font-medium px-2 py-1">Try:</span>
                {['Add a retro filter', 'Remove background', 'Make it cinematic', 'Paint background blue'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
