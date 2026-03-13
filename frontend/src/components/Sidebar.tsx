import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`
    }
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
  </NavLink>
);

const Sidebar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

  return (
    <aside className="w-72 bg-[#0d121f] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">QMS SaaS</h1>
            <p className="text-blue-500 text-xs font-medium tracking-wider uppercase">Enterprise</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Bảng điều khiển" />
        <SidebarItem to="/quotes" icon={FileText} label="Báo giá" />
        <SidebarItem to="/products" icon={Package} label="Sản phẩm" />
        <SidebarItem to="/customers" icon={Users} label="Khách hàng" />
        <SidebarItem to="/notifications" icon={Bell} label="Thông báo" />
        <SidebarItem to="/settings" icon={Settings} label="Cài đặt" />
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{user?.name || 'Admin Demo'}</p>
            <p className="text-gray-500 text-xs truncate">{user?.role || 'ADMIN'}</p>
          </div>
        </div>
        <button
          onClick={() => dispatch(logout())}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
