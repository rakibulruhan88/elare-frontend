import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MdArrowBack, 
  MdFormatBold, 
  MdFormatItalic, 
  MdFormatUnderlined, 
  MdFormatListBulleted, 
  MdImage,
  MdClose
} from 'react-icons/md';

const AdminProductCreate = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [compareAtPrice, setCompareAtPrice] = useState(0);
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  
  const [images, setImages] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [collectionsList, setCollectionsList] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  
  const navigate = useNavigate();

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const { data } = await axios.get('/api/collections');
        setCollectionsList(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCollections();
  }, []);

  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files); 
    if (files.length === 0) return;

    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      const uploadedImageUrls = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await axios.post('/api/upload', formData, config);
        uploadedImageUrls.push(data);
      }
      
      setImages((prevImages) => [...prevImages, ...uploadedImageUrls]);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert('Image upload failed! Please try again.');
    }
  };

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    let _images = [...images];
    const draggedItemContent = _images.splice(dragItem.current, 1)[0];
    _images.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setImages(_images);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleCollectionChange = (collectionName) => {
    setSelectedCollections((prev) => 
      prev.includes(collectionName) 
        ? prev.filter((c) => c !== collectionName)
        : [...prev, collectionName]
    );
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const productData = {
        name,
        price,
        compareAtPrice, 
        image: images.length > 0 ? images[0] : '/images/sample.jpg',
        images,
        brand,
        category,
        countInStock,
        description,
        status,
        collections: selectedCollections
      };

      await axios.post('/api/products', productData, config);
      
      alert('Product created successfully!');
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating product. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 font-sans space-y-4 sm:space-y-6">
      <form onSubmit={submitHandler} className="space-y-4 sm:space-y-6">
        

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20 md:static">
          <div className="flex items-center gap-3">
            <Link to="/admin/products" className="p-2 sm:p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors text-gray-600 flex-shrink-0">
              <MdArrowBack className="text-lg sm:text-xl" />
            </Link>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">New Product</p>
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 line-clamp-1">Add Product</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button type="button" onClick={() => navigate('/admin/products')} className="flex-1 sm:flex-none text-[13px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-3 sm:py-2.5 rounded-md transition-colors border border-gray-200 text-center">
              Discard
            </button>
            <button type="submit" disabled={loading} className="flex-1 sm:flex-none bg-gray-900 hover:bg-black text-white text-[13px] font-bold px-4 py-3 sm:py-2.5 rounded-md shadow-sm transition-colors text-center disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          

          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="mb-4 sm:mb-5">
                <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Title</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-[16px] sm:text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
                  placeholder="e.g. Premium Cotton Panjabi" 
                />
              </div>
              <div>
                <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Description</label>
                <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-gray-900 focus-within:border-gray-900 transition-colors">
                  {/* Toolbar */}
                  <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex flex-wrap items-center gap-1 sm:gap-2 text-gray-600">
                    <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-lg"><MdFormatBold /></button>
                    <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-lg"><MdFormatItalic /></button>
                    <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-lg"><MdFormatUnderlined /></button>
                    <div className="w-px h-5 bg-gray-300 mx-1"></div>
                    <button type="button" className="p-1.5 hover:bg-gray-200 rounded text-lg"><MdFormatListBulleted /></button>
                  </div>

                  <textarea 
                    rows="6" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="w-full px-3 py-3 text-[16px] sm:text-[14px] text-gray-900 focus:outline-none resize-y min-h-[120px]" 
                    placeholder="Describe your product..."
                  ></textarea>
                </div>
              </div>
            </div>


            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-3 sm:mb-4">Media</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => (dragItem.current = index)}
                    onDragEnter={(e) => (dragOverItem.current = index)}
                    onDragEnd={handleSort}
                    onDragOver={(e) => e.preventDefault()}
                    className={`relative rounded-lg border border-gray-200 overflow-hidden cursor-move group bg-gray-50 hover:shadow-md transition-shadow ${
                      index === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
                    }`}
                  >
                    <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-white/95 text-gray-800 text-[10px] sm:text-[11px] font-bold px-2 py-1 rounded shadow-sm border border-gray-100">
                        Main image
                      </span>
                    )}
                    <button 
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-white text-gray-600 hover:text-red-600 p-1.5 rounded-md shadow-sm border border-gray-100 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MdClose className="text-sm sm:text-base" />
                    </button>
                  </div>
                ))}

                <div className={`border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative overflow-hidden bg-[#fbfbfb] ${
                  images.length === 0 ? 'col-span-2 sm:col-span-4 p-8 sm:p-12' : 'aspect-square p-2 sm:p-4'
                }`}>
                  <input 
                    type="file" 
                    multiple
                    onChange={uploadFileHandler}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center relative z-0">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mb-2"></div>
                      <span className="text-[12px] text-gray-600 font-medium">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center relative z-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white shadow-sm border border-gray-200 rounded-md flex items-center justify-center text-gray-500 mb-2">
                        <MdImage className="text-lg sm:text-xl" />
                      </div>
                      <span className="text-[12px] sm:text-[13px] text-blue-600 font-medium mb-0.5">Add files</span>
                      {images.length === 0 && <span className="text-[11px] sm:text-[12px] text-gray-500 hidden sm:block">Accepts multiple images</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-3 sm:mb-4">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[14px] font-bold">৳</span>
                    <input 
                      type="number" min="0" step="0.01" 
                      value={price} onChange={(e) => setPrice(Number(e.target.value))} 
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-md text-[16px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
                      placeholder="0.00" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Compare at price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[14px] font-bold">৳</span>
                    <input 
                      type="number" min="0" step="0.01" 
                      value={compareAtPrice} onChange={(e) => setCompareAtPrice(Number(e.target.value))} 
                      className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-md text-[16px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
                      placeholder="0.00" 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Available Inventory</label>
                <input 
                  type="number" min="0" 
                  value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} 
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-[16px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
                  placeholder="0" 
                />
              </div>
            </div>
          </div>


          <div className="space-y-4 sm:space-y-6">
            

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-3">Status</h2>
              <select 
                value={status} onChange={(e) => setStatus(e.target.value)} 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-[16px] sm:text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            
            {/* Product Organization */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-4">Product organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Vendor / Brand</label>
                  <input 
                    type="text" 
                    value={brand} onChange={(e) => setBrand(e.target.value)} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-[16px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
                    placeholder="e.g. Elaré" 
                  />
                </div>
                <div>
                  <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Category</label>
                  <input 
                    type="text" 
                    value={category} onChange={(e) => setCategory(e.target.value)} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-[16px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
                    placeholder="e.g. Supplements" 
                  />
                </div>
              </div>
            </div>


            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-3">Collections</h2>
              <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-2 bg-gray-50 border border-gray-100 p-3 rounded-md">
                {collectionsList.map((col) => (
                  <label key={col._id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1.5 -ml-1.5 rounded transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedCollections.includes(col.name)}
                      onChange={() => handleCollectionChange(col.name)}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 accent-gray-900"
                    />
                    <span className="text-[13px] sm:text-[14px] font-medium text-gray-700">{col.name}</span>
                  </label>
                ))}
                {collectionsList.length === 0 && (
                  <p className="text-[12px] sm:text-[13px] text-gray-500 italic">No collections found.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductCreate;