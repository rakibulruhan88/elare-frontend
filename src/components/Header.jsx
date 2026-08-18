import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MdSearch, MdPersonOutline, MdOutlineShoppingBag, MdMenu, MdDashboard, MdLogout, MdPerson, MdClose, MdKeyboardArrowRight } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/ChatGPT Image Aug 19, 2026, 02_34_25 AM.png';

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  useEffect(() => {
    const updateCount = () => {
      const items = localStorage.getItem('cartItems');
      if (items) setCartCount(JSON.parse(items).reduce((acc, item) => acc + item.qty, 0));
      else setCartCount(0);
    };
    updateCount();
    window.addEventListener('cartUpdated', updateCount);

    const fetchData = async () => {
      try {
        const [prodRes, colRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/collections')
        ]);
        setAllProducts(prodRes.data);
        setCollections(colRes.data);
        if (colRes.data.length > 0) {
          setActiveCollection(colRes.data[0].name);
        }
      } catch (error) {
        console.error("Error fetching data");
      }
    };
    fetchData();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('cartUpdated', updateCount);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsMegaMenuOpen(false);
  }, [location]);

  const openCartDrawer = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('toggleCartDrawer', { detail: true }));
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const searchSubmitHandler = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  const megaMenuProducts = allProducts
    .filter(p => p.collections && p.collections.includes(activeCollection))
    .slice(0, 4);

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm font-sans relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          <div className="flex items-center gap-4 md:hidden flex-1">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-900 p-1 focus:outline-none">
              <MdMenu className="text-2xl" />
            </button>
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-gray-900 p-1">
              <MdSearch className="text-2xl" />
            </button>
          </div>

          <div className="flex-1 md:flex-none flex justify-center md:justify-start">
            <Link to="/" className="text-xl md:text-2xl font-serif font-bold tracking-widest text-gray-900 uppercase">
              <img  src={logoImg} alt="Logo" className="h-8 md:h-12 object-contain" />
            </Link>
          </div>

          <nav className="hidden md:flex flex-1 justify-center items-center gap-8 h-full">
            <Link to="/" className="text-[13px] uppercase tracking-widest text-gray-900 font-medium hover:underline underline-offset-4 decoration-2 decoration-gray-300">
              Home
            </Link>
            
            <div 
              className="h-full flex items-center"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <Link to="/shop" className="text-[13px] uppercase tracking-widest text-gray-900 font-medium hover:underline underline-offset-4 decoration-2 decoration-gray-300">
                Collections
              </Link>
              
              <AnimatePresence>
                {isMegaMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 5 }} 
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full w-full bg-white shadow-xl border-t border-gray-100"
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex">
                      
                      <div className="w-1/4 border-r border-gray-100 pr-8 flex flex-col gap-5">
                        <Link 
                          to="/shop" 
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="text-[14px] font-extrabold text-black uppercase tracking-widest mb-2 hover:underline underline-offset-4"
                        >
                          Shop All
                        </Link>
                        {collections.map(c => (
                          <Link 
                            key={c._id} 
                            to={`/shop?collection=${c.name}`}
                            onClick={() => setIsMegaMenuOpen(false)}
                            onMouseEnter={() => setActiveCollection(c.name)}
                            className={`text-[13px] font-bold uppercase tracking-widest flex items-center justify-between group transition-colors ${activeCollection === c.name ? 'text-black' : 'text-gray-400 hover:text-gray-900'}`}
                          >
                            {c.name}
                            {activeCollection === c.name && <MdKeyboardArrowRight className="text-lg" />}
                          </Link>
                        ))}
                      </div>

                      <div className="w-3/4 pl-10">
                        {megaMenuProducts.length > 0 ? (
                          <div className="grid grid-cols-4 gap-6">
                            {megaMenuProducts.map((p) => {
                              const primaryImage = p.images?.[0] || p.image;
                              const secondaryImage = p.images && p.images.length > 1 ? p.images[1] : primaryImage;
                              return (
                                <Link 
                                  key={p._id} 
                                  to={`/product/${p._id}`} 
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="group flex flex-col"
                                >
                                  <div className="w-full aspect-[4/5] bg-gray-100 overflow-hidden relative mb-4">
                                    <img 
                                      src={primaryImage} 
                                      alt={p.name} 
                                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" 
                                    />
                                    <img 
                                      src={secondaryImage} 
                                      alt={p.name} 
                                      className="absolute inset-0 w-full h-full object-cover opacity-0 scale-100 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105" 
                                    />
                                  </div>
                                  <h3 className="text-[13px] font-bold text-gray-900 truncate">{p.name}</h3>
                                  <p className="text-[13px] text-gray-600 mt-1">Tk {p.price.toFixed(2)}</p>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                            No products found in this collection.
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/contact" className="text-[13px] uppercase tracking-widest text-gray-900 font-medium hover:underline underline-offset-4 decoration-2 decoration-gray-300">
              Contact
            </Link>
          </nav>

          <div className="flex items-center justify-end gap-3 md:gap-5 flex-1">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="hidden md:block text-gray-900 hover:text-gray-600 transition-colors p-1">
              <MdSearch className="text-[22px]" />
            </button>
            
            <div className="relative hidden md:block" ref={dropdownRef}>
              {userInfo ? (
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-gray-900 p-1 focus:outline-none">
                  <MdPersonOutline className="text-[24px]" />
                  <span className="text-sm font-medium">{userInfo.name.split(' ')[0]}</span>
                </button>
              ) : (
                <Link to="/login" className="text-gray-900 p-1 block"><MdPersonOutline className="text-[24px]" /></Link>
              )}
              <AnimatePresence>
                {isDropdownOpen && userInfo && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-md shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-sm font-medium text-gray-900 truncate">{userInfo.name}</p>
                    </div>
                    <div className="py-1">
                      {userInfo.isAdmin && <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><MdDashboard /> Dashboard</Link>}
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><MdPerson /> Profile</Link>
                      <button onClick={logoutHandler} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"><MdLogout /> Logout</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button onClick={openCartDrawer} className="relative text-gray-900 p-1 flex items-center">
              <MdOutlineShoppingBag className="text-[22px]" />
              {cartCount > 0 && <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-[80vw] max-w-sm bg-white z-50 flex flex-col shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="text-xl font-serif font-bold tracking-widest text-gray-900 uppercase">ELARE</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 rounded-full">
                  <MdClose className="text-xl" />
                </button>
              </div>

              <div className="flex-1 py-6 flex flex-col">
                <Link to="/" className="px-6 py-4 text-[14px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-50 hover:bg-gray-50">Home</Link>
                
                <div className="px-6 py-4 bg-gray-50">
                  <Link to="/shop" className="text-[14px] font-bold text-gray-900 uppercase tracking-widest block mb-4">Shop Collections</Link>
                  <div className="flex flex-col gap-3 pl-4 border-l-2 border-gray-200">
                    {collections.map(c => (
                      <Link 
                        key={c._id} 
                        to={`/shop?collection=${c.name}`}
                        className="text-[13px] font-medium text-gray-600 uppercase tracking-wider"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link to="/contact" className="px-6 py-4 text-[14px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-50 hover:bg-gray-50">Contact</Link>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50">
                {userInfo ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-900 text-white p-2 rounded-full"><MdPerson className="text-xl" /></div>
                      <span className="font-bold text-gray-900">{userInfo.name}</span>
                    </div>
                    {userInfo.isAdmin && <Link to="/admin" className="text-[13px] font-bold text-gray-600 uppercase tracking-widest hover:text-gray-900">Dashboard</Link>}
                    <Link to="/profile" className="text-[13px] font-bold text-gray-600 uppercase tracking-widest hover:text-gray-900">My Profile</Link>
                    <button onClick={logoutHandler} className="text-left text-[13px] font-bold text-red-600 uppercase tracking-widest">Logout</button>
                  </div>
                ) : (
                  <Link to="/login" className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-sm font-bold uppercase tracking-widest text-[13px]">
                    <MdPersonOutline className="text-lg" /> Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg z-30 overflow-hidden"
            ref={searchRef}
          >
            <div className="max-w-4xl mx-auto px-4 py-6">
              <form onSubmit={searchSubmitHandler} className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full pl-4 pr-12 py-4 border-b-2 border-gray-300 focus:border-gray-900 text-lg md:text-xl outline-none transition-colors"
                />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-gray-500 hover:text-gray-900">
                  <MdSearch className="text-3xl" />
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="mt-4 pb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Suggested Products</h3>
                  <div className="flex flex-col gap-2">
                    {searchResults.map((product) => (
                      <Link 
                        key={product._id} 
                        to={`/product/${product._id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <img src={product.image || product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-sm border border-gray-200" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">Tk {product.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};

export default Header;