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

  if (loading) return <div className="py-20 flex items-center justify-center font-medium text-gray-500">Loading order details...</div>;
  if (error) return <div className="p-8 text-red-600 text-center font-medium">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-20 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20 md:static">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders" className="p-2 sm:p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors text-gray-600 flex-shrink-0">
            <MdArrowBack className="text-lg sm:text-xl" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 flex flex-wrap items-center gap-2 line-clamp-1">
              Order #{order._id.substring(18, 24).toUpperCase()}
              {order.isPaid ? (
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">Paid</span>
              ) : (
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">Unpaid</span>
              )}
              {order.isDelivered ? (
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">Fulfilled</span>
              ) : (
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200">Unfulfilled</span>
              )}
            </h1>
            <p className="text-[11px] sm:text-[12px] font-medium text-gray-500 mt-1">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
          <button 
            onClick={deleteHandler}
            className="flex-1 sm:flex-none text-[13px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 sm:py-2.5 rounded-md border border-red-100 transition-colors text-center flex justify-center items-center gap-1.5"
          >
            <MdDelete className="text-lg" /> <span className="hidden sm:inline">Delete</span>
          </button>
          {!order.isDelivered && (
            <button 
              onClick={deliverHandler}
              disabled={loadingDeliver}
              className="flex-[2] sm:flex-none bg-gray-900 hover:bg-black text-white text-[13px] font-bold px-4 py-2.5 sm:py-2.5 rounded-md shadow-sm transition-colors text-center disabled:opacity-50"
            >
              {loadingDeliver ? 'Processing...' : 'Fulfill items'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#fbfbfb] flex items-center gap-2">
              {order.isDelivered ? <MdCheckCircle className="text-green-600 text-xl" /> : <MdLocalShipping className="text-yellow-600 text-xl" />}
              <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900">
                {order.isDelivered ? 'Fulfilled' : 'Unfulfilled'} ({order.orderItems.length})
              </h2>
            </div>
            
            <div className="flex flex-col divide-y divide-gray-100">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 sm:gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden bg-white">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <Link to={`/admin/products/${item.product}/edit`} className="text-[13px] sm:text-[14px] font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                      <p className="text-[11px] sm:text-[12px] font-bold text-gray-500 mt-1 uppercase tracking-wider">SKU: {item.product.substring(18, 24)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                    <p className="text-[13px] sm:text-[14px] font-medium text-gray-600">
                      Tk {item.price.toFixed(2)} × {item.qty}
                    </p>
                    <p className="text-[14px] sm:text-[15px] font-bold text-gray-900">
                      Tk {(item.price * item.qty).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-[13px] sm:text-[14px] text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">Tk {order.itemsPrice ? order.itemsPrice.toFixed(2) : order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] sm:text-[14px] text-gray-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-gray-900">Tk {order.shippingPrice ? order.shippingPrice.toFixed(2) : '0.00'}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[16px] sm:text-[18px] font-bold text-gray-900">
                <span>Total</span>
                <span className="text-[#dd3333]">Tk {order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] sm:text-[13px] text-gray-600 mt-4 bg-gray-50 p-3 sm:p-4 rounded-md border border-gray-200 items-center">
                <span>Payment Method</span>
                <span className="font-bold text-gray-900 bg-white px-2 py-1 rounded border border-gray-200">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-4 sm:space-y-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#fbfbfb]">
              <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900">Customer Info</h2>
             </div>
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-lg sm:text-xl border border-blue-100">
                  <MdPerson />
                </div>
                <div>
                  <p className="text-[14px] sm:text-[15px] font-bold text-gray-900">
                    {order.shippingAddress?.fullName || (order.user ? order.user.name : 'Guest')}
                  </p>
                  <p className="text-[11px] sm:text-[12px] font-bold text-gray-500 mt-0.5 uppercase tracking-wider">Registered Customer</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 space-y-3">
                <p className="text-[13px] sm:text-[14px] text-gray-700 flex items-center gap-2.5 break-all">
                  <MdEmail className="text-gray-400 text-lg sm:text-xl flex-shrink-0" />
                  {order.shippingAddress?.email || (order.user ? order.user.email : 'N/A')}
                </p>
                <p className="text-[13px] sm:text-[14px] text-gray-700 flex items-center gap-2.5">
                  <MdPhone className="text-gray-400 text-lg sm:text-xl flex-shrink-0" />
                  {order.shippingAddress?.mobileNumber || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#fbfbfb]">
              <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900">Shipping Address</h2>
             </div>
            <div className="p-4 sm:p-5 text-[13px] sm:text-[14px] text-gray-700 space-y-3 sm:space-y-4">
              {order.shippingAddress ? (
                <>
                  <p className="font-bold text-gray-900 text-[14px] sm:text-[15px]">{order.shippingAddress.fullName}</p>
                  <p className="leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-md border border-gray-100 text-gray-800">
                    {order.shippingAddress.address}
                  </p>
                  {order.shippingAddress.comment && (
                    <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 text-gray-800 text-[12px] sm:text-[13px] italic rounded-md">
                      <span className="font-bold not-italic text-[11px] uppercase tracking-wider block mb-1.5 text-gray-900">Customer Note:</span>
                      "{order.shippingAddress.comment}"
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic p-3 text-center bg-gray-50 rounded-md">No shipping address provided</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;