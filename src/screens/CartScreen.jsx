import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdDelete, MdArrowBack } from 'react-icons/md';

const CartScreen = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const loadCart = () => {
      const items = localStorage.getItem('cartItems');
      if (items) setCartItems(JSON.parse(items));
    };
    
    loadCart();

    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const removeFromCartHandler = (id) => {
    const updatedItems = cartItems.filter((x) => x.product !== id);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQtyHandler = (item, newQty) => {
    const updatedItems = cartItems.map((x) =>
      x.product === item.product ? { ...x, qty: Number(newQty) } : x
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=placeorder');
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white p-12 rounded-sm shadow-sm border border-gray-200 text-center">
            <p className="text-gray-600 mb-6 text-lg">Your cart is currently empty.</p>
            <Link to="/shop" className="inline-flex items-center text-white bg-[#1c1c1c] px-8 py-3 text-[13px] font-bold uppercase tracking-widest rounded-sm hover:bg-black transition-colors">
              <MdArrowBack className="mr-2 text-lg" /> Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-8">
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <li key={item.product} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden cursor-pointer border border-gray-200" onClick={() => navigate(`/product/${item.product}`)}>
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                      
                      <div className="flex-1">
                        <Link to={`/product/${item.product}`} className="text-[15px] font-bold text-gray-900 hover:underline line-clamp-2">
                          {item.name}
                        </Link>
                        {item.size && <p className="text-[13px] text-gray-500 mt-1">Size: {item.size}</p>}
                        <p className="text-gray-900 font-bold mt-2">Tk {item.price.toFixed(2)}</p>
                      </div>

                      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start mt-4 sm:mt-0">
                        <div className="flex items-center border border-gray-300 rounded-sm bg-white">
                          <button 
                            onClick={() => updateQtyHandler(item, item.qty > 1 ? item.qty - 1 : 1)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg"
                          >
                            -
                          </button>
                          <span className="px-2 py-2 text-[14px] font-bold w-10 text-center">{item.qty}</span>
                          <button 
                            onClick={() => updateQtyHandler(item, item.qty + 1)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors text-lg"
                          >
                            +
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCartHandler(item.product)}
                          className="text-gray-400 hover:text-[#dd3333] p-2 transition-colors"
                        >
                          <MdDelete className="text-2xl" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-[15px] font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 uppercase tracking-wide">Order Summary</h2>
                
                <div className="flex justify-between text-[14px] text-gray-700 mb-3">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span className="font-bold text-gray-900">Tk {cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-[14px] text-gray-700 mb-6 pb-6 border-b border-gray-100">
                  <span>Shipping</span>
                  <span className="text-gray-500 italic text-[12px]">Calculated at checkout</span>
                </div>

                <div className="flex justify-between text-lg font-bold text-gray-900 mb-8">
                  <span>Total</span>
                  <span>Tk {cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                </div>

                <button 
                  onClick={checkoutHandler}
                  className="w-full bg-[#1c1c1c] text-white px-4 py-4 text-[14px] font-bold uppercase tracking-widest rounded-sm shadow-sm hover:bg-black transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartScreen;