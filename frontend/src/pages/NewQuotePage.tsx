import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { 
  User, 
  Package, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  FileCheck,
  Search,
  Loader2,
  AlertCircle,
  X,
  ChevronDown
} from 'lucide-react';
import QuickAddCustomerModal from '../components/QuickAddCustomerModal';
import QuickAddProductModal from '../components/QuickAddProductModal';

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
  unit: string;
  sku: string;
  taxRate?: number;
  leadTime?: string;
  manufacturer?: { name: string };
  category?: { name: string };
  priceExpiry?: string;
}

interface QuoteItem {
  tempId: number;
  productId: string;
  name: string;
  quantity: number;
  targetPrice: number;
  taxRate: number;
  leadTime: string;
  priceExpiry?: string;
}

const NewQuotePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCustomerId = searchParams.get('customerId') || '';
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data from API
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);
  const [items, setItems] = useState<QuoteItem[]>([
    { tempId: Date.now(), productId: '', name: '', quantity: 1, targetPrice: 0, taxRate: 0, leadTime: '' }
  ]);
  // Search & Filter State
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [productSearch, setProductSearch] = useState<{ [key: number]: string }>({});
  const [activeProductDropdown, setActiveProductDropdown] = useState<number | null>(null);

  // Modal State
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);
  const [isQuickProductOpen, setIsQuickProductOpen] = useState(false);
  const [activeTempPriceId, setActiveTempPriceId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [approvalDeadline, setApprovalDeadline] = useState('');
  const [purchasingDeadline, setPurchasingDeadline] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers'),
          api.get('/products')
        ]);
        setAvailableCustomers(custRes.data.data || []);
        setAvailableProducts(prodRes.data.data || []);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setError('Không thể tải danh sách khách hàng hoặc sản phẩm.');
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems([...items, { tempId: Date.now(), productId: '', name: '', quantity: 1, targetPrice: 0, taxRate: 0, leadTime: '' }]);
  };

  const removeItem = (tempId: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.tempId !== tempId));
    }
  };

  const handleProductChange = (tempId: number, product: Product) => {
    setItems(items.map(item => 
      item.tempId === tempId 
        ? { 
            ...item, 
            productId: product.id, 
            name: product.name, 
            targetPrice: Number(product.basePrice),
            taxRate: Number(product.taxRate || 0),
            leadTime: product.leadTime || '',
            priceExpiry: product.priceExpiry
          } 
        : item
    ));
    setProductSearch({ ...productSearch, [tempId]: '' });
    setActiveProductDropdown(null);
  };

  const updateItem = (tempId: number, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => item.tempId === tempId ? { ...item, [field]: value } : item));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.targetPrice), 0);
  };

  const calculateTotalWithTax = () => {
    return items.reduce((acc, item) => {
      const lineTotal = item.quantity * item.targetPrice;
      const taxAmount = lineTotal * (item.taxRate / 100);
      return acc + lineTotal + taxAmount;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      setError('Vui lòng chọn khách hàng');
      setStep(1);
      return;
    }

    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setError('Vui lòng chọn ít nhất một sản phẩm');
      setStep(2);
      return;
    }

    // Validation: Expiry date cannot exceed min priceExpiry
    const expiries = validItems.map(i => i.priceExpiry ? new Date(i.priceExpiry).getTime() : Infinity);
    const minExpiryTime = Math.min(...expiries);
    
    if (expiryDate && minExpiryTime !== Infinity) {
        if (new Date(expiryDate).getTime() > minExpiryTime) {
            setError('Ngày hiệu lực chung không được vượt quá Hạn mức giá ngắn nhất của sản phẩm (' + new Date(minExpiryTime).toLocaleDateString('vi-VN') + ').');
            setStep(3);
            return;
        }
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/quotes', {
        customerId: selectedCustomerId,
        items: validItems.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          targetPrice: i.targetPrice,
          priceExpiry: i.priceExpiry
        })),
        notes,
        expiryDate: expiryDate || undefined,
        approvalDeadline: approvalDeadline || undefined,
        purchasingDeadline: purchasingDeadline || undefined
      });
      // Redirect to list or dashboard on success
      navigate('/dashboard'); 
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Có lỗi xảy ra khi tạo báo giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white">Tạo Báo giá mới</h1>
        <p className="text-gray-500">Hoàn thành các bước dưới đây để tạo một yêu cầu báo giá mới.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stepper */}
      <div className="flex items-center justify-between px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10 -translate-y-1/2"></div>
        {[
          { s: 1, label: 'Thông tin khách hàng', icon: User },
          { s: 2, label: 'Chọn sản phẩm', icon: Package },
          { s: 3, label: 'Xem lại & Gửi', icon: FileCheck },
        ].map((item) => (
          <div key={item.s} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              step >= item.s 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-[#0a0e1b] border-white/10 text-gray-500'
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium ${step >= item.s ? 'text-blue-400' : 'text-gray-500'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-white mb-4">Thông tin khách hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Chọn khách hàng</label>
                <div className="relative">
                  <div 
                    onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer flex items-center justify-between"
                  >
                    <span className={selectedCustomerId ? 'text-white' : 'text-gray-500'}>
                      {availableCustomers.find(c => c.id === selectedCustomerId)?.name || '-- Tìm kiếm khách hàng --'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isCustomerDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#0d121f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3 border-b border-white/5 flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Nhập tên khách hàng..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="bg-transparent border-none text-white text-sm focus:outline-none flex-1"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {availableCustomers
                          .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
                          .map(c => (
                            <div 
                              key={c.id}
                              onClick={() => {
                                setSelectedCustomerId(c.id);
                                setIsCustomerDropdownOpen(false);
                                setCustomerSearch('');
                              }}
                              className="px-4 py-3 hover:bg-blue-600/20 text-sm text-gray-300 hover:text-white cursor-pointer transition-colors border-b border-white/[0.02]"
                            >
                              {c.name}
                            </div>
                          ))
                        }
                        <div 
                          onClick={() => setIsQuickCustomerOpen(true)}
                          className="px-4 py-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600 text-sm font-bold cursor-pointer transition-all flex items-center gap-2 border-t border-blue-500/20"
                        >
                          <Plus className="w-4 h-4" />
                          Thêm khách hàng mới
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Hạn thanh toán (Ngày)</label>
                <input type="number" defaultValue={30} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none" />
              </div>
            </div>

            <div className="space-y-2 pt-4">
                <label className="text-sm text-gray-400">Ghi chú yêu cầu (Tùy chọn)</label>
                <textarea 
                  rows={4} 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none" 
                  placeholder="Nhập ghi chú cho bộ phận thu mua..."
                ></textarea>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Danh sách sản phẩm</h3>
              <button 
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 rounded-xl text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Thêm sản phẩm
              </button>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                    <th className="pb-4 pt-2">Sản phẩm</th>
                    <th className="pb-4 pt-2 w-24">Số lượng</th>
                    <th className="pb-4 pt-2 w-32">Giá mục tiêu (đ)</th>
                    <th className="pb-4 pt-2 w-20 text-center">Thuế</th>
                    <th className="pb-4 pt-2 w-32">Giao hàng</th>
                    <th className="pb-4 pt-2 text-right w-40">Thành tiền (Thuế)</th>
                    <th className="pb-4 pt-2 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item) => (
                    <tr key={item.tempId} className="group hover:bg-white/[0.01]">
                      <td className="py-4 pr-4">
                        <div className="relative">
                          <div 
                            onClick={() => setActiveProductDropdown(item.tempId)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer flex items-center justify-between"
                          >
                            <span className={item.productId ? 'text-white' : 'text-gray-500 text-sm'}>
                              {item.name || '-- Chọn sản phẩm --'}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </div>

                          {activeProductDropdown === item.tempId && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-[#0d121f] border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden min-w-[300px]">
                              <div className="p-2 border-b border-white/5 flex items-center gap-2">
                                <Search className="w-3.5 h-3.5 text-gray-500" />
                                <input 
                                  autoFocus
                                  type="text" 
                                  placeholder="Tìm sản phẩm..."
                                  value={productSearch[item.tempId] || ''}
                                  onChange={(e) => setProductSearch({...productSearch, [item.tempId]: e.target.value})}
                                  className="bg-transparent border-none text-white text-xs focus:outline-none flex-1"
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {availableProducts
                                  .filter(p => p.name.toLowerCase().includes((productSearch[item.tempId] || '').toLowerCase()) || p.sku.toLowerCase().includes((productSearch[item.tempId] || '').toLowerCase()))
                                  .map(p => (
                                      <div 
                                        key={p.id}
                                        onClick={() => handleProductChange(item.tempId, p)}
                                        className="px-3 py-2 hover:bg-blue-600/20 text-xs text-gray-300 hover:text-white cursor-pointer transition-colors flex justify-between items-center border-b border-white/[0.02]"
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium text-sm">{p.name}</span>
                                          <div className="flex gap-2 items-center text-[10px] text-gray-500 mt-0.5">
                                            <span className="uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded">{p.sku}</span>
                                            {p.manufacturer && <span className="text-blue-400">{p.manufacturer.name}</span>}
                                            {p.category && <span>• {p.category.name}</span>}
                                            {p.priceExpiry && <span className="text-yellow-500">Hạn giá: {new Date(p.priceExpiry).toLocaleDateString('vi-VN')}</span>}
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-blue-400 font-bold text-sm">{Number(p.basePrice).toLocaleString()}đ</span>
                                            {p.leadTime && <span className="text-[10px] text-gray-500">Giao: {p.leadTime}</span>}
                                        </div>
                                      </div>
                                  ))
                                }
                                <div 
                                  onClick={() => {
                                    setIsQuickProductOpen(true);
                                    setActiveTempPriceId(item.tempId);
                                  }}
                                  className="px-3 py-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
                                >
                                  <Plus className="w-4 h-4" />
                                  Sản phẩm mới
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <input 
                          type="number" 
                          min="1"
                          className="w-20 bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.tempId, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <input 
                          type="number" 
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 text-white text-right focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                          value={item.targetPrice}
                          onChange={(e) => updateItem(item.tempId, 'targetPrice', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-lg py-1.5 w-16">
                            <span className="text-white text-sm">{item.taxRate}%</span>
                        </div>
                      </td>
                      <td className="py-4">
                         <div className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-3 w-full">
                            <span className="text-gray-300 text-sm truncate block">{item.leadTime || '-'}</span>
                         </div>
                      </td>
                      <td className="py-4 text-right text-gray-300 font-medium">
                        <div className="flex flex-col items-end">
                            <span>{(item.quantity * item.targetPrice).toLocaleString()}đ</span>
                            {item.taxRate > 0 && (
                                <span className="text-[10px] text-blue-400 mt-0.5">
                                    +{(item.quantity * item.targetPrice * (item.taxRate / 100)).toLocaleString()}đ (VAT)
                                </span>
                            )}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => removeItem(item.tempId)}
                          className="text-gray-700 hover:text-red-500 transition-colors p-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col items-end gap-2">
                <div className="flex items-center justify-between w-64 text-gray-400 text-sm">
                    <span>Cộng tiền hàng:</span>
                    <span className="font-medium text-white">{calculateTotal().toLocaleString()}đ</span>
                </div>
                <div className="flex items-center justify-between w-64 text-blue-400 text-sm">
                    <span>Tiền thuế VAT:</span>
                    <span className="font-medium">{(calculateTotalWithTax() - calculateTotal()).toLocaleString()}đ</span>
                </div>
                <div className="flex items-center justify-between w-64 text-gray-400 mt-2 border-t border-white/10 pt-2">
                    <span className="text-sm font-bold">Tổng thanh toán:</span>
                    <span className="text-2xl font-bold text-white">{calculateTotalWithTax().toLocaleString()}đ</span>
                </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-300">
             <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-500">
                <FileCheck className="w-6 h-6" />
                <div>
                    <p className="font-bold">Mọi thứ đã sẵn sàng!</p>
                    <p className="text-sm opacity-80">Vui lòng kiểm tra lại thông tin trước khi gửi yêu cầu báo giá.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Hiệu lực báo giá (Hết hạn)</label>
                  <input 
                    type="date" 
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                  {error && error.includes('Hạn mức giá ngắn nhất') && (
                    <p className="text-xs text-red-500 mt-1">{error}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Hạn phê duyệt (Approval)</label>
                  <input 
                    type="date" 
                    value={approvalDeadline}
                    onChange={(e) => setApprovalDeadline(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Hạn giá NCC (Purchasing)</label>
                  <input 
                    type="date" 
                    value={purchasingDeadline}
                    onChange={(e) => setPurchasingDeadline(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                  />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider opacity-60">Khách hàng</h4>
                    <p className="text-lg text-blue-400 font-medium">
                      {availableCustomers.find(c => c.id === selectedCustomerId)?.name || 'Chưa chọn'}
                    </p>
                </div>
                <div className="space-y-4 md:text-right">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider opacity-60">Tổng giá trị dự kiến (Đã VAT)</h4>
                    <p className="text-3xl font-bold text-white">{calculateTotalWithTax().toLocaleString()}đ</p>
                </div>
             </div>

             <div className="bg-white/[0.02] rounded-xl p-6 border border-white/5">
                 <p className="text-sm text-gray-500 mb-4 font-medium uppercase tracking-widest">Tóm tắt sản phẩm ({items.filter(i => i.productId).length})</p>
                 <div className="space-y-3">
                    {items.filter(i => i.productId).map(item => (
                            <div key={item.tempId} className="flex justify-between items-center text-sm py-2 border-b border-white/[0.03] last:border-0">
                                <div className="flex flex-col">
                                  <span className="text-gray-300 font-medium">{item.name}</span>
                                  <div className="text-xs text-gray-500 flex gap-3">
                                    <span>SL: {item.quantity}</span>
                                    {item.leadTime && <span>Giao: {item.leadTime}</span>}
                                    {item.priceExpiry && <span className="text-yellow-600">Hạn giá: {new Date(item.priceExpiry).toLocaleDateString('vi-VN')}</span>}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-white font-bold">{(item.quantity * item.targetPrice).toLocaleString()}đ</span>
                                    {item.taxRate > 0 && <span className="text-[10px] text-blue-400">VAT: {item.taxRate}%</span>}
                                </div>
                            </div>
                    ))}
                 </div>
             </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
          <button 
            disabled={step === 1 || loading}
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-0"
          >
            <ChevronLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="flex items-center gap-4">
            {step < 3 && (
              <button className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-all">
                  Lưu nháp
              </button>
            )}
            <button 
                onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
            >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {step === 3 ? 'Gửi Báo giá' : 'Tiếp tục'}
                    {step < 3 && <ChevronRight className="w-5 h-5" />}
                  </>
                )}
            </button>
          </div>
        </div>
      </div>
      <QuickAddCustomerModal 
        isOpen={isQuickCustomerOpen}
        onClose={() => setIsQuickCustomerOpen(false)}
        onSuccess={(customer) => {
          setAvailableCustomers([...availableCustomers, customer]);
          setSelectedCustomerId(customer.id);
        }}
      />

      <QuickAddProductModal 
        isOpen={isQuickProductOpen}
        onClose={() => setIsQuickProductOpen(false)}
        onSuccess={(product) => {
          setAvailableProducts([...availableProducts, product as any]);
          if (activeTempPriceId) {
            handleProductChange(activeTempPriceId, product as any);
          }
        }}
      />
    </div>
  );
};

export default NewQuotePage;
