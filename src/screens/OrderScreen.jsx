import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MdCheckCircle, MdLocalShipping, MdPerson, MdPhone, MdEmail } from 'react-icons/md';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
  if (error) return <div className="min-h-screen p-8 text-red-600 text-center font-medium">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-14 font-sans pb-20">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
            <MdCheckCircle className="text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank you for your purchase!</h1>
          <p className="text-gray-600">Your order <span className="font-bold text-gray-900">#{order._id.substring(18, 24).toUpperCase()}</span> has been placed successfully.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#f9f9f9]">
                <h2 className="text-[15px] font-bold text-gray-900">Order Summary</h2>
                {order.isDelivered ? (
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-green-100 text-green-800">Delivered</span>
                ) : (
                   <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-yellow-100 text-yellow-800 flex gap-1">
                     <MdLocalShipping className="text-sm"/> Preparing to Ship
                   </span>
                )}
              </div>
              
              <div className="p-0">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-gray-100">
                    {order.orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-5 py-4 w-20">
                          <div className="w-16 h-16 border border-gray-200 rounded-sm overflow-hidden bg-gray-50 flex items-center justify-center">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Link to={`/product/${item.product}`} className="text-[14px] font-bold text-gray-900 hover:underline">
                            {item.name}
                          </Link>
                          {item.size && <p className="text-[12px] text-gray-500 mt-1">Size: {item.size}</p>}
                        </td>
                        <td className="px-4 py-4 text-right text-[13px] text-gray-600">
                          Tk {item.price.toFixed(2)} × {item.qty}
                        </td>
                        <td className="px-5 py-4 text-right text-[14px] font-bold text-gray-900">
                          Tk {(item.price * item.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-sm shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100 bg-[#f9f9f9]">
                <h2 className="text-[15px] font-bold text-gray-900">Payment Details</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-[14px] text-gray-600">
                  <span>Subtotal</span>
                  <span>Tk {order.itemsPrice ? order.itemsPrice.toFixed(2) : order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[14px] text-gray-600">
                  <span>Delivery Fee</span>
                  <span>Tk {order.shippingPrice ? order.shippingPrice.toFixed(2) : '0.00'}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between text-[16px] font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span>Tk {order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] text-gray-500 mt-2 bg-gray-50 p-3 rounded-sm border border-gray-100 items-center">
                  <span>Payment Method: <span className="font-bold text-gray-900 ml-1">{order.paymentMethod}</span></span>
                  {order.isPaid ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider">Paid</span>
                  ) : (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider">Unpaid</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            
            <div className="bg-white rounded-sm shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100 bg-[#f9f9f9]">
                <h2 className="text-[15px] font-bold text-gray-900">Shipping Address</h2>
              </div>
              
              <div className="p-6 text-[14px] text-gray-700 space-y-3">
                {order.shippingAddress ? (
                  <>
                    <p className="font-bold text-gray-900 text-[15px]">{order.shippingAddress.fullName}</p>
                    <p className="flex items-center gap-2"><MdPhone className="text-gray-400 text-lg" /> {order.shippingAddress.mobileNumber}</p>
                    <p className="flex items-center gap-2"><MdEmail className="text-gray-400 text-lg" /> {order.shippingAddress.email}</p>
                    
                    <div className="pt-3 border-t border-gray-100 mt-3">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Address</p>
                      <p className="leading-relaxed">{order.shippingAddress.address}</p>
                    </div>

                    {order.shippingAddress.comment && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 text-gray-700 text-[13px] italic rounded-sm">
                        <span className="font-bold not-italic text-[11px] uppercase tracking-wider block mb-1 text-gray-900">Your Note:</span>
                        "{order.shippingAddress.comment}"
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic">No shipping details</p>
                )}
              </div>
            </div>
            
            <Link to="/shop" className="block text-center w-full bg-[#1c1c1c] text-white px-4 py-4 text-[13px] font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors">
              Continue Shopping
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;