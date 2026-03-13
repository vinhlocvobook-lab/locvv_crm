import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setCredentials, setLoading } from '../slices/authSlice';
import axios from 'axios';
import { Lock, Mail, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state: any) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    dispatch(setLoading(true));

    try {
      const response = await axios.post('/api/v1/auth/login', { email, password });
      const { user, token } = response.data.data;
      dispatch(setCredentials({ user, token }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1b] overflow-hidden relative">
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl mb-4 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">QMS</span>
            </div>
            <h1 className="text-2xl font-bold text-white text-center">Hệ thống Quản lý Báo giá</h1>
            <p className="text-gray-400 mt-2">Đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="admin@demo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-400 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-white/10 bg-white/5" />
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Quên mật khẩu?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
