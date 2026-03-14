import React, { useState } from 'react';
import api from '../utils/api';
import { 
  X,
  Loader2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    taxCode?: string;
}

interface QuickAddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (customer: Customer) => void;
}

const QuickAddCustomerModal: React.FC<QuickAddCustomerModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxCode: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const response = await api.post('/customers', formData);
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
            <div className="bg-[#0d121f] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        Thêm Khách hàng mới
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Tên Công ty / Cá nhân *</label>
                            <input 
                                required
                                autoFocus
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                placeholder="VD: Công ty TNHH ABC"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                    <Mail className="w-3 h-3" /> Email
                                </label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                    placeholder="contact@abc.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                    <Phone className="w-3 h-3" /> Số điện thoại
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                    placeholder="09xxx..."
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase">Mã số thuế</label>
                            <input 
                                type="text" 
                                value={formData.taxCode}
                                onChange={(e) => setFormData({...formData, taxCode: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                placeholder="VD: 0101234567"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" /> Địa chỉ
                            </label>
                            <textarea 
                                rows={2} 
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                                placeholder="Địa chỉ văn phòng hoặc giao hàng..."
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
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tạo khách hàng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuickAddCustomerModal;
