import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { 
  MdSearch, 
  MdAdd
} from 'react-icons/md';

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      fetchProducts();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredProducts.map((p) => p._id);
      setSelectedProducts(allIds);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((productId) => productId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      setLoading(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        await Promise.all(
          selectedProducts.map((id) => axios.delete(`/api/products/${id}`, config))
        );
        
        setSelectedProducts([]);
        fetchProducts(); 
      } catch (error) {
        alert("Error during bulk delete");
        setLoading(false);
      }
    }
  };

  // ==========================================
  // ADVANCED SHOPIFY CSV IMPORT PARSER (FIXED)
  // ==========================================
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setLoading(true);
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

          const rows = results.data;
          const groupedProducts = {};

          // Grouping rows by Shopify 'Handle' to combine variants and multiple images
          rows.forEach((row) => {
            const handle = row['Handle'];
            if (!handle) return;

            if (!groupedProducts[handle]) {
              groupedProducts[handle] = {
                name: '',
                description: '',
                price: 0,
                compareAtPrice: 0,
                brand: '',
                category: '',
                status: 'Active',
                images: [],
                countInStock: 0
              };
            }

            // Fill basic info if available in this row (usually the first row of the handle)
            if (row['Title']) groupedProducts[handle].name = row['Title'];
            if (row['Body (HTML)']) groupedProducts[handle].description = row['Body (HTML)'];
            if (row['Vendor']) groupedProducts[handle].brand = row['Vendor'];
            if (row['Type']) groupedProducts[handle].category = row['Type'];
            
            // Map Shopify dynamic status safely
            if (row['Status']) {
              const csvStatus = row['Status'].toLowerCase();
              groupedProducts[handle].status = csvStatus === 'draft' ? 'Draft' : 'Active';
            }

            // Extract pricing logically
            if (row['Variant Price'] && !groupedProducts[handle].price) {
              groupedProducts[handle].price = Number(row['Variant Price']);
            }
            if (row['Variant Compare At Price'] && !groupedProducts[handle].compareAtPrice) {
              groupedProducts[handle].compareAtPrice = Number(row['Variant Compare At Price']);
            }

            // Extract inventory safely
            if (row['Variant Inventory Qty']) {
              groupedProducts[handle].countInStock += Number(row['Variant Inventory Qty']) || 0;
            }

            // Collect all unique image URLs for multiple image array
            if (row['Image Src']) {
              if (!groupedProducts[handle].images.includes(row['Image Src'])) {
                groupedProducts[handle].images.push(row['Image Src']);
              }
            }
          });

          // Convert grouped object to array and filter out invalid rows
          const productsToCreate = Object.values(groupedProducts).filter(p => p.name);

          // Upload grouped products to backend one by one
          for (const prod of productsToCreate) {
            const finalProductData = {
              ...prod,
              // এখানেই লজিকটি বসানো হয়েছে: যদি countInStock 0 বা ফাঁকা থাকে, তবে 100 বসবে
              countInStock: prod.countInStock ? prod.countInStock : 100,
              image: prod.images.length > 0 ? prod.images[0] : '/images/sample.jpg' // Set main image fallback
            };
            await axios.post('/api/products', finalProductData, config);
          }

          alert(`Successfully imported ${productsToCreate.length} products with multiple images!`);
          fetchProducts(); 
        } catch (error) {
          console.error("Import structure error:", error);
          alert('Error parsing Shopify CSV. Check schema matching.');
          setLoading(false);
        }
      }
    });
    e.target.value = null; 
  };

  // CSV EXPORT LOGIC (Shopify Format)
  const handleExportCSV = () => {
    const exportData = products.map(p => ({
      'Handle': p.name.toLowerCase().replace(/ /g, '-'),
      'Title': p.name,
      'Body (HTML)': p.description,
      'Vendor': p.brand,
      'Type': p.category,
      'Tags': 'Exported',
      'Status': p.status || 'Active',
      'Variant Price': p.price,
      'Variant Compare At Price': p.compareAtPrice,
      'Variant Inventory Qty': p.countInStock,
      'Image Src': p.images && p.images.length > 0 ? p.images[0] : p.image
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'shopify_product_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={handleExportCSV} className="text-[12px] sm:text-[13px] font-medium text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm transition-colors">
            Export
          </button>
          
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="text-[12px] sm:text-[13px] font-medium text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm transition-colors">
            Import
          </button>
          
          <button 
            onClick={() => navigate('/admin/products/create')}
            className="bg-gray-900 hover:bg-black text-white text-[12px] sm:text-[13px] font-bold px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ml-auto sm:ml-0"
          >
            <MdAdd className="text-lg" /> Add product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        
        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-[#fbfbfb]">
          <div className="flex items-center px-3 py-1.5 rounded-md bg-gray-100 flex-shrink-0 border border-gray-200">
            <span className="text-[12px] sm:text-[13px] font-bold text-gray-700">All</span>
          </div>
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl" />
            <input 
              type="text" 
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white hover:bg-gray-50 focus:bg-white border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 rounded-lg text-[13px] sm:text-[14px] text-gray-900 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between shadow-inner gap-3 relative z-10">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-[12px] sm:text-[13px] font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200">
                {selectedProducts.length} selected
              </span>
              <button onClick={handleBulkDelete} className="text-[12px] sm:text-[13px] font-bold text-red-600 hover:text-white hover:bg-red-600 px-4 py-1.5 rounded-md border border-red-200 transition-colors bg-white">
                Delete products
              </button>
            </div>
          </div>
        )}

        {/* Product List Content */}
        {loading ? (
          <div className="p-10 text-center text-gray-500 text-[14px] font-medium">Loading products...</div>
        ) : (
          <>
            {/* ====== MOBILE LIST VIEW (Hidden on md and up) ====== */}
            <div className="block md:hidden">
              <div className="flex flex-col divide-y divide-gray-100">
                {/* Mobile Select All Row */}
                <div className="p-3 flex items-center gap-3 bg-gray-50 border-b border-gray-100">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 cursor-pointer accent-gray-900"
                  />
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Select All</span>
                </div>

                {filteredProducts.map((product) => (
                  <div 
                    key={product._id} 
                    className={`p-3 sm:p-4 flex gap-3 items-start cursor-pointer hover:bg-gray-50 transition-colors ${selectedProducts.includes(product._id) ? 'bg-blue-50/30' : ''}`}
                    onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                  >
                    {/* Checkbox Area */}
                    <div className="pt-2 pl-1" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelectOne(product._id)}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 cursor-pointer accent-gray-900"
                      />
                    </div>
                    
                    {/* Image */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden bg-white">
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60' }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-[13px] sm:text-[14px] text-gray-900 line-clamp-2 leading-snug">{product.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          product.status === 'Draft' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                        }`}>
                          {product.status || 'Active'}
                        </span>
                        <span className="text-[11px] sm:text-[12px] font-medium text-gray-500">
                          {product.countInStock || 0} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ====== DESKTOP TABLE VIEW (Hidden on mobile) ====== */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="px-4 py-3 w-12 text-center">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 cursor-pointer accent-gray-900"
                      />
                    </th>
                    <th className="px-4 py-3 w-16"></th>
                    <th className="px-4 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Inventory</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product._id} 
                      className={`hover:bg-gray-50 transition-colors group cursor-pointer ${selectedProducts.includes(product._id) ? 'bg-blue-50/30' : ''}`}
                      onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                    >
                      <td className="px-4 py-3 text-center w-12" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectOne(product._id)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 cursor-pointer accent-gray-900"
                        />
                      </td>
                      <td className="px-4 py-3 w-16">
                        <div className="w-10 h-10 border border-gray-200 rounded-md overflow-hidden bg-white flex items-center justify-center">
                          <img 
                            src={product.images && product.images.length > 0 ? product.images[0] : product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {product.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                          product.status === 'Draft' 
                            ? 'bg-gray-100 text-gray-600 border border-gray-200' 
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {product.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-gray-600">
                        {product.countInStock || 0} in stock
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-gray-600">
                        {product.category || '—'}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-gray-600">
                        {product.brand || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="p-10 text-center text-gray-500 text-[13px]">No products match your search.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProductList;