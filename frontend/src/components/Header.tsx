import React from 'react';
import { Search, Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-20 bg-[#0a0e1b]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-10 flex items-center justify-between px-8 ml-72">
      <div className="relative w-96 max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Tìm kiếm báo giá, khách hàng..."
          className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-600"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0e1b]"></span>
        </button>
        <div className="h-8 w-px bg-white/10 mx-2"></div>
        <button className="flex items-center gap-3 p-1.5 pl-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group">
          <span className="text-sm font-medium text-gray-300 group-hover:text-white">Admin Demo</span>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-lg">
            <User className="w-4 h-4" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
