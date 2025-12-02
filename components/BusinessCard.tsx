import React from 'react';
import { Star, MapPin, Globe, Phone, ExternalLink, Navigation } from 'lucide-react';
import { Business } from '../types';

interface Props {
  data: Business;
}

const BusinessCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm shadow-slate-200/50 flex flex-col h-full active:scale-[0.99] transition-transform duration-200">
      <div className="flex justify-between items-start mb-3 gap-3">
        <h3 className="text-lg font-bold text-[#005993] leading-snug" title={data.name}>
          {data.name}
        </h3>
        <span className="flex items-center shrink-0 bg-[#f0f9ff] text-[#005993] px-2.5 py-1 rounded-lg text-xs font-bold border border-[#7ED3F7]/30">
          {data.rating?.toFixed(1)} <Star className="w-3 h-3 ml-1 fill-amber-400 text-amber-400" />
        </span>
      </div>

      <p className="text-sm text-slate-500 mb-4 line-clamp-3 leading-relaxed flex-grow">
        {data.description}
      </p>

      <div className="space-y-3 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
             <MapPin className="w-4 h-4 text-[#D71249]" />
          </div>
          <span className="text-sm text-slate-600 leading-tight py-1.5">{data.address}</span>
        </div>
        
        {data.phone && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-[#005993]" />
            </div>
            <a href={`tel:${data.phone}`} className="text-sm text-slate-700 font-medium active:text-[#005993]">
              {data.phone}
            </a>
          </div>
        )}

        {data.website && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
               <Globe className="w-4 h-4 text-[#005993]" />
            </div>
            <a 
              href={data.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-[#005993] underline decoration-1 underline-offset-2 truncate max-w-[200px]"
            >
              Visit Website
            </a>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center gap-4">
        <span className="text-xs font-medium text-slate-400">
          {data.reviewCount > 0 ? `${data.reviewCount} reviews` : 'No reviews'}
        </span>
        
        {data.googleMapsUri && (
          <a 
            href={data.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 max-w-[140px] flex items-center justify-center gap-2 bg-[#005993] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-blue-900/10 active:bg-[#004d7a] active:scale-95 transition-all"
          >
            <Navigation className="w-3 h-3" />
            Open Maps
          </a>
        )}
      </div>
    </div>
  );
};

export default BusinessCard;