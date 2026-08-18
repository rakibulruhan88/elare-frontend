import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdDelete } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCart = () => {
      const items = localStorage.getItem('cartItems');
      if (items) setCartItems(JSON.parse(items));
    };
    
    loadCart();

    const handleToggle = (e) => {
      if (e.detail !== undefined) {
        setIsOpen(e.detail);
      } else {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('cartUpdated', loadCart);
    window.addEventListener('toggleCartDrawer', handleToggle);

    return () => {
      window.removeEventListener('cartUpdated', loadCart);
      window.removeEventListener('toggleCartDrawer', handleToggle);
    };
  }, []);

  const updateQtyHandler = (item, newQty) => {
    const updatedItems = cartItems.map((x) =>
      x.product === item.product ? { ...x, qty: Number(newQty) } : x
    );
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCartHandler = (id) => {
    const updatedItems = cartItems.filter((x) => x.product !== id);
    setCartItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const goToCartHandler = () => {
    setIsOpen(false);
    navigate('/cart');
  };

  const checkoutHandler = () => {
    setIsOpen(false);
    navigate('/login?redirect=placeorder');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Your Cart</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <MdClose className="text-2xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <p>Your cart is currently empty.</p>
                  <button onClick={() => setIsOpen(false)} className="mt-4 text-sm underline hover:text-gray-900">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {cartItems.map((item) => (
                    <li key={item.product} className="py-4 flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight hover:underline cursor-pointer" onClick={() => { setIsOpen(false); navigate(`/product/${item.product}`); }}>
                            {item.name}
                          </h3>
                          <p className="text-sm font-semibold text-gray-900 mt-1">Tk {item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-gray-300 rounded-sm">
                            <button onClick={() => updateQtyHandler(item, item.qty > 1 ? item.qty - 1 : 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100"> - </button>
                            <span className="px-2 py-1 text-xs font-medium w-8 text-center">{item.qty}</span>
                            <button onClick={() => updateQtyHandler(item, item.qty + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100"> + </button>
                          </div>
                          <button onClick={() => removeFromCartHandler(item.product)} className="text-gray-400 hover:text-red-600 p-1">
                            <MdDelete className="text-xl" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-5 bg-gray-50">
                <div className="flex justify-between text-base font-bold text-gray-900 mb-4">
                  <span>Subtotal</span>
                  <span>Tk {cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Shipping and taxes calculated at checkout.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={goToCartHandler} className="w-full bg-white border border-gray-900 text-gray-900 px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors">
                    View Cart
                  </button>
                  <button onClick={checkoutHandler} className="w-full bg-yellow-400 text-black px-4 py-3 text-sm font-bold uppercase tracking-wider hover:bg-yellow-500 transition-colors shadow-sm">
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;