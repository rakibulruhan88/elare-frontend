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
    // Scroll to top on load
    window.scrollTo(0, 0);
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (paymentMethod === 'bKash') {
      setIsBkashOpen(true);
    } else {
      processOrderToBackend();
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Breadcrumb */}
        <div className="text-[12px] sm:text-[13px] text-gray-500 mb-4 sm:mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-gray-900">Home</Link>
          <span>&gt;</span>
          <span className="text-[#dd3333]">Checkout</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column - Form */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100 bg-[#fbfbfb]">
                <h2 className="text-[16px] sm:text-lg font-bold text-gray-900">Customer Information</h2>
                <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">Provide information to deliver your order.</p>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                {error && <div className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-md text-[13px] sm:text-[14px] border border-red-100 font-medium mb-2">{error}</div>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 sm:py-2.5 text-[16px] sm:text-[14px] focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                      placeholder="e.g. Rakibul Hasan"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 sm:py-2.5 text-[16px] sm:text-[14px] focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">E-mail Address <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-4 py-3 sm:py-2.5 text-[16px] sm:text-[14px] focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Full Address <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 sm:py-2.5 text-[16px] sm:text-[14px] focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                    placeholder="House, Road, Area, City"
                  />
                </div>
                
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Order Notes (Optional)</label>
                  <textarea 
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 sm:py-2.5 text-[16px] sm:text-[14px] focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors resize-none"
                    placeholder="Any special instructions for delivery"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Delivery Option (Moved under form for better mobile flow) */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#fbfbfb]">
                <h2 className="text-[15px] sm:text-[16px] font-bold text-gray-900">Delivery Method</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                <label className={`flex items-start gap-3 p-4 border rounded-md cursor-pointer transition-colors ${deliveryArea === 'inside' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="delivery" 
                    value="inside" 
                    checked={deliveryArea === 'inside'} 
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-gray-900 focus:ring-gray-900 accent-gray-900"
                  />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-gray-900">Inside Dhaka</span>
                    <span className="text-[12px] text-gray-500 mt-0.5">Delivery Fee: ৳ 70</span>
                  </div>
                </label>
                
                <label className={`flex items-start gap-3 p-4 border rounded-md cursor-pointer transition-colors ${deliveryArea === 'outside' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input 
                    type="radio" 
                    name="delivery" 
                    value="outside" 
                    checked={deliveryArea === 'outside'} 
                    onChange={(e) => setDeliveryArea(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-gray-900 focus:ring-gray-900 accent-gray-900"
                  />
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-gray-900">Outside Dhaka</span>
                    <span className="text-[12px] text-gray-500 mt-0.5 leading-snug">Delivery Fee: ৳ 150 <br className="sm:hidden"/>(150TK Advance Payment Required)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#fbfbfb]">
                <h2 className="text-[15px] sm:text-[16px] font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <label className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'Cash on Delivery' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="Cash on Delivery" 
                      checked={paymentMethod === 'Cash on Delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-gray-900 focus:ring-gray-900 accent-gray-900"
                    />
                    <span className="text-[14px] font-semibold text-gray-900">Cash on Delivery</span>
                  </div>
                  <img src="https://arjobd.com/frontend/img/payments/cod.webp" alt="Cash on Delivery" className="h-6 sm:h-8 object-contain" />
                </label>

                <label className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'bKash' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="bKash" 
                      checked={paymentMethod === 'bKash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-gray-900 focus:ring-gray-900 accent-gray-900"
                    />
                    <span className="text-[14px] font-semibold text-gray-900">bKash Payment</span>
                  </div>
                  <img src="https://arjobd.com/frontend/img/payments/bkash.webp" alt="bKash" className="h-6 sm:h-8 object-contain" />
                </label>
              </div>
            </div>

            {/* Hidden on mobile, shows on desktop */}
            <div className="hidden lg:block">
              <button
                type="button"
                disabled={loading || cartItems.length === 0}
                onClick={placeOrderHandler}
                className="w-full bg-[#dd3333] text-white py-4 text-[16px] font-extrabold tracking-widest rounded-md shadow-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {loading ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5 space-y-6 order-1 lg:order-2 lg:sticky lg:top-6">
            
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-[#fbfbfb]">
                <h2 className="text-[15px] sm:text-[16px] font-bold text-gray-900">Order Summary</h2>
                <button onClick={() => window.dispatchEvent(new CustomEvent('toggleCartDrawer', { detail: true }))} className="text-[12px] font-bold text-[#dd3333] hover:underline uppercase tracking-wide">
                  Edit Cart
                </button>
              </div>
              
              {/* Product List - Mobile Optimized Flexbox instead of Table */}
              <div className="p-4 sm:p-5 max-h-[350px] overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-4">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {/* Product Image with Badge */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                          {item.qty}
                        </span>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] sm:text-[14px] font-medium text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                        {item.size && <p className="text-[12px] text-gray-500 mt-1">Size: {item.size}</p>}
                      </div>
                      
                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-[13px] sm:text-[14px] font-bold text-gray-900">৳ {item.price * item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-[13px] sm:text-[14px] text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">৳ {itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px] sm:text-[14px] text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-900">৳ {shippingPrice.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-1 flex justify-between items-center">
                  <span className="text-[16px] sm:text-[18px] font-bold text-gray-900">Total</span>
                  <span className="text-[20px] sm:text-[22px] font-extrabold text-[#dd3333]">৳ {totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Mobile Only Submit Button */}
            <div className="block lg:hidden">
              <button
                type="button"
                disabled={loading || cartItems.length === 0}
                onClick={placeOrderHandler}
                className="w-full bg-[#dd3333] text-white py-4 text-[15px] sm:text-[16px] font-extrabold tracking-widest rounded-md shadow-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {loading ? 'Processing...' : `Confirm Order • ৳${totalPrice.toFixed(2)}`}
              </button>
            </div>

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