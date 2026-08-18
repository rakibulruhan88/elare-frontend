import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MdArrowBack, MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdFormatListBulleted, MdImage, MdClose } from 'react-icons/md';

const AdminProductEdit = () => {
  const { id: productId } = useParams(); 
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [compareAtPrice, setCompareAtPrice] = useState(0); 
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Active');
  const [images, setImages] = useState([]); 
  
  const [collectionsList, setCollectionsList] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);

  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${productId}`);
        setName(data.name || '');
        setPrice(data.price || 0);
        setCompareAtPrice(data.compareAtPrice || 0);
        setBrand(data.brand || '');
        setCategory(data.category || '');
        setCountInStock(data.countInStock || 0);
        setDescription(data.description || '');
        setStatus(data.status || 'Active'); 
        setSelectedCollections(data.collections || []);
        
        if (data.images && data.images.length > 0) {
          setImages(data.images);
        } else if (data.image) {
          setImages([data.image]);
        }
        
        setLoadingFetch(false);
      } catch (err) {
        setError('Error fetching product details.');
        setLoadingFetch(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files); 
    if (files.length === 0) return;
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
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
    setLoadingUpdate(true);
    setError('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      
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

      await axios.put(`/api/products/${productId}`, productData, config);
      alert('Product updated successfully!');
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating product.');
      setLoadingUpdate(false);
    }
  };

  if (loadingFetch) {
    return <div className="min-h-screen flex items-center justify-center font-semibold text-gray-500">Loading product details...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f1f2f4] p-4 md:p-14 -mx-4 md:-mx-8 -my-4 md:-my-8 font-sans">
      <form onSubmit={submitHandler} className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin/products" className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-600"><MdArrowBack className="text-xl" /></Link>
            <h1 className="text-xl font-bold text-gray-900">Edit product</h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/admin/products')} className="text-sm font-medium text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">Discard</button>
            <button type="submit" disabled={loadingUpdate} className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-2">
              {loadingUpdate ? 'Updating...' : 'Save changes'}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="mb-5">
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Title</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Description</label>
                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex items-center gap-2 text-gray-500">
                    <button type="button" className="p-1 hover:bg-gray-200 rounded"><MdFormatBold /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded"><MdFormatItalic /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded"><MdFormatUnderlined /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded"><MdFormatListBulleted /></button>
                  </div>

                  <textarea rows="8" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-3 text-[14px] text-gray-900 focus:outline-none resize-y min-h-[150px]"></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Media</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} draggable onDragStart={(e) => (dragItem.current = index)} onDragEnter={(e) => (dragOverItem.current = index)} onDragEnd={handleSort} onDragOver={(e) => e.preventDefault()} className={`relative rounded-xl border border-gray-200 overflow-hidden cursor-move group hover:shadow-md transition-shadow bg-gray-50 ${index === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}>
                    <img src={img} alt={`Product ${index}`} className="w-full h-full object-cover" />
                    {index === 0 && <span className="absolute bottom-2 left-2 bg-white/90 text-gray-800 text-[11px] font-bold px-2 py-1 rounded shadow-sm">Main image</span>}
                    <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-2 right-2 bg-white/90 text-gray-600 hover:text-red-600 p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><MdClose className="text-lg" /></button>
                  </div>
                ))}
                <div className={`border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative overflow-hidden ${images.length === 0 ? 'col-span-2 sm:col-span-4 p-12' : 'aspect-square p-4'}`}>
                  <input type="file" multiple onChange={uploadFileHandler} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="flex flex-col items-center relative z-0">
                    <div className="w-10 h-10 bg-white shadow-sm border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 mb-2"><MdImage className="text-xl" /></div>
                    <span className="text-[13px] text-blue-600 font-medium mb-0.5">Add files</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Compare at price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Available Inventory</label>
                  <input type="number" min="0" value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Status</h2>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer">
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Product organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Vendor</label>
                  <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Category</label>
                  <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Collections</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {collectionsList.map((col) => (
                  <label key={col._id} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedCollections.includes(col.name)}
                      onChange={() => handleCollectionChange(col.name)}
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span className="text-[13px] text-gray-700">{col.name}</span>
                  </label>
                ))}
                {collectionsList.length === 0 && (
                  <p className="text-xs text-gray-500">No collections found.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductEdit;