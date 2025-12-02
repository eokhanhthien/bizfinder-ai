import React, { useMemo, useState } from 'react';
import { Business } from '../types';
import { BarChart3, Star, X, Phone, Globe, Filter, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  data: Business[];
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<Props> = ({ data, onClose }) => {
  const [filterPhone, setFilterPhone] = useState(false);
  const [filterWebsite, setFilterWebsite] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Filter Data Logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterPhone && !item.phone) return false;
      if (filterWebsite && !item.website) return false;
      if (item.rating && item.rating < minRating) return false;
      return true;
    });
  }, [data, filterPhone, filterWebsite, minRating]);

  // Statistics Logic
  const stats = useMemo(() => {
    const total = data.length;
    if (total === 0) return null;

    const hasPhoneCount = data.filter(b => b.phone).length;
    const hasWebsiteCount = data.filter(b => b.website).length;
    
    // Stats for FILTERED set
    const currentTotal = filteredData.length;
    const avgRating = currentTotal > 0 
      ? filteredData.reduce((acc, curr) => acc + (curr.rating || 0), 0) / currentTotal 
      : 0;

    // Rating Distribution (Filtered)
    const distribution = [0, 0, 0, 0, 0];
    filteredData.forEach(b => {
      const r = Math.round(b.rating || 0);
      if (r >= 1 && r <= 5) distribution[r-1]++;
    });

    return { total, hasPhoneCount, hasWebsiteCount, currentTotal, avgRating, distribution };
  }, [data, filteredData]);

  if (!stats) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-[#f8fafc] flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-300">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center shadow-sm shrink-0">
        <div>
          <h2 className="text-xl font-bold text-[#005993] flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Market Intelligence
          </h2>
          <p className="text-xs text-slate-500">Deep analysis of {stats.total} businesses</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 bg-red-100 text-[#D71249] rounded-full active:bg-red-200 transition-colors shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* 1. Data Quality Overview (Global Stats) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-slate-500 text-xs font-bold uppercase mb-1">Total Data</div>
                <div className="text-3xl font-bold text-[#005993]">{stats.total}</div>
                <div className="text-xs text-slate-400 mt-1">Records extracted</div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-slate-500 text-xs font-bold uppercase mb-1">With Phone</div>
                <div className="text-3xl font-bold text-emerald-600">{stats.hasPhoneCount}</div>
                <div className="text-xs text-slate-400 mt-1">{((stats.hasPhoneCount/stats.total)*100).toFixed(0)}% coverage</div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-slate-500 text-xs font-bold uppercase mb-1">With Website</div>
                <div className="text-3xl font-bold text-blue-600">{stats.hasWebsiteCount}</div>
                <div className="text-xs text-slate-400 mt-1">{((stats.hasWebsiteCount/stats.total)*100).toFixed(0)}% coverage</div>
             </div>
             <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-slate-500 text-xs font-bold uppercase mb-1">Avg Quality</div>
                <div className="text-3xl font-bold text-amber-500">{stats.avgRating.toFixed(1)}</div>
                <div className="text-xs text-slate-400 mt-1">Star rating</div>
             </div>
          </div>

          {/* 2. Advanced Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4 text-[#005993] font-bold border-b border-slate-100 pb-2">
              <Filter className="w-4 h-4" />
              Filter & Segmentation
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setFilterPhone(!filterPhone)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${filterPhone ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <Phone className="w-4 h-4" />
                Must have Phone
                {filterPhone && <CheckCircle2 className="w-3 h-3 ml-1" />}
              </button>

              <button 
                onClick={() => setFilterWebsite(!filterWebsite)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${filterWebsite ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <Globe className="w-4 h-4" />
                Must have Website
                {filterWebsite && <CheckCircle2 className="w-3 h-3 ml-1" />}
              </button>

              <select 
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-50 border border-slate-200 text-slate-600 outline-none focus:ring-2 focus:ring-[#7ED3F7]"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4.0+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={3}>3.0+ Stars</option>
              </select>
            </div>
          </div>

          {/* 3. Analysis Charts & Filtered Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Column */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Rating Distribution (Filtered)</h3>
              <div className="space-y-3">
                {[5,4,3,2,1].map((star) => {
                  const count = stats.distribution[star-1];
                  const percent = stats.currentTotal > 0 ? (count / stats.currentTotal) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-6 text-slate-500">{star}★</span>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#005993] rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                      </div>
                      <span className="text-xs font-medium w-8 text-right text-slate-400">{count}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-2">Segment Summary</h3>
                <div className="bg-[#f0f9ff] p-3 rounded-xl border border-[#7ED3F7]/30">
                  <span className="block text-2xl font-bold text-[#005993] mb-1">
                    {stats.currentTotal} <span className="text-sm font-medium text-slate-500">/ {stats.total}</span>
                  </span>
                  <span className="text-xs text-[#005993] font-medium">Businesses match criteria</span>
                </div>
              </div>
            </div>

            {/* List Column */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col max-h-[500px]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                <h3 className="font-bold text-slate-700">Filtered Business List</h3>
                <span className="text-xs bg-[#005993] text-white px-2 py-1 rounded-md font-bold">{filteredData.length} Items</span>
              </div>
              <div className="overflow-y-auto p-2 space-y-2">
                {filteredData.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    No businesses match these filters.
                  </div>
                ) : (
                  filteredData.map((biz) => (
                    <div key={biz.id} className="flex items-center justify-between p-3 active:bg-slate-50 rounded-xl border border-transparent active:border-slate-100 transition-all group">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate text-sm">{biz.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center text-amber-500 font-bold">
                            {biz.rating}<Star className="w-3 h-3 ml-0.5 fill-amber-500" />
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{biz.address}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         {biz.phone ? (
                           <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-bold border border-emerald-100">Phone</span>
                         ) : <span className="text-[10px] text-slate-300 font-medium">No Phone</span>}
                         {biz.website ? (
                           <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold border border-blue-100">Web</span>
                         ) : <span className="text-[10px] text-slate-300 font-medium">No Web</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;