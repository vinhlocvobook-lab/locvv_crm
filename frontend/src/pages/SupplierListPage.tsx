import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Building, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin,
  X,
  Loader2,
  AlertCircle,
  Edit2,
  Trash2,
  Truck
} from 'lucide-react';

interface Supplier {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    taxCode: string;
}

const SupplierListPage = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxCode: ''
    });

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data.data);
        } catch (err) {
            console.error('Failed to fetch suppliers', err);
            setError('Không thể tải danh sách nhà cung cấp.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleOpenModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                taxCode: supplier.taxCode || ''
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                taxCode: ''
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
            if (editingSupplier) {
                await api.put(`/suppliers/${editingSupplier.id}`, formData);
            } else {
                await api.post('/suppliers', formData);
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) return;
        try {
            await api.delete(`/suppliers/${id}`);
            fetchSuppliers();
        } catch (err) {
            alert('Không thể xóa nhà cung cấp.');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Quản lý Nhà cung cấp</h1>
                    <p className="text-gray-500">Danh sách các đối tác cung ứng hàng hóa cho hệ thống.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Thêm nhà cung cấp
                </button>
            </div>

            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm nhà cung cấp, email, số điện thoại..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : suppliers.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <Truck className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có nhà cung cấp nào trong hệ thống.</p>
                        <button onClick={() => handleOpenModal()} className="text-purple-500 text-sm mt-2 hover:underline">Thêm đối tác đầu tiên</button>
                    </div>
                ) : suppliers.map((supplier) => (
                    <div key={supplier.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all group relative">
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleOpenModal(supplier)}
                                className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(supplier.id)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-lg">
                                <Building className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-white font-bold truncate pr-10">{supplier.name}</h3>
                                <p className="text-gray-500 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                    Nhà cung cấp
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="truncate">{supplier.email || '(Chưa cập nhật)'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{supplier.phone || '(Chưa cập nhật)'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                                <span className="truncate">{supplier.address || '(Chưa cập nhật)'}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                MST: <span className="text-gray-400">{supplier.taxCode || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0d121f] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingSupplier ? 'Chỉnh sửa Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}
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
                                    <label className="text-xs font-bold text-gray-500 uppercase">Tên Công ty / NPP *</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                                        placeholder="VD: Công ty Thép Hoà Phát"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                                            placeholder="sale@hoaphat.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Số điện thoại</label>
                                        <input 
                                            type="text" 
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                                            placeholder="024xxx..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Mã số thuế</label>
                                    <input 
                                        type="text" 
                                        value={formData.taxCode}
                                        onChange={(e) => setFormData({...formData, taxCode: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                                        placeholder="VD: 0101234567"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Địa chỉ trụ sở</label>
                                    <textarea 
                                        rows={2} 
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" 
                                        placeholder="Địa chỉ kho bãi hoặc văn phòng..."
                                    />
                                </div>
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
                                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingSupplier ? 'Cập nhật' : 'Tạo mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierListPage;
