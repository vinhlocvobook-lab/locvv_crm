import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Package, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2,
  FolderOpen
} from 'lucide-react';

const ProductListPage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                setProducts(response.data.data);
            } catch (err) {
                console.error('Failed to fetch products', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Danh mục Sản phẩm</h1>
                    <p className="text-gray-500">Quản lý danh sách hàng hóa và quy cách sản phẩm.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all">
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
                            <th className="px-6 py-4 text-right">Giá cơ sở</th>
                            <th className="px-6 py-4 text-right">Ngày cập nhật</th>
                            <th className="px-6 py-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Đang tải dữ liệu...</td>
                            </tr>
                        ) : products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-500">Chưa có sản phẩm nào trong danh mục.</p>
                                    <button className="text-blue-500 text-sm mt-2 hover:underline">Tạo sản phẩm đầu tiên</button>
                                </td>
                            </tr>
                        ) : products.map((product) => (
                            <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium text-white">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400 font-mono">{product.sku}</td>
                                <td className="px-6 py-4 text-sm text-gray-400">{product.unit || '-'}</td>
                                <td className="px-6 py-4 text-sm text-white font-semibold text-right">
                                    {parseFloat(product.basePrice).toLocaleString()}đ
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 text-right">
                                    {new Date(product.updatedAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductListPage;
