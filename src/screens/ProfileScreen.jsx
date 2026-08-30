import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MdShoppingCart, MdExpandMore, MdExpandLess } from 'react-icons/md';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState([]); 

  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setName(userInfo.name);
      setEmail(userInfo.email);
      
      const fetchMyOrders = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.get('/api/orders/mine', config);
          setOrders(data);
        } catch (err) {
          console.error("Failed to fetch orders");
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchMyOrders();
    }
  }, [navigate, userInfo?.token]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      const { data } = await axios.put('/api/users/profile', { name, email, password }, config);
      
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...data }));
      setMessage('Profile Updated Successfully!');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders((prev) => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId] 
    );
  };

  const buyAgainHandler = (item) => {
    const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const existItem = existingCart.find(x => x.product === item.product);
    let newCart;
    
    if(existItem) {
      newCart = existingCart.map(x => x.product === item.product ? {...x, qty: x.qty + 1} : x);
    } else {
      newCart = [...existingCart, { product: item.product, name: item.name, image: item.image, price: item.price, qty: 1 }];
    }
    
    localStorage.setItem('cartItems', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new CustomEvent('toggleCartDrawer', { detail: true }));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Profile Update Form */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Profile</h2>
            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
            
            <form onSubmit={submitHandler} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-gray-900 focus:border-gray-900" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-gray-900 focus:border-gray-900" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-gray-900 focus:border-gray-900" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-2.5 rounded-md text-sm font-bold hover:bg-black transition-colors">
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Order History */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
            {loadingOrders ? (
              <p className="text-gray-500 text-sm">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500 mb-4">You have not placed any orders yet.</p>
                <Link to="/" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">Start Shopping</Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-5 bg-gray-50 border-b border-gray-200 p-4 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <div>Order ID</div>
                  <div>Date</div>
                  <div>Total</div>
                  <div>Status</div>
                  <div className="text-right">Details</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const isOpen = expandedOrders.includes(order._id);
                    return (
                      <div key={order._id} className="flex flex-col">
                        
                        {/* Order Row */}
                        <div 
                          onClick={() => toggleOrderDetails(order._id)}
                          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          {/* Desktop View */}
                          <div className="hidden md:grid grid-cols-5 items-center">
                            <div className="text-sm font-medium text-gray-900">{order._id.substring(0, 8).toUpperCase()}...</div>
                            <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                            <div className="text-sm font-bold text-gray-900">Tk {order.totalPrice.toFixed(2)}</div>
                            <div>
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {order.isDelivered ? 'Delivered' : 'Processing'}
                              </span>
                            </div>
                            <div className="text-right text-gray-500">
                              {isOpen ? <MdExpandLess className="inline text-xl" /> : <MdExpandMore className="inline text-xl" />}
                            </div>
                          </div>

                          {/* Mobile View (No Horizontal Scroll) */}
                          <div className="md:hidden flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-bold text-gray-900">ID: {order._id.substring(0, 8).toUpperCase()}...</div>
                              <div className="text-gray-500">
                                {isOpen ? <MdExpandLess className="text-2xl" /> : <MdExpandMore className="text-2xl" />}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                              <span className="font-bold text-gray-900">Tk {order.totalPrice.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {order.isDelivered ? 'Delivered' : 'Processing'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details Section */}
                        <div 
                          className={`grid transition-all duration-300 ease-in-out bg-[#fcfcfc] ${
                            isOpen ? 'grid-rows-[1fr] opacity-100 border-t border-gray-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="p-4 md:p-6">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Items in this order</h4>
                              <div className="space-y-3">
                                {order.orderItems?.map((item, index) => (
                                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 border border-gray-100 rounded-md shadow-sm gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                        <Link to={`/product/${item.product}`} className="text-sm font-bold text-gray-900 hover:underline line-clamp-1">
                                          {item.name}
                                        </Link>
                                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.qty} × Tk {item.price}</p>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => buyAgainHandler(item)}
                                      className="flex items-center justify-center gap-1.5 bg-white border border-gray-300 text-gray-800 px-3 py-2 rounded text-xs font-bold hover:bg-gray-50 transition-colors w-full sm:w-auto"
                                    >
                                      <MdShoppingCart className="text-sm" /> Buy Again
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between text-sm gap-2">
                                <span className="text-gray-500">
                                  <strong className="text-gray-700">Shipping:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}
                                </span>
                                <span className="font-bold text-gray-900">Total Paid: Tk {order.totalPrice.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileScreen; 