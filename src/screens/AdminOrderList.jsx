import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdFilterList, MdDelete } from 'react-icons/md';

const AdminOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get('/api/orders', config);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching orders');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        await axios.delete(`/api/orders/${id}`, config);
        fetchOrders(); 
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting order');
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'Unfulfilled' && order.isDelivered) return false;
    if (activeTab === 'Unpaid' && order.isPaid) return false;

    const searchMatch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (order.user && order.user.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return searchMatch;
  });

  return (
    <div className="min-h-screen bg-[#f1f2f4] p-4 md:p-14 -mx-4 md:-mx-8 -my-4 md:-my-8 font-sans">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-2">
          <button className="text-[13px] font-medium text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-300 bg-white shadow-sm transition-colors">
            Export
          </button>
          <button className="bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-medium px-4 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1 ml-2">
            Create order
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        <div className="p-2 border-b border-gray-200 flex items-center gap-2">
          <div 
            onClick={() => setActiveTab('All')}
            className={`flex items-center px-3 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'All' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <span className="text-[13px]">All</span>
          </div>
          <div 
            onClick={() => setActiveTab('Unfulfilled')}
            className={`flex items-center px-3 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'Unfulfilled' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <span className="text-[13px]">Unfulfilled</span>
          </div>
          <div 
            onClick={() => setActiveTab('Unpaid')}
            className={`flex items-center px-3 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'Unpaid' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <span className="text-[13px]">Unpaid</span>
          </div>
          
          <div className="flex-1 ml-2 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input 
              type="text" 
              placeholder="Search orders"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-100/50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-lg text-[14px] text-gray-900 focus:outline-none transition-colors"
            />
          </div>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200 shadow-sm ml-2">
            <MdFilterList className="text-lg" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-sm">
              No orders found matching your criteria.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-4 py-3 w-12 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" />
                  </th>
                  <th className="px-4 py-3 text-[13px] font-medium text-gray-700">Order</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-gray-700">Date</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-gray-700">Total</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-gray-700">Payment status</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-gray-700">Fulfillment status</th>
                  <th className="px-4 py-3 text-right text-[13px] font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <td className="px-4 py-3 text-center w-12" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[14px] font-semibold text-gray-900 group-hover:underline">
                        #{order._id.substring(18, 24).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[14px] text-gray-600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-gray-600">
                      {order.user && order.user.name ? order.user.name : 'Deleted User'}
                    </td>
                    <td className="px-4 py-3 text-[14px] font-medium text-gray-900">
                      Tk {order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}
                    </td>
                    
                    <td className="px-4 py-3">
                      {order.isPaid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-green-100 text-green-800 border border-green-200">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-gray-100 text-gray-800 border border-gray-300">
                          Unpaid
                        </span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      {order.isDelivered ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-green-100 text-green-800 border border-green-200">
                          Fulfilled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Unfulfilled
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHandler(order._id);
                        }}
                        className="text-red-500 hover:text-red-700 text-xl p-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderList;