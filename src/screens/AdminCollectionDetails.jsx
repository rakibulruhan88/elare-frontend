import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

const AdminCollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: colData } = await axios.get(`/api/collections/${id}`);
        setCollection(colData);

        const { data: prodData } = await axios.get('/api/products');
        setProducts(prodData);

        const preSelected = prodData
          .filter(p => p.collections && p.collections.includes(colData.name))
          .map(p => p._id);
        setSelectedProducts(preSelected);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCheckboxChange = (productId) => {
    setSelectedProducts((prev) => 
      prev.includes(productId) 
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const saveHandler = async () => {
    setSaving(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      
      await axios.put(`/api/collections/${id}/products`, { productIds: selectedProducts }, config);
      alert('Collection updated successfully!');
      navigate('/admin/collections');
    } catch (err) {
      alert('Error updating collection');
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-[14px] text-gray-500 font-medium">Loading collection data...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/admin/collections" className="p-2 sm:p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors text-gray-600">
            <MdArrowBack className="text-lg sm:text-xl" />
          </Link>
          <div>
             <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Editing Collection</p>
             <h1 className="text-lg sm:text-2xl font-extrabold text-[#dd3333] line-clamp-1">{collection?.name}</h1>
          </div>
        </div>
        <button 
          onClick={saveHandler} 
          disabled={saving} 
          className="w-full sm:w-auto bg-gray-900 text-white px-6 py-3 sm:py-2.5 rounded-md text-[13px] font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-colors shadow-sm"
        >
          {saving ? 'Saving...' : 'Save Collection'}
        </button>
      </div>

      {/* Product List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-[#fbfbfb]">
          <h2 className="text-[15px] sm:text-[16px] font-bold text-gray-900">Manage Products</h2>
          <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">Select the products you want to appear in this collection.</p>
        </div>
        
        {/* Mobile Optimized Flexbox List (Replaced Table) */}
        <div className="flex flex-col divide-y divide-gray-100">
          {products.map((product) => (
            <label 
              key={product._id} 
              className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="pt-2.5 sm:pt-0 pl-1 sm:pl-2">
                <input 
                  type="checkbox" 
                  checked={selectedProducts.includes(product._id)}
                  onChange={() => handleCheckboxChange(product._id)}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer accent-gray-900"
                />
              </div>
              
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden bg-white">
                <img 
                  src={product.images?.[0] || product.image || '/images/sample.jpg'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                <div className="flex-1">
                  <span className="font-bold text-[13px] sm:text-[14px] text-gray-900 line-clamp-2 leading-snug">{product.name}</span>
                  <span className="sm:hidden text-[12px] font-bold text-gray-600 block mt-0.5">Tk {product.price}</span>
                </div>
                
                <div className="hidden sm:block text-[14px] font-bold text-gray-600 w-24 text-right">
                  Tk {product.price}
                </div>
                
                <div className="mt-1.5 sm:mt-0 w-24 sm:text-right">
                  <span className={`inline-flex px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest rounded ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {product.status || 'Active'}
                  </span>
                </div>
              </div>
            </label>
          ))}
          
          {products.length === 0 && (
            <div className="p-10 text-center text-[13px] sm:text-[14px] text-gray-500">No products found in your store.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCollectionDetails;