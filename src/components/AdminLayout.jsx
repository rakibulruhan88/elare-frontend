import { Navigate, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (!userInfo.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-[#f1f2f4] overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Mobile Top Header (Prevents overlap) */}
        <div className="md:hidden h-14 bg-white border-b border-gray-200 flex-shrink-0 w-full z-30 flex items-center justify-center shadow-sm">
           <span className="font-bold text-gray-800 tracking-widest uppercase text-sm">Dashboard</span>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;