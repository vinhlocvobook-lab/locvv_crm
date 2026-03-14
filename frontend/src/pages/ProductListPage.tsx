import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Package, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  FolderOpen,
  X,
  Loader2,
  AlertCircle,
  Clock,
  CircleDollarSign,
  Percent
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    sku: string;
    description: string;
    basePrice: string | number;
    unit: string;
    updatedAt: string;
    categoryId?: string;
    manufacturerId?: string;
    supplierId?: string;
    priceExpiry?: string;
    leadTime?: string;
    taxRate?: string | number;
    publicPrice?: string | number;
    exchangeRate?: string | number;
    priceUsd?: string | number;
    category?: { name: string };
    manufacturer?: { name: string };
    supplier?: { name: string };
}

const ProductListPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [categories_list, setCategoriesList] = useState<any[]>([]);
    const [manufacturers_list, setManufacturersList] = useState<any[]>([]);

    // Form states
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
        exchangeRate: 25450, // Default exchange rate
        priceUsd: 0
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data.data);
        } catch (err) {
            console.error('Failed to fetch products', err);
            setError('Không thể tải danh sách sản phẩm.');
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchProducts();
        fetchExtraData();
    }, []);

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                sku: product.sku,
                description: product.description || '',
                basePrice: Number(product.basePrice),
                unit: product.unit || 'Cái',
                categoryId: product.categoryId || '',
                manufacturerId: product.manufacturerId || '',
                supplierId: product.supplierId || '',
                priceExpiry: product.priceExpiry ? product.priceExpiry.split('T')[0] : '',
                leadTime: product.leadTime || '',
                taxRate: Number(product.taxRate || 0),
                publicPrice: Number(product.publicPrice || 0),
                exchangeRate: Number(product.exchangeRate || 25450),
                priceUsd: Number(product.priceUsd || 0)
            });
        } else {
            setEditingProduct(null);
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
        setIsModalOpen(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            alert('Không thể xóa sản phẩm.');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Danh mục Sản phẩm</h1>
                    <p className="text-gray-500">Quản lý danh sách hàng hóa và quy cách sản phẩm.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Thêm sản phẩm
                </button>
            </div>

            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo SKU, tên sản phẩm..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors">
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">Bộ lọc</span>
                </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/[0.02] text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                            <th className="px-6 py-4">Sản phẩm</th>
                            <th className="px-6 py-4">SKU</th>
                            <th className="px-6 py-4">Đơn vị</th>
                            <th className="px-6 py-4">Phân loại / Hãng</th>
                            <th className="px-6 py-4">Nhà cung cấp</th>
                            <th className="px-6 py-4 text-right">Giá cơ sở / USD</th>
                            <th className="px-6 py-4 text-right">Giao hàng / Công bố</th>
                            <th className="px-6 py-4 w-12 text-center text-white">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">Đang tải dữ liệu...</td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-20 text-center">
                                    <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-500">Chưa có sản phẩm nào trong danh mục.</p>
                                    <button onClick={() => handleOpenModal()} className="text-blue-500 text-sm mt-2 hover:underline">Tạo sản phẩm đầu tiên</button>
                                </td>
                            </tr>
                        ) : products.map((product) => (
                            <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white">{product.name}</span>
                                            {product.description && <span className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400 font-mono">{product.sku}</td>
                                <td className="px-6 py-4 text-sm text-gray-400">{product.unit || '-'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-blue-400 font-medium uppercase tracking-wider">{product.category?.name || 'Vãng lai'}</span>
                                        <span className="text-xs text-gray-400">{product.manufacturer?.name || '-'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">{product.supplier?.name || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm text-white font-semibold flex items-center gap-1.5">
                                            {parseFloat(product.basePrice as string).toLocaleString()}đ
                                            {product.taxRate && parseFloat(product.taxRate as string) > 0 && (
                                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                                                    +{product.taxRate}%
                                                </span>
                                            )}
                                        </span>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {product.priceUsd && parseFloat(product.priceUsd as string) > 0 && (
                                                <span className="text-[10px] text-gray-400">
                                                    ${parseFloat(product.priceUsd as string).toLocaleString()}
                                                </span>
                                            )}
                                            {product.priceExpiry && (
                                                <span className={`text-[10px] font-medium ${new Date(product.priceExpiry) < new Date() ? 'text-red-400' : 'text-gray-500'}`}>
                                                    Hạn: {new Date(product.priceExpiry).toLocaleDateString('vi-VN')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm text-gray-300">
                                            {product.leadTime || 'N/A'}
                                        </span>
                                        {product.publicPrice && parseFloat(product.publicPrice as string) > 0 && (
                                            <span className="text-[10px] text-gray-500 italic">
                                                Pub: {parseFloat(product.publicPrice as string).toLocaleString()}đ
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => handleOpenModal(product)}
                                            className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product.id)}
                                            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0d121f] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Tên sản phẩm *</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                            placeholder="VD: Thép tấm A"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">SKU / Mã hàng *</label>
                                        <input 
                                            required
                                            type="text" 
                                            value={formData.sku}
                                            onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                            placeholder="VD: TP-001"
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
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                            placeholder="VD: Cái, Mét, Kg"
                                        />
                                    </div>
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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Nhà cung cấp</label>
                                        <select 
                                            value={formData.supplierId}
                                            onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        >
                                            <option value="" className="bg-[#0a0e1b]">-- Chọn nhà cung cấp --</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id} className="bg-[#0a0e1b]">{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-blue-400 uppercase">Giá cơ sở (VNĐ) *</label>
                                    <div className="relative">
                                        <input 
                                            required
                                            type="number" 
                                            value={formData.basePrice}
                                            onChange={(e) => setFormData({...formData, basePrice: Number(e.target.value)})}
                                            className="w-full bg-white/5 border border-blue-500/30 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" 
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">VNĐ</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <CircleDollarSign className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Ước tính theo ngoại tệ</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Giá USD</label>
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
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Tỷ giá (1 USD = ?)</label>
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
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <Percent className="w-3 h-3" /> Thuế (%)
                                        </label>
                                        <input 
                                            type="number" 
                                            value={formData.taxRate}
                                            onChange={(e) => setFormData({...formData, taxRate: Number(e.target.value)})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                            placeholder="VD: 10"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Hạn hiệu lực giá</label>
                                        <input 
                                            type="date" 
                                            value={formData.priceExpiry}
                                            onChange={(e) => setFormData({...formData, priceExpiry: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <Clock className="w-3 h-3" /> Giao hàng
                                        </label>
                                        <input 
                                            type="text" 
                                            value={formData.leadTime}
                                            onChange={(e) => setFormData({...formData, leadTime: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                            placeholder="VD: 2-4 tuần"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Giá Public</label>
                                        <input 
                                            type="number" 
                                            value={formData.publicPrice}
                                            onChange={(e) => setFormData({...formData, publicPrice: Number(e.target.value)})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                            placeholder="VNĐ"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Mô tả sản phẩm</label>
                                    <textarea 
                                        rows={3} 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                        placeholder="Thông tin quy cách, ghi chú..."
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
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingProduct ? 'Cập nhật' : 'Tạo mới')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductListPage;
