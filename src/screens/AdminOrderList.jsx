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
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-10">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none text-[13px] font-bold text-gray-700 hover:bg-gray-200 px-4 py-2.5 sm:py-2 rounded-md border border-gray-300 bg-white shadow-sm transition-colors text-center">
            Export
          </button>
          <button className="flex-1 sm:flex-none bg-gray-900 hover:bg-black text-white text-[13px] font-bold px-4 py-2.5 sm:py-2 rounded-md shadow-sm transition-colors text-center">
            Create Order
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-[13px] sm:text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        
        <div className="flex overflow-x-auto custom-scrollbar border-b border-gray-200 bg-[#fbfbfb]">
          <div className="flex p-2 gap-1 min-w-max">
            <button 
              onClick={() => setActiveTab('All')}
              className={`px-4 py-2 rounded-md text-[13px] font-bold transition-colors whitespace-nowrap ${activeTab === 'All' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All Orders
            </button>
            <button 
              onClick={() => setActiveTab('Unfulfilled')}
              className={`px-4 py-2 rounded-md text-[13px] font-bold transition-colors whitespace-nowrap ${activeTab === 'Unfulfilled' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Unfulfilled
            </button>
            <button 
              onClick={() => setActiveTab('Unpaid')}
              className={`px-4 py-2 rounded-md text-[13px] font-bold transition-colors whitespace-nowrap ${activeTab === 'Unpaid' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Unpaid
            </button>
          </div>
        </div>

        <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-[#fbfbfb]">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl" />
            <input 
              type="text" 
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 sm:py-2 bg-white hover:bg-gray-50 focus:bg-white border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 rounded-md text-[16px] sm:text-[14px] text-gray-900 focus:outline-none transition-colors"
            />
          </div>
          <button className="p-2.5 sm:p-2 text-gray-600 hover:bg-gray-100 rounded-md border border-gray-300 shadow-sm transition-colors bg-white flex-shrink-0">
            <MdFilterList className="text-xl" />
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500 text-[13px] sm:text-[14px] font-medium">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-[13px] sm:text-[14px] font-medium">
            No orders found matching your criteria.
          </div>
        ) : (
          <>
            <div className="block lg:hidden">
              <div className="flex flex-col divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <div 
                    key={order._id} 
                    className="p-4 flex flex-col gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-bold text-gray-900">
                        #{order._id.substring(18, 24).toUpperCase()}
                      </span>
                      <span className="text-[14px] font-bold text-gray-900">
                        Tk {order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-medium text-gray-700">
                        {order.user && order.user.name ? order.user.name : 'Deleted User'}
                      </span>
                      <span className="text-[12px] text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        {order.isPaid ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800">
                            Unpaid
                          </span>
                        )}
                        
                        {order.isDelivered ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800">
                            Fulfilled
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800">
                            Unfulfilled
                          </span>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHandler(order._id);
                        }}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <MdDelete className="text-xl" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Fulfillment</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order._id} 
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          #{order._id.substring(18, 24).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-800 font-medium">
                        {order.user && order.user.name ? order.user.name : 'Deleted User'}
                      </td>
                      <td className="px-6 py-4 text-[14px] font-bold text-gray-900">
                        Tk {order.totalPrice ? order.totalPrice.toFixed(2) : '0.00'}
                      </td>
                      
                      <td className="px-6 py-4">
                        {order.isPaid ? (
                          <span className="inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">
                            Unpaid
                          </span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        {order.isDelivered ? (
                          <span className="inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
                            Fulfilled
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200">
                            Unfulfilled
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHandler(order._id);
                          }}
                          className="text-gray-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <MdDelete className="text-xl" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrderList;