import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MdFilterList, MdClose, MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const ShopScreen = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(100000);
  const [sortOption, setSortOption] = useState('default');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products');
        setProducts(data);
        
        // Extract unique categories (collections in our new structure)
        const uniqueCategories = ['All'];
        data.forEach(p => {
          if (p.collections && p.collections.length > 0) {
            p.collections.forEach(c => {
               if (!uniqueCategories.includes(c)) {
                  uniqueCategories.push(c);
               }
            })
          }
        });
        setCategories(uniqueCategories);

        // Check if there's a collection parameter in the URL
        const searchParams = new URLSearchParams(location.search);
        const collectionParam = searchParams.get('collection');
        
        if (collectionParam && uniqueCategories.includes(collectionParam)) {
            setSelectedCategory(collectionParam);
        }

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);

  useEffect(() => {
    let result = [...products];

    // Filter by selected collection (formerly category)
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.collections && p.collections.includes(selectedCategory));
    }

    result = result.filter((p) => p.price <= priceRange);

    if (inStockOnly) {
      result = result.filter((p) => p.countInStock > 0);
    }

    if (sortOption === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [selectedCategory, priceRange, sortOption, inStockOnly, products]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange(100000);
    setSortOption('default');
    setInStockOnly(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-100">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      
      <div className="bg-gray-50 border-b border-gray-200 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 uppercase tracking-widest mb-4">
          Complete Catalog
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto">
          Explore our premium collection of products. Use the filters to find exactly what you are looking for.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="md:hidden flex justify-between items-center mb-6">
          <span className="text-sm font-bold text-gray-900">{filteredProducts.length} Products</span>
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md active:scale-95 transition-transform"
          >
            <MdFilterList className="text-lg" /> Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="hidden md:block col-span-1">
            <div className="sticky top-28 space-y-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
              
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-200 pb-2 mb-4">Sort By</h3>
                <select 
                  value={sortOption} 
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full p-3 rounded-md border border-gray-300 text-sm focus:ring-gray-900 focus:border-gray-900 bg-white"
                >
                  <option value="default">Default</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-200 pb-2 mb-4">Availability</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
              
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-200 pb-2 mb-4">Collections</h3>
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map((category) => (
                    <li key={category}>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className={`text-sm transition-colors text-left w-full ${
                          selectedCategory === category 
                            ? 'text-gray-900 font-bold underline underline-offset-4' 
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 border-b border-gray-200 pb-2 mb-4">Max Price: Tk {priceRange}</h3>
                <input 
                  type="range" 
                  min="0" 
                  max="100000" 
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-gray-900"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>Tk 0</span>
                  <span>Tk 100,000</span>
                </div>
              </div>

              <button 
                onClick={clearFilters}
                className="w-full bg-white border border-gray-300 text-gray-900 py-3 rounded-md text-sm font-bold hover:bg-gray-100 transition-colors uppercase tracking-widest shadow-sm"
              >
                Clear Filters
              </button>

            </div>
          </div>

          <div className="col-span-1 md:col-span-3">
            <div className="hidden md:flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} results
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-500 mb-4 text-lg">No products found matching your criteria.</p>
                <button onClick={clearFilters} className="text-gray-900 font-bold underline text-sm tracking-widest uppercase">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
                  {currentProducts.map((product) => (
                    <Link key={product._id} to={`/product/${product._id}`} className="group relative bg-white">
                      <div className="w-full aspect-[4/5] bg-gray-100 rounded-sm overflow-hidden relative mb-4">
                        <img 
                          src={product.image || (product.images && product.images[0])} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                        {product.countInStock === 0 && (
                          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm">
                            Sold Out
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col px-1">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:underline truncate">{product.name}</h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{product.collections && product.collections[0]}</p>
                        <p className="text-sm font-bold text-gray-900 mt-2">Tk {product.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    <button 
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <MdKeyboardArrowLeft className="text-xl" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                          currentPage === index + 1 
                            ? 'bg-gray-900 text-white shadow-md' 
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button 
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <MdKeyboardArrowRight className="text-xl" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full h-[85vh] bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col md:hidden overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
              </div>
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <span className="text-lg font-bold uppercase tracking-widest text-gray-900">Filters</span>
                <button onClick={() => setIsMobileFilterOpen(false)} className="text-gray-500 hover:text-gray-900 bg-gray-100 p-1.5 rounded-full">
                  <MdClose className="text-xl" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar">
                
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Sort By</h3>
                  <select 
                    value={sortOption} 
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-gray-900 focus:border-gray-900 bg-gray-50 outline-none"
                  >
                    <option value="default">Default</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Availability</h3>
                  <label className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <input 
                      type="checkbox" 
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-5 h-5 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Show In Stock Only</span>
                  </label>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Collections</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <label 
                        key={category} 
                        className={`flex items-center justify-center p-3 rounded-xl border text-sm font-medium transition-colors ${
                          selectedCategory === category 
                            ? 'bg-gray-900 border-gray-900 text-white' 
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="mobileCategory" 
                          checked={selectedCategory === category}
                          onChange={() => setSelectedCategory(category)}
                          className="hidden"
                        />
                        <span className="truncate">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">Price Range</h3>
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">Up to Tk {priceRange}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100000" 
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-gray-900 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button 
                  onClick={clearFilters}
                  className="px-4 py-4 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-900 uppercase tracking-widest hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="px-4 py-4 bg-gray-900 text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-lg active:scale-95 transition-transform"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default ShopScreen;