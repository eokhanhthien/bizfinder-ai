import React from 'react';
import { List, Table as TableIcon, Filter, PieChart, Download, Trash2 } from 'lucide-react';
import { SortOption } from '../types';

interface Props {
  count: number;
  viewMode: 'list' | 'table';
  setViewMode: (mode: 'list' | 'table') => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  onOpenAnalytics: () => void;
  onDownloadExcel: () => void;
  onClearData: () => void;
}

const Toolbar: React.FC<Props> = ({
  count,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  onOpenAnalytics,
  onDownloadExcel,
  onClearData,
}) => {
  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg py-2 px-4 transition-all animate-in slide-in-from-top-2">
      <div className="max-w-7xl mx-auto flex flex-wrap gap-3 items-center justify-between">
        
        {/* Left: View & Sort */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-1 h-8">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-2.5 rounded-md transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white text-[#005993] shadow-sm font-bold' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-2.5 rounded-md transition-all flex items-center justify-center ${viewMode === 'table' ? 'bg-white text-[#005993] shadow-sm font-bold' : 'text-slate-400'}`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative h-8 w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none block w-full h-full pl-8 pr-4 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg focus:ring-2 focus:ring-[#7ED3F7] outline-none"
            >
              <option value={SortOption.RATING_DESC}>Top Rated</option>
              <option value={SortOption.REVIEWS_DESC}>Most Reviewed</option>
              <option value={SortOption.NAME_ASC}>Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="hidden sm:flex items-baseline gap-1 mr-2">
             <span className="text-[#005993] font-bold text-lg">{count}</span>
             <span className="text-slate-400 text-[10px] font-bold uppercase">Results</span>
          </div>

          <button
            onClick={onOpenAnalytics}
            className="flex items-center justify-center gap-1.5 h-8 px-3 bg-[#005993] text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm shadow-blue-900/10"
          >
            <PieChart className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Analysis</span>
          </button>

          <button
            onClick={onDownloadExcel}
            className="flex items-center justify-center gap-1.5 h-8 px-3 bg-[#217346] text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Excel</span>
          </button>
          
          <button
            onClick={onClearData}
            className="flex items-center justify-center h-8 w-8 bg-white text-[#D71249] border border-red-100 active:bg-red-50 rounded-lg transition-all active:scale-95 shadow-sm"
            title="Clear Data"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;