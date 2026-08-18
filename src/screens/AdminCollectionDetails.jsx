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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading collection data...</div>;

  return (
    <div className="p-8 bg-[#f1f2f4] min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/collections" className="p-2 hover:bg-gray-200 rounded-md transition-colors text-gray-600">
            <MdArrowBack className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Editing Collection: <span className="text-blue-600">{collection?.name}</span>
          </h1>
        </div>
        <button 
          onClick={saveHandler} 
          disabled={saving} 
          className="bg-gray-900 text-white px-6 py-2 rounded font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Collection'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Manage Products in this Collection</h2>
          <p className="text-sm text-gray-500 mt-1">Select the products you want to appear in the "{collection?.name}" collection.</p>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-16"></th>
              <th className="px-6 py-4 text-sm font-medium text-gray-600">Product Details</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-600">Price</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-600">Current Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleCheckboxChange(product._id)}>
                <td className="px-6 py-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => handleCheckboxChange(product._id)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-6 py-4 flex items-center gap-4">
                  <img 
                    src={product.images?.[0] || product.image || '/images/sample.jpg'} 
                    alt={product.name} 
                    className="w-12 h-12 object-cover rounded border border-gray-200"
                  />
                  <span className="font-medium text-gray-900">{product.name}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">Tk {product.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.status || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No products found in your store.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCollectionDetails;