import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  FolderTree,
  Search,
  Plus,
  Filter,
  Calendar,
  User,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>({ total: 0, open: 0, closed: 0, wonQuotesCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    customerId: '',
    salesIds: [] as string[],
    leaderIds: [] as string[],
    purchasingIds: [] as string[],
    technicalIds: [] as string[],
    accountantIds: [] as string[]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, dashRes, custRes, userRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/dashboard'),
        api.get('/customers'),
        api.get('/users')
      ]);
      setProjects(projRes.data.data || []);
      setDashboard(dashRes.data.data || { total: 0, open: 0, closed: 0, wonQuotesCount: 0 });
      setCustomers(custRes.data.data || []);
      setUsers(userRes.data.data || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      setError('Không thể tải danh sách dự án.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const members = [
        ...newProject.salesIds.map(id => ({ userId: id, role: 'SALES' as const })),
        ...newProject.leaderIds.map(id => ({ userId: id, role: 'TEAM_LEADER' as const })),
        ...newProject.purchasingIds.map(id => ({ userId: id, role: 'PURCHASING' as const })),
        ...newProject.technicalIds.map(id => ({ userId: id, role: 'TECHNICAL' as const })),
        ...newProject.accountantIds.map(id => ({ userId: id, role: 'ACCOUNTANT' as const }))
      ];

      await api.post('/projects', {
        name: newProject.name,
        description: newProject.description,
        customerId: newProject.customerId,
        members
      });

      setIsModalOpen(false);
      setNewProject({ name: '', description: '', customerId: '', salesIds: [], leaderIds: [], purchasingIds: [], technicalIds: [], accountantIds: [] });
      fetchData();
    } catch (err) {
      console.error('Lỗi tạo Project:', err);
      alert('Không thể tạo project. Vui lòng kiểm tra lại dữ liệu.');
    }
  };

  const handleCheckboxChange = (id: string, role: 'sales' | 'leader' | 'purchasing' | 'technical' | 'accountant') => {
    setNewProject(prev => {
      let field: 'salesIds' | 'leaderIds' | 'purchasingIds' | 'technicalIds' | 'accountantIds' = 'salesIds';
      if (role === 'leader') field = 'leaderIds';
      else if (role === 'purchasing') field = 'purchasingIds';
      else if (role === 'technical') field = 'technicalIds';
      else if (role === 'accountant') field = 'accountantIds';
      
      const list = prev[field];
      const newList = list.includes(id) ? list.filter(item => item !== id) : [...list, id];
      return { ...prev, [field]: newList };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Quản lý Dự án</h1>
          <p className="text-gray-500">Danh sách các dự án và nhóm xử lý báo giá.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all w-fit"
        >
          <Plus className="w-5 h-5" />
          Tạo Dự án mới
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><FolderTree className="w-5 h-5" /></div>
              <span className="text-gray-400 font-medium">Tổng số Dự án</span>
           </div>
           <p className="text-2xl font-bold text-white">{dashboard.total}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Clock className="w-5 h-5" /></div>
              <span className="text-gray-400 font-medium">Đang mở (Open)</span>
           </div>
           <p className="text-2xl font-bold text-white">{dashboard.open}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><CheckCircle2 className="w-5 h-5" /></div>
              <span className="text-gray-400 font-medium">Báo giá Won</span>
           </div>
           <p className="text-2xl font-bold text-white">{dashboard.wonQuotesCount || 0}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><AlertCircle className="w-5 h-5" /></div>
              <span className="text-gray-400 font-medium">Đã đóng (Closed)</span>
           </div>
           <p className="text-2xl font-bold text-white">{dashboard.closed}</p>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Tìm kiếm Project..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4">Tên Dự án</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Nhóm Phụ trách</th>
                <th className="px-6 py-4">Số Báo Giá</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Đang tải...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Chưa có dự án nào.</td></tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} onClick={() => navigate(`/projects/${proj.id}`)} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                    <td className="px-6 py-4 font-medium text-white">{proj.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-white">{proj.customer?.name}</div>
                      <div className="text-xs text-gray-500">{proj.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {proj.members?.map((m: any) => (
                          <span key={m.id} className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.role === 'TEAM_LEADER' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {m.user?.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-bold">{proj._count?.quotes || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        proj.status === 'OPEN' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(proj.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Basic Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121624] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Tạo Dự án Mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tên Dự án</label>
                <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Mô tả</label>
                <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Khách hàng</label>
                <select required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none" value={newProject.customerId} onChange={e => setNewProject({...newProject, customerId: e.target.value})}>
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map(c => <option key={c.id} value={c.id} className="bg-[#121624]">{c.name}</option>)}
                </select>
              </div>

              {/* Multiple Members Selection */}
              <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto p-1">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Chọn Sales</label>
                  <div className="max-h-24 overflow-y-auto border border-white/10 rounded-xl p-2 bg-white/5 space-y-1">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-2 text-sm text-gray-300">
                        <input type="checkbox" checked={newProject.salesIds.includes(u.id)} onChange={() => handleCheckboxChange(u.id, 'sales')} className="rounded border-white/10 bg-white/5" />
                        {u.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Chọn Leaders</label>
                  <div className="max-h-24 overflow-y-auto border border-white/10 rounded-xl p-2 bg-white/5 space-y-1">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-2 text-sm text-gray-300">
                        <input type="checkbox" checked={newProject.leaderIds.includes(u.id)} onChange={() => handleCheckboxChange(u.id, 'leader')} className="rounded border-white/10 bg-white/5" />
                        {u.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Chọn Purchasing</label>
                  <div className="max-h-24 overflow-y-auto border border-white/10 rounded-xl p-2 bg-white/5 space-y-1">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-2 text-sm text-gray-300">
                        <input type="checkbox" checked={newProject.purchasingIds.includes(u.id)} onChange={() => handleCheckboxChange(u.id, 'purchasing')} className="rounded border-white/10 bg-white/5" />
                        {u.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Chọn Kỹ thuật</label>
                  <div className="max-h-24 overflow-y-auto border border-white/10 rounded-xl p-2 bg-white/5 space-y-1">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-2 text-sm text-gray-300">
                        <input type="checkbox" checked={newProject.technicalIds.includes(u.id)} onChange={() => handleCheckboxChange(u.id, 'technical')} className="rounded border-white/10 bg-white/5" />
                        {u.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Chọn Kế toán</label>
                  <div className="max-h-24 overflow-y-auto border border-white/10 rounded-xl p-2 bg-white/5 space-y-1 grid grid-cols-2 gap-1">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-2 text-sm text-gray-300">
                        <input type="checkbox" checked={newProject.accountantIds.includes(u.id)} onChange={() => handleCheckboxChange(u.id, 'accountant')} className="rounded border-white/10 bg-white/5" />
                        {u.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl pointer transition-colors mt-2">
                Hoàn tất tạo mới
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectListPage;
