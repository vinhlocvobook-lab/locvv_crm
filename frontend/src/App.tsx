import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NewQuotePage from './pages/NewQuotePage';
import EditQuotePage from './pages/EditQuotePage';
import ProductListPage from './pages/ProductListPage';
import CustomerListPage from './pages/CustomerListPage';
import SupplierListPage from './pages/SupplierListPage';
import QuoteListPage from './pages/QuoteListPage';
import QuoteApprovalPage from './pages/QuoteApprovalPage';
import UserListPage from './pages/UserListPage';
import RoleListPage from './pages/RoleListPage';
import CategoryListPage from './pages/CategoryListPage';
import ManufacturerListPage from './pages/ManufacturerListPage';
import MainLayout from './components/MainLayout';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { verifySession } from './slices/authSlice';
import { AppDispatch, RootState } from './store';
import { Loader2 } from 'lucide-react';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isInitialized } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const init = async () => {
        await dispatch(verifySession());
    };
    init();
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0a0e1b] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/quotes" element={<QuoteListPage />} />
        <Route path="/quotes/:id/approve" element={<QuoteApprovalPage />} />
        <Route path="/quotes/:id/edit" element={<EditQuotePage />} />
        <Route path="/quotes/new" element={<NewQuotePage />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="/roles" element={<RoleListPage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/categories" element={<CategoryListPage />} />
        <Route path="/manufacturers" element={<ManufacturerListPage />} />
        <Route path="/customers" element={<CustomerListPage />} />
        <Route path="/suppliers" element={<SupplierListPage />} />
        {/* Fallback internal route */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Global Fallback: Only redirect to login if NOT authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
