import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MdCheckCircle, MdLocalShipping, MdPhone, MdEmail } from 'react-icons/md';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // পেজ লোড হলে যেন একদম শুরুতে থাকে
    window.scrollTo({ top: 0, behavior: 'instant' });

    const fetchOrder = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`/api/orders/${orderId}`, config);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching order details');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-semibold text-gray-500">Loading your order...</div>;
  if (error) return <div className="min-h-screen p-8 text-red-600 text-center font-medium mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-8 sm:p-10 md:p-14 font-sans pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Success Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-100 text-green-600 rounded-full mb-4 shadow-sm">
            <MdCheckCircle className="text-3xl sm:text-4xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Thank you for your purchase!</h1>
          <p className="text-[13px] sm:text-[15px] text-gray-600">
            Your order <span className="font-bold text-gray-900 bg-gray-200 px-2 py-0.5 rounded-sm ml-1">#{order._id.substring(18, 24).toUpperCase()}</span> has been placed successfully.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Left Column - Order Items & Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Items List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between bg-[#fbfbfb] gap-3">
                <h2 className="text-[15px] sm:text-[16px] font-bold text-gray-900">Order Summary</h2>
                {order.isDelivered ? (
                   <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-bold bg-green-100 text-green-800 w-fit">
                     Delivered
                   </span>
                ) : (
                   <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[12px] font-bold bg-yellow-100 text-yellow-800 gap-1.5 w-fit">
                     <MdLocalShipping className="text-sm"/> Preparing to Ship
                   </span>
                )}
              </div>
              
              {/* Mobile Optimized Flexbox List (Replaced Table) */}
              <div className="flex flex-col">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-start sm:items-center gap-3 sm:gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    
                    {/* Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden bg-white">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product}`} className="text-[13px] sm:text-[14px] font-bold text-gray-900 hover:text-[#dd3333] transition-colors line-clamp-2 leading-snug">
                        {item.name}
                      </Link>
                      {item.size && <p className="text-[12px] text-gray-500 mt-1">Size: {item.size}</p>}
                      {/* Mobile Only Price & Qty */}
                      <p className="text-[12px] text-gray-500 mt-1 sm:hidden">
                        Qty: {item.qty} × Tk {item.price.toFixed(2)}
                      </p>
                    </div>
                    
                    {/* Total Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-[14px] sm:text-[15px] font-bold text-gray-900">Tk {(item.price * item.qty).toFixed(2)}</p>
                      {/* Desktop Only Qty */}
                      <p className="text-[12px] text-gray-500 mt-1 hidden sm:block">Qty: {item.qty}</p>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#fbfbfb]">
                <h2 className="text-[15px] sm:text-[16px] font-bold text-gray-900">Payment Details</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                <div className="flex justify-between text-[13px] sm:text-[14px] text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">Tk {order.itemsPrice ? order.itemsPrice.toFixed(2) : order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] sm:text-[14px] text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900">Tk {order.shippingPrice ? order.shippingPrice.toFixed(2) : '0.00'}</span>
                </div>
                <div className="pt-3 mt-2 border-t border-gray-100 flex justify-between items-center text-[16px] sm:text-[18px] font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span className="text-[#dd3333]">Tk {order.totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-[12px] sm:text-[13px] text-gray-600 mt-4 bg-gray-50 p-3 sm:p-4 rounded-md border border-gray-200">
                  <span className="flex items-center gap-1.5">
                    Payment Method: <span className="font-bold text-gray-900">{order.paymentMethod}</span>
                  </span>
                  {order.isPaid ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest w-fit">Paid</span>
                  ) : (
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-sm text-[11px] font-bold uppercase tracking-widest w-fit">Unpaid</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Shipping & Button */}
          <div className="space-y-6 lg:sticky lg:top-6">
            
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#fbfbfb]">
                <h2 className="text-[15px] sm:text-[16px] font-bold text-gray-900">Shipping Address</h2>
              </div>
              
              <div className="p-4 sm:p-6 text-[13px] sm:text-[14px] text-gray-700 space-y-3 sm:space-y-4">
                {order.shippingAddress ? (
                  <>
                    <p className="font-bold text-gray-900 text-[15px] sm:text-[16px]">{order.shippingAddress.fullName}</p>
                    <p className="flex items-center gap-2.5">
                      <MdPhone className="text-gray-400 text-lg flex-shrink-0" /> 
                      {order.shippingAddress.mobileNumber}
                    </p>
                    <p className="flex items-center gap-2.5 break-all">
                      <MdEmail className="text-gray-400 text-lg flex-shrink-0" /> 
                      {order.shippingAddress.email}
                    </p>
                    
                    <div className="pt-3 sm:pt-4 border-t border-gray-100 mt-3 sm:mt-4">
                      <p className="text-[11px] sm:text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Delivery Address</p>
                      <p className="leading-relaxed text-gray-800">{order.shippingAddress.address}</p>
                    </div>

                    {order.shippingAddress.comment && (
                      <div className="mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 text-gray-800 text-[12px] sm:text-[13px] italic rounded-md">
                        <span className="font-bold not-italic text-[11px] uppercase tracking-wider block mb-1 text-gray-900">Delivery Note:</span>
                        "{order.shippingAddress.comment}"
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic p-2 text-center bg-gray-50 rounded-md">No shipping details provided</p>
                )}
              </div>
            </div>
            
            <Link to="/shop" className="flex items-center justify-center w-full bg-[#1c1c1c] text-white px-4 py-4 sm:py-5 text-[14px] sm:text-[15px] font-extrabold uppercase tracking-widest rounded-md shadow-md hover:bg-black hover:shadow-lg transition-all duration-300">
              Continue Shopping
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;