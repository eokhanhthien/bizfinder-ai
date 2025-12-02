import React, { useState, useCallback, useEffect } from 'react';
import { Search, MapPin, Loader2, RefreshCw, ArrowDownCircle, ExternalLink } from 'lucide-react';
import { Business, SearchState, SortOption, HistoryItem } from './types';
import { fetchBusinessData } from './services/geminiService';
import Header from './components/Header';
import BusinessCard from './components/BusinessCard';
import EmptyState from './components/EmptyState';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Sidebar from './components/Sidebar';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  // --- State Initialization ---
  
  // Inputs
  const [industry, setIndustry] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('bizFinder_industry') || '' : ''));
  const [mainLocation, setMainLocation] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('bizFinder_location') || '' : ''));

  // Settings
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.RATING_DESC);
  const [viewMode, setViewMode] = useState<'list' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bizFinder_viewMode');
      return (saved === 'list' || saved === 'table') ? saved : 'list';
    }
    return 'list';
  });

  // UI Flags
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Track if current session is from history to prevent duplicates
  // FIX: Restore ID from localStorage so we don't lose context on page reload
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bizFinder_currentHistoryId');
    }
    return null;
  });

  // Data State
  const [searchState, setSearchState] = useState<SearchState>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('bizFinder_data');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
             return { isSearching: false, error: null, data: parsed, hasSearched: true, progress: undefined };
          }
        } catch (e) { console.error("Failed to load saved data", e); }
      }
    }
    return { isSearching: false, error: null, data: [], hasSearched: false, progress: undefined };
  });

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('bizFinder_history');
      if (savedHistory) {
        try {
          return JSON.parse(savedHistory);
        } catch (e) { return []; }
      }
    }
    return [];
  });

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('bizFinder_industry', industry), [industry]);
  useEffect(() => localStorage.setItem('bizFinder_location', mainLocation), [mainLocation]);
  useEffect(() => localStorage.setItem('bizFinder_viewMode', viewMode), [viewMode]);
  
  // FIX: Persist currentHistoryId so context is saved across reloads
  useEffect(() => {
    if (currentHistoryId) {
      localStorage.setItem('bizFinder_currentHistoryId', currentHistoryId);
    } else {
      localStorage.removeItem('bizFinder_currentHistoryId');
    }
  }, [currentHistoryId]);

  // Save current data state
  useEffect(() => {
    if (searchState.data.length > 0) localStorage.setItem('bizFinder_data', JSON.stringify(searchState.data));
    else if (searchState.hasSearched && searchState.data.length === 0) localStorage.removeItem('bizFinder_data');
  }, [searchState.data, searchState.hasSearched]);

  // Save history state
  useEffect(() => {
    localStorage.setItem('bizFinder_history', JSON.stringify(history));
  }, [history]);

  // --- Handlers ---

  const saveCurrentSession = useCallback((providedData?: Business[]) => {
    // Allow saving provided data (e.g., immediate update from Load More) or current state data
    const dataToSave = providedData || searchState.data;
    
    if (dataToSave.length === 0) return;

    setHistory(prev => {
      // 1. If we are working on an existing history item, UPDATE it.
      if (currentHistoryId) {
        const existingItemIndex = prev.findIndex(item => item.id === currentHistoryId);
        if (existingItemIndex !== -1) {
          const updatedHistory = [...prev];
          updatedHistory[existingItemIndex] = {
            ...updatedHistory[existingItemIndex],
            timestamp: Date.now(),
            count: dataToSave.length,
            data: dataToSave,
            // We do NOT update industry/location labels here to prevent renaming 
            // the history item if the user just changed inputs but is saving old context.
          };
          return updatedHistory;
        }
      }

      // 2. Otherwise, CREATE a new history item.
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        industry: industry || 'Unknown Industry',
        location: mainLocation || 'Unknown Location',
        count: dataToSave.length,
        data: dataToSave
      };
      
      return [newItem, ...prev];
    });
  }, [searchState.data, currentHistoryId, industry, mainLocation]);

  const handleClearData = () => {
    // Save/Update current session before clearing
    saveCurrentSession();

    // Clear Search State
    setSearchState({ isSearching: false, error: null, data: [], hasSearched: false, progress: undefined });
    localStorage.removeItem('bizFinder_data');
    
    // Reset Inputs & Tracker
    setMainLocation('');
    setIndustry('');
    setCurrentHistoryId(null);
    localStorage.removeItem('bizFinder_industry');
    localStorage.removeItem('bizFinder_location');
    // localStorage.removeItem('bizFinder_currentHistoryId'); // Handled by useEffect

    // UI Updates
    setShowAnalytics(false);
    setIsSidebarOpen(true); 
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    // PREVENT SELF-RELOAD: If clicking the currently active session, just close the sidebar.
    // This avoids overwriting your current progress (like "Load More" results) with the potentially stale version in the list.
    if (currentHistoryId === item.id) {
        setIsSidebarOpen(false);
        return;
    }

    // Save current work before switching
    if (searchState.data.length > 0) {
       saveCurrentSession();
    }

    setIndustry(item.industry);
    setMainLocation(item.location);
    setCurrentHistoryId(item.id);
    
    setSearchState({
      isSearching: false,
      error: null,
      data: item.data,
      hasSearched: true,
      progress: undefined
    });
    setIsSidebarOpen(false);
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    if (currentHistoryId === id) {
      setCurrentHistoryId(null);
    }
  };

  const handleClearAllHistory = () => {
    if (history.length === 0) return;
    if (window.confirm("Are you sure you want to clear all search history?")) {
      setHistory([]);
      if (currentHistoryId) {
        setCurrentHistoryId(null);
      }
    }
  };

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!industry.trim() || !mainLocation.trim()) {
      setSearchState(prev => ({ ...prev, error: "Please enter industry and main location" }));
      return;
    }
    
    // Save previous session before starting a fresh search
    if (searchState.data.length > 0) {
       saveCurrentSession();
    }

    // Start FRESH session for new search
    setCurrentHistoryId(null);

    // FIX: Clear data to [] to show Initial Loading Skeleton correctly
    setSearchState(prev => ({ 
      ...prev, 
      isSearching: true, 
      error: null, 
      hasSearched: true, 
      progress: { current: 1, total: 1, currentArea: mainLocation },
      data: [] 
    }));

    try {
        const results = await fetchBusinessData(industry, mainLocation, []);
        setSearchState(prev => ({ ...prev, data: results, isSearching: false, progress: undefined }));
    } catch (error: any) {
      let errorMessage = error.message || "An unexpected error occurred";
      // Handle Authentication Errors clearly
      if (errorMessage.includes("API key") || errorMessage.includes("403")) {
          errorMessage = "API Key Error: Key is invalid, expired or revoked. Please update your settings.";
      }
      setSearchState(prev => ({ ...prev, isSearching: false, error: errorMessage, progress: undefined }));
    }
  }, [industry, mainLocation, searchState.data, saveCurrentSession]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    // CRITICAL: We do NOT reset currentHistoryId here. We want to update the existing session.
    
    try {
      const existingNames = searchState.data.map(b => b.name);
      const newResults = await fetchBusinessData(industry, mainLocation, existingNames);
      
      if (newResults.length === 0) {
        alert("Found all available businesses in this specific area. Try expanding your location search (e.g., Change 'District 1' to 'Ho Chi Minh City').");
        setIsLoadingMore(false);
        return;
      }

      const currentMap = new Map<string, Business>();
      searchState.data.forEach(b => currentMap.set(b.googleMapsUri || `${b.name}|${b.address}`, b));
      let addedCount = 0;
      newResults.forEach(biz => {
          const key = biz.googleMapsUri || `${biz.name}|${biz.address}`;
          if (!currentMap.has(key)) { currentMap.set(key, biz); addedCount++; }
      });
      
      const mergedData = Array.from(currentMap.values());
      setSearchState(prev => ({ ...prev, data: mergedData }));
      
      // AUTO-SYNC HISTORY: Update the history record immediately so the sidebar count (e.g., 40 -> 60) reflects the new data.
      if (currentHistoryId) {
        saveCurrentSession(mergedData);
      }
      
      if (addedCount === 0) {
         // Soft notification instead of harsh error
         console.warn("The AI returned duplicates.");
         alert("All businesses found in this area are already in your list. Try a slightly different location name.");
      }

    } catch (e: any) {
      console.error(e);
      let msg = "Unable to load more results. Please check your connection.";
      if (e.message?.includes("API key") || e.toString().includes("403")) {
        msg = "API Key Error: Key is invalid or has been revoked.";
      }
      alert(msg);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDownloadExcel = () => {
    if (searchState.data.length === 0) return;
    const dataForSheet = searchState.data.map(item => ({
      "Name": item.name, "Address": item.address, "Rating": item.rating, "Reviews": item.reviewCount,
      "Phone": item.phone || "", "Website": item.website || "", "Business Type": item.businessType, "Map Link": item.googleMapsUri || ""
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Business Data");
    worksheet['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 40 }];
    const fileName = `${industry.replace(/\s+/g, '_')}_${mainLocation.replace(/\s+/g, '_')}_data.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const sortedData = [...searchState.data].sort((a, b) => {
    switch (sortBy) {
      case SortOption.RATING_DESC: return (b.rating || 0) - (a.rating || 0);
      case SortOption.REVIEWS_DESC: return (b.reviewCount || 0) - (a.reviewCount || 0);
      case SortOption.NAME_ASC: return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Header with Menu Button */}
      <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        count={searchState.data.length}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onOpenAnalytics={() => {
          setIsSidebarOpen(false);
          setShowAnalytics(true);
        }}
        onDownloadExcel={handleDownloadExcel}
        onClearData={handleClearData}
        history={history}
        onRestoreHistory={handleRestoreHistory}
        onDeleteHistory={handleDeleteHistory}
        onClearAllHistory={handleClearAllHistory}
      />

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-24 sm:pt-28">
        
        {/* Search Box */}
        <div className={`bg-white rounded-3xl shadow-lg shadow-blue-900/5 border border-slate-100 p-5 mb-6 transition-all duration-300 ${searchState.data.length > 0 ? 'hidden' : 'block'}`}>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label htmlFor="industry" className="block text-[10px] font-bold uppercase tracking-wider text-[#005993]">Industry</label>
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#005993] transition-colors" />
                        <input
                          type="text"
                          id="industry"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="e.g. Coffee Shop"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7ED3F7] focus:border-[#005993] outline-none transition-all text-black font-semibold text-sm placeholder:text-slate-400 placeholder:font-normal"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="location" className="block text-[10px] font-bold uppercase tracking-wider text-[#005993]">Location</label>
                    <div className="relative group">
                        <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#005993] transition-colors" />
                        <input
                          type="text"
                          id="location"
                          value={mainLocation}
                          onChange={(e) => setMainLocation(e.target.value)}
                          placeholder="e.g. District 1"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#7ED3F7] focus:border-[#005993] outline-none transition-all text-black font-semibold text-sm placeholder:text-slate-400 placeholder:font-normal"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={searchState.isSearching}
                className="w-full md:w-auto md:min-w-[200px] bg-[#005993] active:bg-[#004d7a] active:scale-95 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-[#005993]/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed mx-auto text-base"
              >
                {searchState.isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {searchState.progress ? 'Scanning...' : 'Extracting...'}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Start Search
                  </>
                )}
              </button>
          </form>
        </div>

        {/* Error State */}
        {searchState.error && (
          <div className="bg-red-50 text-[#D71249] p-4 rounded-2xl border border-red-100 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="w-2 h-2 rounded-full bg-[#D71249] mt-2 shrink-0" />
            <span className="text-sm font-medium">{searchState.error}</span>
          </div>
        )}

        {/* Results Area */}
        {!searchState.hasSearched && searchState.data.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {/* Analytics Modal */}
            {showAnalytics && <AnalyticsDashboard data={searchState.data} onClose={() => setShowAnalytics(false)} />}

            {/* No Results Message */}
            {searchState.data.length === 0 && !searchState.isSearching && !searchState.error && searchState.hasSearched && (
               <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 mx-4">
                  <p className="text-slate-500 font-medium">No results found via Maps.</p>
               </div>
            )}

            {/* View: List */}
            {viewMode === 'list' && (
              <div className="grid grid-cols-1 gap-4 mb-20 max-w-4xl mx-auto">
                {sortedData.map((biz) => (
                  <BusinessCard key={biz.id} data={biz} />
                ))}
                
                {/* List View Skeletons (Show during Load More OR Initial Search) */}
                {(isLoadingMore || searchState.isSearching) && [1, 2, 3, 4].map((i) => (
                  <div key={`skel-${i}`} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full animate-pulse">
                    <div className="flex justify-between items-start mb-3 gap-3">
                      <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                      <div className="h-6 bg-slate-200 rounded-lg w-12 shrink-0"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    </div>
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                         <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                         <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center gap-4">
                       <div className="h-4 bg-slate-200 rounded w-20"></div>
                       <div className="h-8 bg-slate-200 rounded-xl w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View: Table */}
            {viewMode === 'table' && (sortedData.length > 0 || isLoadingMore || searchState.isSearching) && (
              <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden mb-20">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 min-w-[600px]">
                    <thead className="bg-[#f0f9ff] border-b border-[#7ED3F7]/30 text-xs uppercase font-bold text-[#005993]">
                      <tr>
                        <th className="px-4 py-4 whitespace-nowrap">Business Name</th>
                        <th className="px-4 py-4 whitespace-nowrap">Rating</th>
                        <th className="px-4 py-4 whitespace-nowrap">Address</th>
                        <th className="px-4 py-4 whitespace-nowrap">Contact</th>
                        <th className="px-4 py-4 whitespace-nowrap text-right">Maps</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedData.map((biz) => (
                        <tr key={biz.id} className="active:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 font-bold text-slate-900">
                            <div className="line-clamp-2">{biz.name}</div>
                            <div className="text-xs text-slate-400 font-normal mt-0.5">{biz.businessType}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1">
                               <span className="font-bold text-[#005993]">{biz.rating?.toFixed(1)}</span>
                               <span className="text-xs text-slate-400">({biz.reviewCount})</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 max-w-[150px]">
                            <div className="line-clamp-2 text-xs">{biz.address}</div>
                          </td>
                          <td className="px-4 py-4">
                             <div className="flex flex-col gap-1">
                                {biz.phone ? <span className="text-slate-700 text-xs font-mono">{biz.phone}</span> : <span className="text-slate-300 italic text-xs">No phone</span>}
                                {biz.website && <a href={biz.website} target="_blank" className="text-[#005993] underline text-xs">Web</a>}
                             </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                             {biz.googleMapsUri && (
                                <a 
                                  href={biz.googleMapsUri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center p-2.5 text-white bg-[#005993] rounded-lg shadow-sm active:scale-90 transition-transform"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                             )}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Table View Skeletons (Show during Load More OR Initial Search) */}
                      {(isLoadingMore || searchState.isSearching) && [1, 2, 3, 4].map((i) => (
                        <tr key={`skel-row-${i}`} className="animate-pulse">
                          <td className="px-4 py-4">
                             <div className="h-5 bg-slate-200 rounded w-48 mb-1"></div>
                             <div className="h-3 bg-slate-100 rounded w-24"></div>
                          </td>
                          <td className="px-4 py-4">
                             <div className="h-5 bg-slate-200 rounded w-12"></div>
                          </td>
                          <td className="px-4 py-4">
                             <div className="h-4 bg-slate-200 rounded w-32"></div>
                          </td>
                          <td className="px-4 py-4">
                             <div className="h-3 bg-slate-200 rounded w-24 mb-1"></div>
                             <div className="h-3 bg-slate-100 rounded w-16"></div>
                          </td>
                          <td className="px-4 py-4 text-right">
                             <div className="inline-block h-8 w-8 bg-slate-200 rounded-lg"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Load More Button */}
            {searchState.data.length > 0 && !searchState.isSearching && (
              <div className="fixed bottom-6 left-0 right-0 px-6 z-40 pointer-events-none flex justify-center">
                 <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="pointer-events-auto flex items-center gap-2 px-5 py-3 bg-[#005993] text-white font-bold rounded-full shadow-xl shadow-blue-900/30 hover:bg-[#004d7a] transition-all active:scale-95 disabled:opacity-70 disabled:scale-100 text-sm"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ArrowDownCircle className="w-4 h-4" />
                      Load More Results
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;