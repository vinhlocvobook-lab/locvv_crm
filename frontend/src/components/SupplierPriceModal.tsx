import React, { useEffect, useState } from 'react';
import { 
  X, 
  Loader2, 
  AlertCircle,
  Building,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/api';

interface Product {
    id: string;
    name: string;
    sku: string;
}

interface QuoteItem {
    productId: string;
    quantity: number;
    product: Product;
}

interface Supplier {
    id: string;
    name: string;
}

interface Props {
    quoteId: string;
    items: QuoteItem[];
    onClose: () => void;
    onSuccess: () => void;
}

const SupplierPriceModal: React.FC<Props> = ({ quoteId, items, onClose, onSuccess }) => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);
    const [fetchingSuppliers, setFetchingSuppliers] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/suppliers');
                setSuppliers(response.data.data);
            } catch (err) {
                console.error('Failed to fetch suppliers', err);
            } finally {
                setFetchingSuppliers(false);
            }
        };
        fetchSuppliers();

        // Initialize prices
        const initialPrices: Record<string, number> = {};
        items.forEach(item => {
            initialPrices[item.productId] = 0;
        });
        setPrices(initialPrices);
    }, [items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplier) {
            setError('Vui lòng chọn nhà cung cấp.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                supplierId: selectedSupplier,
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: prices[item.productId] || 0
                }))
            };

            await api.post(`/quotes/${quoteId}/supplier-quotes`, payload);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Có lỗi xảy ra khi lưu giá.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0d121f] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-500" />
                        Nhập giá từ Nhà cung cấp
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Chọn Nhà cung cấp</label>
                            {fetchingSuppliers ? (
                                <div className="animate-pulse h-10 bg-white/5 rounded-xl"></div>
                            ) : (
                                <select 
                                    required
                                    value={selectedSupplier}
                                    onChange={(e) => setSelectedSupplier(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="" className="bg-[#0d121f]">-- Chọn đối tác --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id} className="bg-[#0d121f]">{s.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Bảng giá sản phẩm</label>
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/5">
                                            <th className="px-4 py-3 text-gray-400 font-medium">Sản phẩm</th>
                                            <th className="px-4 py-3 text-gray-400 font-medium text-center">Số lượng</th>
                                            <th className="px-4 py-3 text-gray-400 font-medium text-right w-32">Đơn giá nhập</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {items.map((item) => (
                                            <tr key={item.productId}>
                                                <td className="px-4 py-3">
                                                    <div className="text-white font-medium">{item.product.name}</div>
                                                    <div className="text-xs text-gray-500">{item.product.sku}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center text-gray-400">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="relative">
                                                        <input 
                                                            type="number"
                                                            required
                                                            min="0"
                                                            value={prices[item.productId]}
                                                            onChange={(e) => setPrices({...prices, [item.productId]: parseFloat(e.target.value)})}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-2 pr-2 text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-400 font-bold hover:bg-white/5 rounded-xl transition-all"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            disabled={loading || !selectedSupplier}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            Lưu báo giá NCC
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierPriceModal;
