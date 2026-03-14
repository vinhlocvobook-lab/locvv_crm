import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  FileText,
  Search,
  Plus,
  Filter,
  ChevronRight,
  Calendar,
  User,
  Building,
  ArrowRight,
  Send,
  Truck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Edit
} from 'lucide-react';
import SupplierPriceModal from '../components/SupplierPriceModal';

const QuoteListPage = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [activeQuote, setActiveQuote] = useState<any>(null);

  const fetchQuotes = async () => {
    try {
      const response = await api.get('/quotes');
      setQuotes(response.data.items || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách báo giá:', err);
      setError('Không thể tải danh sách báo giá.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20">NHÁP</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">ĐÃ GỬI</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">ĐÃ DUYỆT</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 text-white border border-white/10">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Quản lý Báo giá</h1>
          <p className="text-gray-500">Theo dõi trạng thái và lịch sử các yêu cầu báo giá.</p>
        </div>
        <button 
          onClick={() => navigate('/quotes/new')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all w-fit"
        >
          <Plus className="w-5 h-5" />
          Tạo báo giá mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                 <Clock className="w-5 h-5" />
              </div>
              <span className="text-gray-400 font-medium">Đang chờ xử lý</span>
           </div>
           <p className="text-2xl font-bold text-white">{quotes.filter(q => q.status === 'SUBMITTED').length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                 <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-gray-400 font-medium">Đã phê duyệt</span>
           </div>
           <p className="text-2xl font-bold text-white">{quotes.filter(q => q.status === 'APPROVED').length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
           <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                 <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-gray-400 font-medium">Cần báo giá lại</span>
           </div>
           <p className="text-2xl font-bold text-white">0</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between text-white/60">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm kiếm báo giá (ID, Khách hàng)..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4">Mã Báo Giá</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Giá trị</th>
                <th className="px-6 py-4">Hiệu lực</th>
                <th className="px-6 py-4">Hạn Duyệt / Giá NCC</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Chưa có báo giá nào được tạo.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-blue-400 font-bold whitespace-nowrap">
                        #{quote.id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{quote.customer?.name}</div>
                      <div className="text-xs text-gray-500">{quote.customer?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{quote.sales?.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold">{Number(quote.totalAmount).toLocaleString()} {quote.currency}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {quote.expiryDate ? new Date(quote.expiryDate).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div className="flex flex-col gap-1">
                        <span>Duyệt: {quote.approvalDeadline ? new Date(quote.approvalDeadline).toLocaleDateString('vi-VN') : '-'}</span>
                        <span>Giá: {quote.purchasingDeadline ? new Date(quote.purchasingDeadline).toLocaleDateString('vi-VN') : '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(quote.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(quote.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 flex items-center justify-center gap-2">
                        {quote.status === 'DRAFT' && (
                            <>
                              <button 
                                  onClick={() => navigate(`/quotes/${quote.id}/edit`)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all"
                              >
                                  <Edit className="w-3.5 h-3.5" />
                                  Sửa
                              </button>
                              <button 
                                  onClick={async () => {
                                      await api.post(`/quotes/${quote.id}/submit`);
                                      fetchQuotes();
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-all"
                              >
                                  <Send className="w-3.5 h-3.5" />
                                  Gửi Purchasing
                              </button>
                            </>
                        )}
                        {quote.status === 'REQUESTING_SUPPLIER_PRICE' && (
                            <button 
                                onClick={() => {
                                    setActiveQuote(quote);
                                    setIsPriceModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all"
                            >
                                <Truck className="w-3.5 h-3.5" />
                                Nhập giá NCC
                            </button>
                        )}
                        {quote.status === 'SUPPLIER_PRICE_COLLECTED' && (
                            <button 
                                onClick={() => navigate(`/quotes/${quote.id}/approve`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-all"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Xem & Duyệt
                            </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isPriceModalOpen && activeQuote && (
          <SupplierPriceModal 
            quoteId={activeQuote.id}
            items={activeQuote.items}
            onClose={() => setIsPriceModalOpen(false)}
            onSuccess={() => {
                setIsPriceModalOpen(false);
                fetchQuotes();
            }}
          />
      )}
    </div>
  );
};

export default QuoteListPage;
