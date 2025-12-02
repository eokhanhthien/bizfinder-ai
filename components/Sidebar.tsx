import React from 'react';
import { X, History, PieChart, Download, Trash2, Clock, MapPin, List, Table as TableIcon, LayoutGrid, Plus } from 'lucide-react';
import { SortOption, HistoryItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  viewMode: 'list' | 'table';
  setViewMode: (mode: 'list' | 'table') => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  onOpenAnalytics: () => void;
  onDownloadExcel: () => void;
  onClearData: () => void;
  history: HistoryItem[];
  onRestoreHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string, e: React.MouseEvent) => void;
  onClearAllHistory: () => void;
}

const Sidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  count,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  onOpenAnalytics,
  onDownloadExcel,
  onClearData,
  history,
  onRestoreHistory,
  onDeleteHistory,
  // onClearAllHistory is no longer used in UI
}) => {
  
  const handleNewSearch = () => {
    onClearData();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed inset-y-0 left-0 z-[70] w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div 
            onClick={handleNewSearch}
            className="flex items-center gap-2 cursor-pointer group select-none"
            title="Start New Search"
          >
            <div className="bg-[#005993] p-1.5 rounded-lg group-active:scale-95 transition-transform">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#005993] text-lg">Menu</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 active:text-slate-600 active:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {/* Current Session Tools */}
          {count > 0 && (
            <div className="p-5 border-b border-slate-100 animate-in slide-in-from-left-2 duration-300">
              
              <button 
                onClick={handleNewSearch}
                className="w-full flex items-center justify-center gap-2 p-3.5 mb-6 bg-[#005993] text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/20 active:bg-[#004d7a] transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Tìm kiếm mới
              </button>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Current Session</h3>
              
              <div className="space-y-4">
                {/* Stats */}
                <div className="flex items-center justify-between bg-[#f0f9ff] p-3 rounded-xl border border-[#7ED3F7]/30">
                  <span className="text-sm font-medium text-[#005993]">Results Found</span>
                  <span className="text-xl font-bold text-[#005993]">{count}</span>
                </div>

                {/* View Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">View Layout</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${viewMode === 'list' ? 'bg-white text-[#005993] shadow-sm' : 'text-slate-400'}`}
                    >
                      <List className="w-4 h-4" /> List
                    </button>
                    <button 
                      onClick={() => setViewMode('table')}
                      className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${viewMode === 'table' ? 'bg-white text-[#005993] shadow-sm' : 'text-slate-400'}`}
                    >
                      <TableIcon className="w-4 h-4" /> Table
                    </button>
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl !text-xs font-medium outline-none focus:ring-2 focus:ring-[#7ED3F7] text-slate-900"
                  >
                    <option value={SortOption.RATING_DESC}>Highest Rated</option>
                    <option value={SortOption.REVIEWS_DESC}>Most Reviewed</option>
                    <option value={SortOption.NAME_ASC}>Name (A-Z)</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={onOpenAnalytics} className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl active:scale-95 transition-all active:bg-blue-50">
                    <PieChart className="w-5 h-5 text-[#005993] mb-1" />
                    <span className="text-xs font-bold text-slate-600">Analysis</span>
                  </button>
                  <button onClick={onDownloadExcel} className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl active:scale-95 transition-all active:bg-green-50">
                    <Download className="w-5 h-5 text-[#217346] mb-1" />
                    <span className="text-xs font-bold text-slate-600">Excel</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History Section */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4" /> Search History
              </h3>
            </div>
            
            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">No history saved yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => onRestoreHistory(item)}
                    className="group bg-white border border-slate-100 rounded-xl p-3 hover:border-[#7ED3F7] active:bg-[#f0f9ff] transition-all cursor-pointer shadow-sm relative"
                  >
                    <div className="flex justify-between items-start gap-2">
                        {/* Content Column */}
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-[#005993] text-sm truncate pr-1">{item.industry}</div>
                            
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-2">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{item.location}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                <Clock className="w-3 h-3" />
                                {new Date(item.timestamp).toLocaleDateString()}
                            </div>
                        </div>

                        {/* Actions Column - Flexbox prevents overlap */}
                        <div className="flex flex-col items-end gap-2 shrink-0 z-10">
                            <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onDeleteHistory(item.id, e);
                                }}
                                className="relative p-2 -mr-2 -mt-2 text-slate-400 hover:text-[#D71249] hover:bg-red-50 rounded-lg transition-colors z-20"
                                title="Delete History Item"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <span className="text-[10px] font-bold bg-[#f0f9ff] text-[#005993] border border-[#7ED3F7]/30 px-2 py-0.5 rounded-full">
                                {item.count}
                            </span>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;