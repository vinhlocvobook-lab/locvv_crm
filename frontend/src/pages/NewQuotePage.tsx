import React, { useState } from 'react';
import { 
  User, 
  Package, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  FileCheck,
  Search
} from 'lucide-react';

const NewQuotePage = () => {
  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState([{ id: 1, name: '', quantity: 1, price: 0 }]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white">Tạo Báo giá mới</h1>
        <p className="text-gray-500">Hoàn thành các bước dưới đây để tạo một yêu cầu báo giá mới.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between px-4 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -z-10 -translate-y-1/2"></div>
        {[
          { step: 1, label: 'Thông tin chung', icon: User },
          { step: 2, label: 'Chọn sản phẩm', icon: Package },
          { step: 3, label: 'Xem lại & Gửi', icon: FileCheck },
        ].map((s) => (
          <div key={s.step} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              step >= s.step 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-[#0a0e1b] border-white/10 text-gray-500'
            }`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium ${step >= s.step ? 'text-blue-400' : 'text-gray-500'}`}>
              {s.label}
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select 
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">-- Tìm kiếm khách hàng --</option>
                    <option value="1">Công ty TNHH Hưng Phát</option>
                    <option value="2">Tập đoàn ABC</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Hạn thanh toán (Ngày)</label>
                <input type="number" defaultValue={30} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none" />
              </div>
            </div>
            <div className="space-y-2 pt-4">
                <label className="text-sm text-gray-400">Ghi chú yêu cầu</label>
                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none" placeholder="Nhập ghi chú cho bộ phận thu mua..."></textarea>
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

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                    <th className="pb-4 pt-2">Tên sản phẩm / Quy cách</th>
                    <th className="pb-4 pt-2 w-24">Số lượng</th>
                    <th className="pb-4 pt-2 w-40">Giá mục tiêu</th>
                    <th className="pb-4 pt-2 text-right w-40">Thành tiền</th>
                    <th className="pb-4 pt-2 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {items.map((item) => (
                    <tr key={item.id} className="group">
                      <td className="py-4">
                        <input 
                          type="text" 
                          placeholder="Chọn hoặc nhập tên sản phẩm..." 
                          className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-gray-700"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        />
                      </td>
                      <td className="py-4">
                        <input 
                          type="number" 
                          className="w-20 bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-white text-center focus:outline-none"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-4">
                        <input 
                          type="number" 
                          className="w-32 bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-white text-right focus:outline-none"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-4 text-right text-gray-300 font-medium">
                        {(item.quantity * item.price).toLocaleString()}đ
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-700 hover:text-red-500 transition-colors p-1"
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
                <div className="flex items-center gap-8 text-gray-400">
                    <span className="text-sm">Tạm tính:</span>
                    <span className="text-xl font-bold text-white">{calculateTotal().toLocaleString()}đ</span>
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

             <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider opacity-60">Khách hàng</h4>
                    <p className="text-lg text-blue-400 font-medium">{customer === '1' ? 'Công ty TNHH Hưng Phát' : 'Tập đoàn ABC'}</p>
                </div>
                <div className="space-y-4 text-right">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider opacity-60">Tổng giá trị dự kiến</h4>
                    <p className="text-3xl font-bold text-white">{calculateTotal().toLocaleString()}đ</p>
                </div>
             </div>

             <div className="bg-white/[0.02] rounded-xl p-4">
                 <p className="text-sm text-gray-500 mb-4 font-medium uppercase">Tóm tắt sản phẩm ({items.length})</p>
                 <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm py-1">
                            <span className="text-gray-300">{item.name || '(Chưa đặt tên)'} x{item.quantity}</span>
                            <span className="text-white">{(item.quantity * item.price).toLocaleString()}đ</span>
                        </div>
                    ))}
                 </div>
             </div>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/10">
          <button 
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-0"
          >
            <ChevronLeft className="w-5 h-5" />
            Quay lại
          </button>

          <div className="flex items-center gap-4">
            <button className="px-6 py-3 text-gray-400 hover:text-white font-medium transition-all">
                Lưu nháp
            </button>
            <button 
                onClick={() => step < 3 ? setStep(step + 1) : alert('Đã gửi báo giá!')}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
                {step === 3 ? 'Gửi Báo giá' : 'Tiếp tục'}
                {step < 3 && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewQuotePage;
