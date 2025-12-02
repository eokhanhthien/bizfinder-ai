import React from 'react';
import { Search, Map, Layers } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-[#f0f9ff] p-6 rounded-full mb-6 relative border border-[#7ED3F7]/30">
        <Search className="w-10 h-10 text-[#005993]" />
        <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-sm border border-slate-100">
          <Map className="w-5 h-5 text-[#D71249]" />
        </div>
        <div className="absolute -top-2 -left-2 bg-white p-2 rounded-full shadow-sm border border-slate-100">
          <Layers className="w-4 h-4 text-[#7ED3F7]" />
        </div>
      </div>
      <h2 className="text-2xl font-bold text-[#005993] mb-2">Ready to explore</h2>
      <p className="text-slate-500 max-w-md">
        Enter a business type and location to start. The system will extract real-time data from Google Maps.
      </p>
    </div>
  );
};

export default EmptyState;