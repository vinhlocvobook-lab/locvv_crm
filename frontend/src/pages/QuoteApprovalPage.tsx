import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  FileText, 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  User,
  Building,
  Loader2,
  Check
} from 'lucide-react';

interface QuoteItem {
  id: string;
  productId: string;
  quantity: number;
  targetPrice: number;
  product: {
    name: string;
    sku: string;
    unit: string;
  };
}

interface SupplierQuoteItem {
  productId: string;
  unitPrice: number;
}

interface SupplierQuote {
  id: string;
  supplierId: string;
  supplier: {
    name: string;
  };
  totalAmount: number;
  items: SupplierQuoteItem[];
}

interface QuoteDetail {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  customer: {
    name: string;
  };
  sales: {
    name: string;
  };
  items: QuoteItem[];
  supplierQuotes: SupplierQuote[];
}

const QuoteApprovalPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quote, setQuote] = useState<QuoteDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [finalPrices, setFinalPrices] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const response = await api.get(`/quotes/${id}`);
                setQuote(response.data.data);
                
                // Initialize final prices with best supplier price or target price
                const initialPrices: Record<string, number> = {};
                response.data.data.items.forEach((item: QuoteItem) => {
                    const supplierPrices = response.data.data.supplierQuotes.map((sq: SupplierQuote) => 
                        sq.items.find(i => i.productId === item.productId)?.unitPrice
                    ).filter(Boolean);
                    
                    const bestPrice = supplierPrices.length > 0 ? Math.min(...supplierPrices) : item.targetPrice;
                    initialPrices[item.productId] = bestPrice * 1.2; // Default 20% margin
                });
                setFinalPrices(initialPrices);
            } catch (err) {
                console.error('Failed to fetch quote details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuote();
    }, [id]);

    const handleApprove = async () => {
        setSubmitting(true);
        try {
            const payload = {
                finalPrices: Object.entries(finalPrices).map(([productId, price]) => ({
                    productId,
                    price
                }))
            };
            await api.post(`/quotes/${id}/approve`, payload);
            navigate('/quotes');
        } catch (err) {
            alert('Không thể phê duyệt báo giá. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
    if (!quote) return <div className="text-center py-20 text-gray-500">Không tìm thấy thông tin báo giá.</div>;

    const totalFinal = Object.values(finalPrices).reduce((acc, p) => acc + p, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/quotes')} className="p-2 hover:bg-white/5 rounded-xl text-gray-400">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Phê duyệt Báo giá</h1>
                        <p className="text-gray-500">So sánh giá và quyết định mức giá bán cuối cùng.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/quotes')}
                        className="px-6 py-3 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/5 transition-all"
                    >
                        Hủy
                    </button>
                    <button 
                        disabled={submitting}
                        onClick={handleApprove}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Phê duyệt & Chuyển Sales
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* General Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-500" />
                                Chi tiết yêu cầu
                            </h3>
                            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-bold">
                                {quote.status}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase font-bold">Khách hàng</p>
                                <p className="text-white font-medium">{quote.customer.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase font-bold">Người tạo (Sales)</p>
                                <p className="text-white font-medium">{quote.sales.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase font-bold">Giá mục tiêu</p>
                                <p className="text-white font-medium">{quote.totalAmount.toLocaleString()} {quote.currency}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase font-bold">Sản phẩm</p>
                                <p className="text-white font-medium">{quote.items.length} mặt hàng</p>
                            </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Sản phẩm</th>
                                        <th className="pb-4 text-xs font-bold text-gray-500 uppercase">SL</th>
                                        <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Giá MT</th>
                                        {quote.supplierQuotes.map(sq => (
                                            <th key={sq.id} className="pb-4 text-xs font-bold text-purple-500 uppercase">
                                                {sq.supplier.name}
                                            </th>
                                        ))}
                                        <th className="pb-4 text-xs font-bold text-green-500 uppercase">Giá Bán</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {quote.items.map((item) => (
                                        <tr key={item.id} className="border-b border-white/5 group">
                                            <td className="py-4">
                                                <div className="text-white font-medium">{item.product.name}</div>
                                                <div className="text-xs text-gray-500">{item.product.sku}</div>
                                            </td>
                                            <td className="py-4 text-gray-400">{item.quantity} {item.product.unit}</td>
                                            <td className="py-4 text-gray-400">{item.targetPrice.toLocaleString()}</td>
                                            {quote.supplierQuotes.map(sq => {
                                                const sqItem = sq.items.find(i => i.productId === item.productId);
                                                return (
                                                    <td key={sq.id} className="py-4 font-medium text-purple-400">
                                                        {sqItem ? sqItem.unitPrice.toLocaleString() : '---'}
                                                    </td>
                                                );
                                            })}
                                            <td className="py-4">
                                                <input 
                                                    type="number"
                                                    value={finalPrices[item.productId] || ''}
                                                    onChange={(e) => setFinalPrices({...finalPrices, [item.productId]: parseFloat(e.target.value)})}
                                                    className="w-24 bg-white/5 border border-green-500/30 rounded-lg py-1 px-2 text-green-400 focus:outline-none focus:ring-1 focus:ring-green-500/50"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#00d2ff]/10 border border-[#00d2ff]/20 rounded-2xl p-6 backdrop-blur-md">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-[#00d2ff]" />
                            Tóm tắt lợi nhuận
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Tổng giá trị bán</span>
                                <span className="text-white font-bold">{totalFinal.toLocaleString()} {quote.currency}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Margin dự kiến</span>
                                <span className="text-green-500 font-bold">+20.5%</span>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-xs text-gray-500 italic">
                                    "Giá bán đang cao hơn 5% so với mục tiêu ban đầu của Sales. Phù hợp với biên lợi nhuận kỳ vọng."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-white font-bold mb-4">Lịch sử thu thập giá</h3>
                        <div className="space-y-4">
                            {quote.supplierQuotes.map((sq, idx) => (
                                <div key={sq.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-gray-500">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">{sq.supplier.name}</p>
                                        <p className="text-xs text-gray-500">Đã nhập {sq.items.length} giá sản phẩm</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuoteApprovalPage;
