import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';

const PaymentScreen = () => {
  const navigate = useNavigate();

  const shippingAddress = localStorage.getItem('shippingAddress');

  useEffect(() => {
    if (!shippingAddress) {
      navigate('/shipping');
    }
  }, [navigate, shippingAddress]);

  const [paymentMethod, setPaymentMethod] = useState('Cash On Delivery');

  const submitHandler = (e) => {
    e.preventDefault();
    localStorage.setItem('paymentMethod', paymentMethod);
    navigate('/placeorder');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <CheckoutSteps step1 step2 step3 />

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-wide">Payment Method</h1>
          
          <form onSubmit={submitHandler} className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash On Delivery"
                  checked={paymentMethod === 'Cash On Delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-900">Cash On Delivery (COD)</span>
              </label>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="SSLCommerz"
                  checked={paymentMethod === 'SSLCommerz'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-900">Online Payment (Card / Mobile Banking)</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white px-4 py-4 text-sm font-bold uppercase tracking-wider rounded-sm shadow-sm hover:bg-black transition-colors mt-4"
            >
              Continue to Place Order
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default PaymentScreen;