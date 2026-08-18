import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MdSearch } from 'react-icons/md';

const SearchScreen = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/products');
        const filtered = data.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
        setProducts(filtered);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    fetchProducts();
    setLocalQuery(query);
  }, [query]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${localQuery}`);
    }
  };

  return (
    <div className="bg-white min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={submitHandler} className="relative flex items-center">
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-6 pr-14 py-4 border border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all shadow-sm"
            />
            <button type="submit" className="absolute right-2 bg-gray-900 text-white p-3 rounded-full hover:bg-gray-800 transition-colors">
              <MdSearch className="text-xl" />
            </button>
          </form>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Search Results for: <span className="font-normal italic">"{query}"</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products found</p>
        </div>

        {loading ? (
           <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No products match your search criteria.</p>
            <Link to="/" className="text-gray-900 font-bold underline mt-4 inline-block">Return to Home</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <Link key={product._id} to={`/product/${product._id}`} className="group relative">
                <div className="w-full aspect-[4/5] bg-gray-100 rounded-sm overflow-hidden relative mb-4">
                  <img src={product.image || product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:underline truncate">{product.name}</h3>
                <p className="text-sm font-semibold text-gray-900 mt-1">Tk {product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;