import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MainLayout = () => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0e1b]">
      <Sidebar />
      <Header />
      <main className="ml-72 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
