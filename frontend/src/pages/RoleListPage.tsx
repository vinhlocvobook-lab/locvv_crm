import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Shield, 
  Settings, 
  CheckCircle2, 
  Loader2,
  Lock,
  Circle,
  AlertCircle
} from 'lucide-react';

interface Role {
    id: number;
    name: string;
    permissions: any;
}

const RoleListPage = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});

    const permissionTree = [
        { 
            group: 'Báo giá (Quotes)',
            actions: [
                { key: 'quote:create', label: 'Tạo báo giá mới' },
                { key: 'quote:read', label: 'Xem danh sách báo giá' },
                { key: 'quote:submit', label: 'Gửi yêu cầu sang Purchasing' },
                { key: 'quote:approve', label: 'Phê duyệt báo giá (TL)' },
                { key: 'quote:export', label: 'Xuất PDF/Excel' }
            ]
        },
        { 
            group: 'Danh mục (Catalog)',
            actions: [
                { key: 'product:manage', label: 'Quản lý Sản phẩm' },
                { key: 'customer:manage', label: 'Quản lý Khách hàng' },
                { key: 'supplier:manage', label: 'Quản lý Nhà cung cấp' }
            ]
        },
        { 
            group: 'Hệ thống (System)',
            actions: [
                { key: 'user:manage', label: 'Quản lý Thành viên' },
                { key: 'role:manage', label: 'Thiết lập Phân quyền' },
                { key: 'settings:edit', label: 'Thay đổi cấu hình Công ty' }
            ]
        }
    ];

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await api.get('/roles');
            setRoles(response.data.data);
            if (response.data.data.length > 0) {
                handleSelectRole(response.data.data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch roles', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleSelectRole = (role: Role) => {
        setSelectedRole(role);
        // Flatten permissions for UI
        const flattened: Record<string, boolean> = {};
        const rolePerms = role.permissions || [];
        permissionTree.forEach(group => {
            group.actions.forEach(action => {
                flattened[action.key] = rolePerms.includes(action.key);
            });
        });
        setPermissions(flattened);
    };

    const togglePermission = (key: string) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            const activePerms = Object.keys(permissions).filter(k => permissions[k]);
            await api.put(`/roles/${selectedRole.id}`, { permissions: activePerms });
            // Refresh local data
            setRoles(roles.map(r => r.id === selectedRole.id ? { ...r, permissions: activePerms } : r));
            alert('Đã cập nhật phân quyền thành công!');
        } catch (err) {
            alert('Lỗi khi lưu phân quyền.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Vai trò & Phân quyền</h1>
                <p className="text-gray-500">Thiết lập bộ quyền hạn chi tiết cho từng vị trí công việc.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Role List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold text-white uppercase">Danh sách vai trò</span>
                        </div>
                        <div className="p-2 space-y-1">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500 text-sm">Đang tải...</div>
                            ) : roles.map(r => (
                                <button 
                                    key={r.id}
                                    onClick={() => handleSelectRole(r)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${selectedRole?.id === r.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${selectedRole?.id === r.id ? 'bg-white' : 'bg-gray-600'}`}></div>
                                    <span className="text-sm font-medium">{r.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                        <p className="text-xs text-yellow-500/80 leading-relaxed">
                            <strong>Lưu ý:</strong> Thay đổi phân quyền sẽ có tác động ngay lập tức tới tất cả người dùng thuộc vai trò này khi họ tải lại trang hoặc phiên làm việc mới.
                        </p>
                    </div>
                </div>

                {/* Permission Matrix */}
                <div className="lg:col-span-3">
                    {selectedRole ? (
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Quyền hạn của {selectedRole.name}</h2>
                                        <p className="text-xs text-gray-500 italic">ID nội bộ: {selectedRole.id}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Lưu thiết lập
                                </button>
                            </div>

                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {permissionTree.map(group => (
                                    <div key={group.group} className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{group.group}</h4>
                                        <div className="space-y-2">
                                            {group.actions.map(action => (
                                                <div 
                                                    key={action.key}
                                                    onClick={() => togglePermission(action.key)}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${permissions[action.key] ? 'border-blue-500/40 bg-blue-500/5 text-white' : 'border-white/5 bg-white/2 hover:border-white/10 text-gray-500'}`}
                                                >
                                                    <span className="text-sm font-medium">{action.label}</span>
                                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${permissions[action.key] ? 'bg-blue-600 border-blue-500' : 'border-white/10'}`}>
                                                        {permissions[action.key] && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-gray-600">
                            <Shield className="w-16 h-16 mb-4 opacity-10" />
                            <p>Chọn một vai trò bên trái để thiết lập quyền.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleListPage;
