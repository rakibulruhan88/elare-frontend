import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdClose, MdSend, MdAutoAwesome, MdShoppingCart } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: 'Hello! I am your ELARE Fashion Assistant ✨. How can I help you find the perfect outfit today?',
      products: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data } = await axios.post('/api/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply, products: data.products || [] }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am facing a temporary network issue. Please try again in a moment.', products: [] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCartHandler = (product) => {
    const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const existItem = existingCart.find(x => x.product === product._id);
    let newCart;
    
    if(existItem) {
      newCart = existingCart.map(x => x.product === product._id ? {...x, qty: x.qty + 1} : x);
    } else {
      newCart = [...existingCart, { product: product._id, name: product.name, image: product.image, price: product.price, qty: 1 }];
    }
    
    localStorage.setItem('cartItems', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('toggleCartDrawer', { detail: true }));
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="bg-gray-900 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-black transition-colors"
            >
              <MdAutoAwesome className="text-2xl" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 sm:bottom-24 sm:right-6 w-[calc(100vw-3rem)] sm:w-[380px] h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden font-sans"
          >
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between shadow-md z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MdAutoAwesome className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold tracking-wider uppercase">ELARE Stylist</h3>
                  <p className="text-[10px] text-gray-300 font-medium">Powered by AI</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-300 hover:text-white transition-colors p-1"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#f8f9fa] space-y-4 custom-scrollbar">
              {messages.map((msg, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-gray-900 text-white rounded-tr-sm' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 w-[95%] space-y-2">
                      {msg.products.map(p => (
                        <div key={p._id} className="bg-white border border-gray-200 rounded-lg p-2 flex gap-3 shadow-sm items-center">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            onClick={() => { setIsOpen(false); navigate(`/product/${p._id}`); }}
                            className="w-14 h-14 object-cover rounded bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity" 
                          />
                          <div className="flex-1">
                            <h4 
                              onClick={() => { setIsOpen(false); navigate(`/product/${p._id}`); }}
                              className="text-[12px] font-bold text-gray-900 leading-tight cursor-pointer hover:underline line-clamp-2"
                            >
                              {p.name}
                            </h4>
                            <p className="text-[12px] font-bold text-[#dd3333] mt-1">Tk {p.price}</p>
                          </div>
                          <button 
                            onClick={() => addToCartHandler(p)}
                            className="w-8 h-8 bg-[#1c1c1c] text-white rounded-full flex items-center justify-center hover:bg-black transition-colors shrink-0"
                          >
                            <MdShoppingCart className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm flex items-center gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full"></motion.div>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full"></motion.div>
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full"></motion.div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-t border-gray-100">
              <form onSubmit={sendMessageHandler} className="flex items-center gap-2 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about sizing, styles..."
                  className="flex-1 bg-[#f4f4f4] border border-transparent focus:bg-white focus:border-gray-300 rounded-full px-4 py-3 text-[13px] outline-none transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gray-900 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-black disabled:opacity-50 transition-colors flex-shrink-0"
                >
                  <MdSend className="text-lg ml-1" />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;