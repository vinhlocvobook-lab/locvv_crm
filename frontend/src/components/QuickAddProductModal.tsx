import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  X,
  Loader2,
  AlertCircle,
  Package,
  Hash,
  Tag,
  Building2,
  Calendar
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    sku: string;
    description?: string;
    basePrice: number | string;
    unit: string;
    category?: string;
    manufacturer?: string;
    supplierId?: string;
    priceExpiry?: string;
}

interface QuickAddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (product: Product) => void;
}

const QuickAddProductModal: React.FC<QuickAddProductModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [categories_list, setCategoriesList] = useState<any[]>([]);
    const [manufacturers_list, setManufacturersList] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        basePrice: 0,
        unit: 'Cái',
        categoryId: '',
        manufacturerId: '',
        supplierId: '',
        priceExpiry: '',
        leadTime: '',
        taxRate: 0,
        publicPrice: 0,
        exchangeRate: 25450,
        priceUsd: 0
    });

    useEffect(() => {
        if (isOpen) {
            const fetchExtraData = async () => {
                try {
                    const [sRes, cRes, mRes] = await Promise.all([
                        api.get('/suppliers'),
                        api.get('/categories'),
                        api.get('/manufacturers')
                    ]);
                    setSuppliers(sRes.data.data);
                    setCategoriesList(cRes.data.data);
                    setManufacturersList(mRes.data.data);
                } catch (err) {
                    console.error('Failed to fetch extra data', err);
                }
            };
            fetchExtraData();
            // Reset form data when modal opens
            setFormData({
                name: '',
                sku: '',
                description: '',
                basePrice: 0,
                unit: 'Cái',
                categoryId: '',
                manufacturerId: '',
                supplierId: '',
                priceExpiry: '',
                leadTime: '',
                taxRate: 0,
                publicPrice: 0,
                exchangeRate: 25450,
                priceUsd: 0
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const response = await api.post('/products', formData);
            onSuccess(response.data.data);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0d121f] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-400" />
                        Thêm Sản phẩm mới
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                    <Tag className="w-3 h-3" /> Tên sản phẩm *
                                </label>
                                <input 
                                    required
                                    autoFocus
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                    <Hash className="w-3 h-3" /> Mã hàng (SKU) *
                                </label>
                                <input 
                                    required
                                    type="text" 
                                    value={formData.sku}
                                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Đơn vị tính</label>
                                <input 
                                    type="text" 
                                    value={formData.unit}
                                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Giá cơ sở (đ) *</label>
                                <input 
                                    required
                                    type="number" 
                                    value={formData.basePrice}
                                    onChange={(e) => setFormData({...formData, basePrice: Number(e.target.value)})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-blue-400 uppercase">Giá USD</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={formData.priceUsd}
                                    onChange={(e) => {
                                        const usd = Number(e.target.value);
                                        setFormData({
                                            ...formData, 
                                            priceUsd: usd,
                                            basePrice: Math.round(usd * formData.exchangeRate)
                                        });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-blue-400 uppercase">Tỷ giá</label>
                                <input 
                                    type="number" 
                                    value={formData.exchangeRate}
                                    onChange={(e) => {
                                        const rate = Number(e.target.value);
                                        setFormData({
                                            ...formData, 
                                            exchangeRate: rate,
                                            basePrice: Math.round(formData.priceUsd * rate)
                                        });
                                    }}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Thuế (%)</label>
                                <input 
                                    type="number" 
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData({...formData, taxRate: Number(e.target.value)})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                                    placeholder="VD: 10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Hạn hiệu lực giá</label>
                                <input 
                                    type="date" 
                                    value={formData.priceExpiry}
                                    onChange={(e) => setFormData({...formData, priceExpiry: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Thời gian giao hàng</label>
                                <input 
                                    type="text" 
                                    value={formData.leadTime}
                                    onChange={(e) => setFormData({...formData, leadTime: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                                    placeholder="VD: 2-4 tuần"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Giá Public (Tham khảo)</label>
                                <input 
                                    type="number" 
                                    value={formData.publicPrice}
                                    onChange={(e) => setFormData({...formData, publicPrice: Number(e.target.value)})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Phân loại</label>
                                <select 
                                    value={formData.categoryId}
                                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="" className="bg-[#0a0e1b]">-- Chọn phân loại --</option>
                                    {categories_list.map(c => (
                                        <option key={c.id} value={c.id} className="bg-[#0a0e1b]">{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">Nhà sản xuất</label>
                                <select 
                                    value={formData.manufacturerId}
                                    onChange={(e) => setFormData({...formData, manufacturerId: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="" className="bg-[#0a0e1b]">-- Chọn hãng --</option>
                                    {manufacturers_list.map(m => (
                                        <option key={m.id} value={m.id} className="bg-[#0a0e1b]">{m.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <Building2 className="w-3 h-3" /> Nhà cung cấp
                            </label>
                            <select 
                                value={formData.supplierId}
                                onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            >
                                <option value="" className="bg-[#0a0e1b]">-- Chọn --</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id} className="bg-[#0a0e1b]">{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5 border-t border-white/5 pt-4">
                            <label className="text-xs font-bold text-gray-500 uppercase">Mô tả sản phẩm</label>
                            <textarea 
                                rows={2} 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm" 
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button 
                            type="button"
                            disabled={submitting}
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-400 font-bold hover:bg-white/5 rounded-xl transition-all"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tạo sản phẩm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickAddProductModal;
