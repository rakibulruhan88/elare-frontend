import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BkashMockModal from '../components/BkashMockModal';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBkashOpen, setIsBkashOpen] = useState(false);
  
  const isOrderPlaced = useRef(false);

  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
  const cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];

  const [fullName, setFullName] = useState(userInfo?.name || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  
  const [deliveryArea, setDeliveryArea] = useState('inside');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  
  let shippingPrice = 0;
  if (deliveryArea === 'inside') shippingPrice = 70;
  else if (deliveryArea === 'outside') shippingPrice = 150;

  const totalPrice = itemsPrice + shippingPrice;

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/placeorder');
    }
    if (cartItems.length === 0 && !isOrderPlaced.current) {
      navigate('/shop');
    }
  }, [navigate, userInfo, cartItems.length]);

  const processOrderToBackend = async () => {
    setLoading(true);
    setError('');

    try {
      isOrderPlaced.current = true;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const orderData = {
        orderItems: cartItems,
        shippingAddress: {
          fullName,
          mobileNumber,
          email,
          address,
          comment
        },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
      };

      const { data } = await axios.post('/api/orders', orderData, config);

      localStorage.removeItem('cartItems');
      window.dispatchEvent(new Event('cartUpdated'));

      navigate(`/order/${data._id}`);
    } catch (err) {
      isOrderPlaced.current = false;
      setError(err.response?.data?.message || 'Order placement failed');
    } finally {
      setLoading(false);
    }
  };

  const placeOrderHandler = () => {
    if (!fullName || !mobileNumber || !email || !address) {
      setError('Please fill in all required fields (*)');
      return;
    }

    if (paymentMethod === 'bKash') {
      setIsBkashOpen(true);
    } else {
      processOrderToBackend();
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="text-[13px] text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <span>&gt;</span>
          <span className="text-[#dd3333]">Checkout</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200 rounded-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Customer Information</h2>
                <p className="text-[13px] text-gray-500 mt-1">Provide Information to deliver your order.</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[13px] text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[14px] focus:outline-none focus:border-gray-500 transition-colors"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-gray-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[14px] focus:outline-none focus:border-gray-500 transition-colors"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-gray-700 mb-2">E-mail Address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[14px] focus:outline-none focus:border-gray-500 transition-colors"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-gray-700 mb-2">Full Address <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[14px] focus:outline-none focus:border-gray-500 transition-colors"
                    placeholder="Your Full Address"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-gray-700 mb-2">Comment</label>
                  <textarea 
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-sm px-4 py-2.5 text-[14px] focus:outline-none focus:border-gray-500 transition-colors resize-none"
                    placeholder="Comment"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white border border-gray-200 rounded-sm relative">
              <div className="absolute -top-10 right-0">
                <button onClick={() => window.dispatchEvent(new CustomEvent('toggleCartDrawer', { detail: true }))} className="text-[13px] text-blue-600 border border-blue-600 rounded px-3 py-1 hover:bg-blue-50 transition-colors">
                  Edit Cart
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#f9f9f9] border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-[13px] font-bold text-gray-900 w-1/2 text-center">Products</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-gray-900 text-center">Price</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-gray-900 text-center">Quantity</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-gray-900 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cartItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 flex items-center gap-4">
                          <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-sm border border-gray-200" />
                          <div>
                            <p className="text-[13px] text-gray-900">{item.name}</p>
                            {item.size && <p className="text-[12px] text-gray-500 mt-1">Size: {item.size}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[13px] text-gray-900 text-center">৳ {item.price}</td>
                        <td className="px-6 py-4 text-[13px] text-gray-900 text-center">{item.qty}</td>
                        <td className="px-6 py-4 text-[13px] text-gray-900 text-right">৳ {item.price * item.qty}</td>
                      </tr>
                    ))}
                    <tr className="bg-[#f9f9f9]">
                      <td colSpan="3" className="px-6 py-4 text-[14px] font-bold text-gray-900 text-center border-r border-gray-200">Subtotal</td>
                      <td className="px-6 py-4 text-[14px] text-gray-900 text-right">৳ {itemsPrice.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm">
              <div className="p-4 border-b border-gray-100 bg-[#f9f9f9]">
                <h2 className="text-[15px] font-bold text-gray-900">Delivery</h2>
              </div>
              <div className="p-6 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="delivery" 
                    value="inside" 
                    checked={deliveryArea === 'inside'} 
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[14px] text-gray-700">Inside Dhaka - ৳ 70</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="delivery" 
                    value="outside" 
                    checked={deliveryArea === 'outside'} 
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[14px] text-gray-700 leading-snug">Outside Dhaka (150TK Advance Payment Required via Bkash) - ৳ 150</span>
                </label>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm">
              <div className="p-4 border-b border-gray-100 bg-[#f9f9f9]">
                <h2 className="text-[15px] font-bold text-gray-900">Payment</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-[14px] font-bold text-gray-900">
                  <span>Subtotal</span>
                  <span>৳ {itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[14px] font-bold text-gray-900">
                  <span>Delivery Fee</span>
                  <span>৳ {shippingPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between text-[16px] font-bold text-gray-900">
                  <span>Total</span>
                  <span>৳ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-sm">
              <div className="p-4 border-b border-gray-100 bg-[#f9f9f9]">
                <h2 className="text-[15px] font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="p-6 space-y-6">
                
                <div>
                  <p className="text-[14px] font-bold text-gray-900 mb-3">Cash on Delivery</p>
                  <label className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'Cash on Delivery' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="Cash on Delivery" 
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center">
                      <img src="https://arjobd.com/frontend/img/payments/cod.webp" alt="Cash on Delivery" className="h-8 object-contain" /> Cash on Delivery
                    </div>
                  </label>
                </div>

                <div>
                  <p className="text-[14px] font-bold text-gray-900 mb-3">bKash</p>
                  <label className={`flex items-center gap-3 p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'bKash' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="bKash" 
                      checked={paymentMethod === 'bKash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center">
                      <img src="https://arjobd.com/frontend/img/payments/bkash.webp" alt="bKash" className="h-8 object-contain" />
                    </div>
                  </label>
                </div>

              </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded text-[14px] border border-red-100">{error}</div>}

            <button
              type="button"
              disabled={loading || cartItems.length === 0}
              onClick={placeOrderHandler}
              className="w-full bg-[#1c1c1c] text-white py-4 text-[15px] font-bold tracking-wider rounded-sm shadow-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>

          </div>
        </div>
      </div>
      
      <BkashMockModal 
        isOpen={isBkashOpen} 
        onClose={() => setIsBkashOpen(false)} 
        amount={totalPrice} 
        onSuccess={processOrderToBackend} 
      />
    </div>
  );
};

export default PlaceOrderScreen;