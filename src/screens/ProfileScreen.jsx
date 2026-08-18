import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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

  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      setName(userInfo.name);
      setEmail(userInfo.email);
      
      if (!userInfo.isAdmin) {
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
    }
  }, [navigate, userInfo?.token, userInfo?.isAdmin]);

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

          {/* Order History (Hidden for Admins as they have dashboard) */}
          {!userInfo?.isAdmin && (
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
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                        <th className="p-4 font-bold">Order ID</th>
                        <th className="p-4 font-bold">Date</th>
                        <th className="p-4 font-bold">Total</th>
                        <th className="p-4 font-bold">Paid</th>
                        <th className="p-4 font-bold">Delivered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-sm font-medium text-gray-900">{order._id.substring(0, 10)}...</td>
                          <td className="p-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-sm font-bold text-gray-900">Tk {order.totalPrice.toFixed(2)}</td>
                          <td className="p-4 text-sm">
                            {order.isPaid ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-red-500 font-medium">No</span>}
                          </td>
                          <td className="p-4 text-sm">
                            {order.isDelivered ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-red-500 font-medium">No</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;