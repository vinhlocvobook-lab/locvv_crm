import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  User, 
  Search, 
  Plus, 
  Mail, 
  Shield, 
  X,
  Loader2,
  AlertCircle,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Building
} from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface UserData {
    id: string;
    name: string;
    email: string;
    status: string;
    role: Role;
    roleId: number;
}

const UserListPage = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: 3, // Default to SALES
        status: 'active'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                api.get('/users'),
                api.get('/roles')
            ]);
            setUsers(usersRes.data.data);
            setRoles(rolesRes.data.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Không thể tải danh sách người dùng hoặc vai trò.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (user?: UserData) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                roleId: user.roleId,
                status: user.status
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                roleId: 2,
                status: 'active'
            });
        }
        setIsModalOpen(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (editingUser) {
                // If password is empty, don't send it to backend
                const data = { ...formData };
                if (!data.password) delete (data as any).password;
                await api.put(`/users/${editingUser.id}`, data);
            } else {
                if (!formData.password) {
                    setError('Vui lòng nhập mật khẩu cho người dùng mới.');
                    setSubmitting(false);
                    return;
                }
                await api.post('/users', formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa (vô hiệu hóa) người dùng này?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchData();
        } catch (err) {
            alert('Không thể xóa người dùng.');
        }
    };

    const getRoleBadge = (roleName: string) => {
        const colors: Record<string, string> = {
            'ADMIN': 'bg-red-500/10 text-red-400 border-red-500/20',
            'SUPER_ADMIN': 'bg-red-600/10 text-red-500 border-red-600/20',
            'TL': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'SALES': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'PURCHASING': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        };
        const labels: Record<string, string> = {
            'ADMIN': 'QUẢN TRỊ',
            'SUPER_ADMIN': 'SUPER ADMIN',
            'TL': 'TEAM LEADER',
            'SALES': 'KINH DOANH',
            'PURCHASING': 'PURCHASING'
        };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[roleName] || 'bg-gray-500/10 text-gray-400'}`}>{labels[roleName] || roleName}</span>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Thành viên hệ thống</h1>
                    <p className="text-gray-500">Quản lý đội ngũ nhân sự và phân bổ vai trò trong công ty.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Thêm thành viên
                </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên hoặc email..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : users.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 font-medium">Chưa có người dùng nào được tạo.</div>
                ) : users.map((u) => (
                    <div key={u.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 group relative hover:border-white/20 transition-all">
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(u)} className="p-2 text-gray-400 hover:text-white transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            {u.role.name !== 'Admin' && (
                                <button onClick={() => handleDelete(u.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {u.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    {u.name}
                                    {u.status === 'inactive' && <Lock className="w-3 h-3 text-red-500" />}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    {getRoleBadge(u.role.name)}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <Mail className="w-4 h-4 text-gray-600" />
                                <span className="truncate">{u.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <Building className="w-4 h-4 text-gray-600" />
                                <span>Trụ sở chính</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0b0f19] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingUser ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Họ và tên</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                        placeholder="VD: Nguyễn Văn A"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                    <input 
                                        required
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                        placeholder="email@congty.com"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Vai trò (Role)</label>
                                    <select 
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({...formData, roleId: parseInt(e.target.value)})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="" disabled className="bg-[#0d121f]">-- Chọn vai trò --</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id} className="bg-[#0d121f]">
                                                {r.name === 'ADMIN' ? 'QUẢN TRỊ' : 
                                                 r.name === 'TL' ? 'TEAM LEADER' : 
                                                 r.name === 'SALES' ? 'KINH DOANH' : 
                                                 r.name === 'PURCHASING' ? 'PURCHASING' : r.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">
                                        {editingUser ? 'Mật khẩu (để trống nếu không đổi)' : 'Mật khẩu ban đầu'}
                                    </label>
                                    <input 
                                        type="password" 
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                        placeholder="••••••••"
                                    />
                                </div>
                                
                                {editingUser && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Trạng thái</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                                                <input type="radio" name="status" checked={formData.status === 'active'} onChange={() => setFormData({...formData, status: 'active'})} />
                                                Hoạt động
                                            </label>
                                            <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                                                <input type="radio" name="status" checked={formData.status === 'inactive'} onChange={() => setFormData({...formData, status: 'inactive'})} />
                                                Khóa
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button 
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 text-gray-400 font-bold hover:bg-white/5 rounded-xl transition-all"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingUser ? 'Cập nhật' : 'Tạo mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserListPage;
