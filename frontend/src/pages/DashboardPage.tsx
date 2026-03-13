import React from 'react';
import { 
  FileEdit, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 hover:bg-white/10 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className={`flex items-center text-xs font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const DashboardPage = () => {
  const kpis = [
    { title: 'Bản nháp', value: 12, icon: FileEdit, color: 'blue', trend: 8 },
    { title: 'Chờ phê duyệt', value: 5, icon: Clock, color: 'orange', trend: -2 },
    { title: 'Đã phê duyệt', value: 28, icon: CheckCircle2, color: 'green', trend: 15 },
    { title: 'Vi phạm SLA', value: 2, icon: AlertCircle, color: 'red', trend: 0 },
  ];

  const recentQuotes = [
    { id: 'QT-2026-001', customer: 'Công ty TNHH Hưng Phát', amount: '15,200,000đ', status: 'Đã duyệt', date: '10/03/2026' },
    { id: 'QT-2026-002', customer: 'Tập đoàn ABC', amount: '42,500,000đ', status: 'Chờ duyệt', date: '12/03/2026' },
    { id: 'QT-2026-003', customer: 'Nguyễn Văn A', amount: '2,800,000đ', status: 'Bản nháp', date: '13/03/2026' },
    { id: 'QT-2026-004', customer: 'Công ty XD Minh Tâm', amount: '120,000,000đ', status: 'Vi phạm SLA', date: '08/03/2026' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white">Chào mừng trở lại, Quản trị viên Demo!</h1>
        <p className="text-gray-500">Dưới đây là tóm tắt hoạt động báo giá của bạn ngày hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold text-lg">Số lượng báo giá theo tuần</h3>
            <select className="bg-white/5 border border-white/10 text-gray-400 text-xs rounded-lg px-2 py-1 outline-none">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[45, 60, 35, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div 
                  className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/20 rounded-t-lg transition-all"
                  style={{ height: `${h}%` }}
                ></div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-600 font-medium">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <TrendingUp className="w-12 h-12 text-blue-500 mb-4 opacity-20" />
          <h3 className="text-gray-400 mb-2">Tỉ lệ trạng thái</h3>
          <div className="relative w-40 h-40">
            {/* Simple CSS Donut placeholder */}
            <div className="absolute inset-0 border-[12px] border-blue-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-[12px] border-blue-500 border-t-transparent border-l-transparent rounded-full rotate-45"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">72%</span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">Hoàn thành</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 w-full text-left">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-400">Đã duyệt</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-400">Chờ duyệt</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">Hoạt động gần đây</h3>
          <button className="text-blue-500 text-sm font-medium hover:underline">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Mã báo giá</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4 text-right">Tổng tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentQuotes.map((quote, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-blue-400 font-mono">{quote.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{quote.customer}</td>
                  <td className="px-6 py-4 text-sm text-white font-semibold text-right">{quote.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                      quote.status === 'Đã duyệt' ? 'bg-green-500/10 text-green-500' :
                      quote.status === 'Chờ duyệt' ? 'bg-orange-500/10 text-orange-500' :
                      quote.status === 'Bản nháp' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{quote.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
