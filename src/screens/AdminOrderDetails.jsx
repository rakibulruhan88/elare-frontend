import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdLocalShipping, MdCheckCircle, MdPerson, MdEmail, MdLocationOn, MdDelete, MdPhone } from 'react-icons/md';

const AdminOrderDetails = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingDeliver, setLoadingDeliver] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
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

        const { data } = await axios.get(`/api/orders/${orderId}`, config);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

  const deliverHandler = async () => {
    try {
      setLoadingDeliver(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`/api/orders/${orderId}/deliver`, {}, config);
      setOrder(data); 
      setLoadingDeliver(false);
      alert('Order marked as fulfilled!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating delivery status');
      setLoadingDeliver(false);
    }
  };

  const deleteHandler = async () => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/orders/${orderId}`, config);
        navigate('/admin/orders');
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting order');
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-semibold text-gray-500">Loading order details...</div>;
  if (error) return <div className="min-h-screen p-8 text-red-600 text-center font-medium">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f1f2f4] p-4 md:p-14 -mx-4 md:-mx-8 -my-4 md:-my-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin/orders" className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-600">
              <MdArrowBack className="text-xl" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Order #{order._id.substring(18, 24).toUpperCase()}
                {order.isPaid ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-green-100 text-green-800 border border-green-200">Paid</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-gray-200 text-gray-800 border border-gray-300">Unpaid</span>
                )}
                {order.isDelivered ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-green-100 text-green-800 border border-green-200">Fulfilled</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">Unfulfilled</span>
                )}
              </h1>
              <p className="text-[13px] text-gray-500 mt-1">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={deleteHandler}
              className="text-[13px] font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 bg-white shadow-sm flex items-center gap-1"
            >
              <MdDelete className="text-lg" /> Delete
            </button>
            {!order.isDelivered && (
              <button 
                onClick={deliverHandler}
                disabled={loadingDeliver}
                className="bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-medium px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-2"
              >
                {loadingDeliver ? 'Processing...' : 'Fulfill items'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex items-center gap-2">
                {order.isDelivered ? <MdCheckCircle className="text-green-600 text-xl" /> : <MdLocalShipping className="text-yellow-600 text-xl" />}
                <h2 className="text-[14px] font-semibold text-gray-900">
                  {order.isDelivered ? 'Fulfilled' : 'Unfulfilled'} ({order.orderItems.length})
                </h2>
              </div>
              
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-gray-200">
                    {order.orderItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 w-16">
                          <div className="w-12 h-12 border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Link to={`/admin/products/${item.product}/edit`} className="text-[14px] font-semibold text-blue-600 hover:underline">
                            {item.name}
                          </Link>
                          <p className="text-[13px] text-gray-500 mt-0.5">SKU: {item.product.substring(18, 24).toUpperCase()}</p>
                        </td>
                        <td className="px-4 py-4 text-right text-[14px] text-gray-900">
                          Tk {item.price.toFixed(2)} × {item.qty}
                        </td>
                        <td className="px-5 py-4 text-right text-[14px] font-medium text-gray-900">
                          Tk {(item.price * item.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4 flex items-center gap-2">Payment Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-[14px] text-gray-600">
                  <span>Subtotal</span>
                  <span>Tk {order.itemsPrice ? order.itemsPrice.toFixed(2) : order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[14px] text-gray-600">
                  <span>Shipping Fee</span>
                  <span>Tk {order.shippingPrice ? order.shippingPrice.toFixed(2) : '0.00'}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between text-[16px] font-bold text-gray-900">
                  <span>Total</span>
                  <span>Tk {order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                  <span>Method:</span>
                  <span className="font-semibold">{order.paymentMethod}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Customer Info</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-lg">
                    <MdPerson />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-900">
                      {order.shippingAddress?.fullName || (order.user ? order.user.name : 'Guest')}
                    </p>
                    <p className="text-[12px] text-gray-500">Registered Customer</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Details</h3>
                  <p className="text-[13px] text-gray-700 flex items-center gap-2">
                    <MdPhone className="text-gray-400 text-lg" />
                    {order.shippingAddress?.mobileNumber || 'N/A'}
                  </p>
                  <p className="text-[13px] text-gray-700 flex items-center gap-2">
                    <MdEmail className="text-gray-400 text-lg" />
                    {order.shippingAddress?.email || (order.user ? order.user.email : 'N/A')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                Shipping Address
              </h2>
              
              <div className="text-[14px] text-gray-600 space-y-2">
                {order.shippingAddress ? (
                  <>
                    <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
                    <p className="leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
                      {order.shippingAddress.address}
                    </p>
                    {order.shippingAddress.comment && (
                      <div className="mt-3 p-3 bg-yellow-50 border-l-2 border-yellow-400 text-gray-700 text-[13px] italic rounded-r">
                        <span className="font-bold not-italic text-[11px] uppercase tracking-wider block mb-1 text-gray-900">Customer Note:</span>
                        "{order.shippingAddress.comment}"
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic">No shipping address provided</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;