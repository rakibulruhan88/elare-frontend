import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckoutSteps from '../components/CheckoutSteps';

const ShippingScreen = () => {
  const navigate = useNavigate();

  const shippingAddress = localStorage.getItem('shippingAddress') 
    ? JSON.parse(localStorage.getItem('shippingAddress')) 
    : {};

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || 'Bangladesh');

  const submitHandler = (e) => {
    e.preventDefault();
    localStorage.setItem('shippingAddress', JSON.stringify({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <CheckoutSteps step1 step2 />

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-wide">Shipping Address</h1>
          
          <form onSubmit={submitHandler} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House 12, Road 5, Dhanmondi"
                className="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Dhaka"
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 1209"
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-sm text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-gray-50"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white px-4 py-4 text-sm font-bold uppercase tracking-wider rounded-sm shadow-sm hover:bg-black transition-colors mt-4"
            >
              Continue to Payment
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default ShippingScreen;