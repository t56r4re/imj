
import React from 'react';
import { EditHistoryItem } from '../types';

interface HistorySidebarProps {
  history: EditHistoryItem[];
  onSelectItem: (item: EditHistoryItem) => void;
  onClear: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelectItem, onClear }) => {
  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64 md:w-80">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-100">History</h2>
        <button 
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">No edits yet.</p>
          </div>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="w-full text-left group bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 rounded-xl overflow-hidden transition-all duration-200"
            >
              <div className="aspect-square relative overflow-hidden bg-slate-950">
                <img 
                  src={item.imageUrl} 
                  alt={item.prompt} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-400 font-medium truncate mb-1">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-sm text-slate-200 line-clamp-2 leading-snug">
                  {item.prompt}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;
