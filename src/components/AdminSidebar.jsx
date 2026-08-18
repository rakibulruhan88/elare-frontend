import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdDashboard, MdInventory, MdPeople, MdShoppingCart, MdMessage, MdMenu, MdClose, MdLogout, MdPerson, MdCategory } from 'react-icons/md';

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: <MdDashboard /> },
    { name: 'Products', path: '/admin/products', icon: <MdInventory /> },
    { name: 'Collections', path: '/admin/collections', icon: <MdCategory /> }, 
    { name: 'Orders', path: '/admin/orders', icon: <MdShoppingCart /> },
    { name: 'Customers', path: '/admin/customers', icon: <MdPeople /> },
    { name: 'Messages', path: '/admin/messages', icon: <MdMessage /> }, 
    { name: 'AI Dashboard', path: '/admin/ai-dashboard', icon: <MdDashboard /> }, 
  ];

  return (
    <>
      {/* Mobile Hamburger Menu Button - Fixed Position Inside Top Bar */}
      <button 
        onClick={() => setIsOpen(true)} 
        className="md:hidden fixed top-2.5 left-4 z-40 bg-gray-900 text-white p-1.5 rounded-md shadow-md"
      >
        <MdMenu className="text-2xl" />
      </button>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" />
      )}

      <div className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <Link to="/" className="text-xl font-serif font-bold tracking-widest uppercase">
            ELARE<span className="text-yellow-400 text-xs block tracking-normal mt-1">Admin Panel</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <MdClose className="text-2xl" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive ? 'bg-yellow-400 text-black font-bold' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="text-sm tracking-wide">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout Section */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-800 p-2 rounded-full border border-gray-700">
              <MdPerson className="text-xl text-gray-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{userInfo?.name || 'Admin'}</p>
              <p className="text-xs text-yellow-400 truncate">{userInfo?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={logoutHandler}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white py-2.5 rounded-md transition-colors text-sm font-medium"
          >
            <MdLogout className="text-lg" />
            <span>Logout</span>
          </button>
        </div>

      </div>
    </>
  );
};

export default AdminSidebar;