import React from 'react';
import { Compass, Menu } from 'lucide-react';

interface Props {
  onOpenSidebar: () => void;
}

const Header: React.FC<Props> = ({ onOpenSidebar }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-3">
            {/* Custom Logo Design */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#005993] to-[#004d7a] shadow-lg shadow-blue-900/20">
              <Compass className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#D71249] rounded-full border-2 border-white"></div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#005993] tracking-tight leading-none">
                BizFinder
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase mt-0.5">
                Intelligence
              </span>
            </div>
          </div>

          {/* Right Side Controls - Menu Button */}
          <button 
            onClick={onOpenSidebar}
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 active:scale-95 bg-slate-50 text-[#005993] border border-slate-200 active:bg-[#f0f9ff] active:border-[#7ED3F7]"
            title="Open Menu"
          >
            <span className="text-xs font-bold hidden sm:block">Menu</span>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;