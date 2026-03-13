import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Users, 
  Search, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin,
  Building2
} from 'lucide-react';

const CustomerListPage = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await api.get('/customers');
                setCustomers(response.data.data);
            } catch (err) {
                console.error('Failed to fetch customers', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Quản lý Khách hàng</h1>
                    <p className="text-gray-500">Danh sách khách hàng và đối tác kinh doanh của bạn.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all">
                    <Plus className="w-5 h-5" />
                    Thêm khách hàng
                </button>
            </div>

            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm công ty, email, số điện thoại..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : customers.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500">Chưa có khách hàng nào trong hệ thống.</p>
                        <button className="text-blue-500 text-sm mt-2 hover:underline">Tạo khách hàng đầu tiên</button>
                    </div>
                ) : customers.map((customer) => (
                    <div key={customer.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all group relative">
                        <button className="absolute top-4 right-4 p-2 text-gray-600 hover:text-white transition-colors">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-white font-bold truncate pr-4">{customer.name}</h3>
                                <p className="text-gray-500 text-xs flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Active Client
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {customer.email && (
                                <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span className="truncate">{customer.email}</span>
                                </div>
                            )}
                            {customer.phone && (
                                <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                            {customer.address && (
                                <div className="flex items-center gap-3 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                    <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                                    <span className="truncate">{customer.address}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                                Tax: <span className="text-gray-400">{customer.taxCode || 'N/A'}</span>
                            </div>
                            <button className="text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-wider">
                                Xem báo giá
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CustomerListPage;
