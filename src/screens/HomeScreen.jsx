import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { MdLocalShipping, MdSecurity, MdAssignmentReturn, MdSupportAgent, MdStar } from 'react-icons/md';

import 'swiper/css';
import 'swiper/css/navigation';

const STORE_CONTENT = {
  announcement: "🔥 FREE EXPEDITED SHIPPING ON ALL ORDERS OVER 2000 BDT 🔥",
  hero: {
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80",
    title: "Redefining Modern Elegance",
    subtitle: "Discover the new summer collection designed for comfort and tailored for confidence.",
    buttonText: "Shop The Collection",
  },
  promoBanner: {
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80",
    title: "Summer Essentials Up To 50% Off",
    subtitle: "Limited time offer. Elevate your everyday wardrobe.",
  },
  brandStory: {
    image: "https://images.unsplash.com/photo-1550614000-4b95f269477b?auto=format&fit=crop&q=80",
    title: "Crafted with Purpose.",
    description: "Every piece we create is a blend of premium materials and expert craftsmanship. We believe in sustainable fashion that doesn't compromise on style or durability. Wear it with pride.",
  },
  ugcImages: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1509631179647-0c1158b45455?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1485230405346-71acb9518d9c?auto=format&fit=crop&q=80"
  ]
};

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCounts, setVisibleCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: prodData } = await axios.get('/api/products');
        const { data: colData } = await axios.get('/api/collections');
        
        const activeProducts = prodData.filter(p => p.status !== 'Draft');
        setProducts(activeProducts);
        
        const collectionsWithImages = colData.map(col => {
          const productWithImage = activeProducts.find(p => 
            p.collections && 
            p.collections.includes(col.name) && 
            ((p.images && p.images.length > 0) || (p.image && p.image !== '/images/sample.jpg'))
          );
          
          return {
            ...col,
            image: productWithImage 
              ? (productWithImage.images?.[0] || productWithImage.image) 
              : 'https://via.placeholder.com/400x500?text=No+Image'
          };
        });
        
        setCollections(collectionsWithImages);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLoadMore = (collectionId) => {
    setVisibleCounts(prev => ({
      ...prev,
      [collectionId]: (prev[collectionId] || 8) + 4
    }));
  };

  const getDiscount = (price, compareAtPrice) => {
    if (compareAtPrice && compareAtPrice > price) {
      return compareAtPrice - price;
    }
    return 0;
  };

  return (
    <div className="font-sans bg-white min-h-screen">
      
      <div className="bg-gray-900 text-white text-[11px] md:text-xs font-bold tracking-[0.2em] text-center py-2.5 px-4 uppercase">
        {STORE_CONTENT.announcement}
      </div>

      <div 
        className="relative w-full h-[70vh] md:h-[85vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url('${STORE_CONTENT.hero.image}')` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4 flex flex-col items-center max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-6 tracking-wide drop-shadow-lg">
            {STORE_CONTENT.hero.title}
          </h1>
          <p className="text-gray-200 text-sm md:text-base mb-8 max-w-xl leading-relaxed">
            {STORE_CONTENT.hero.subtitle}
          </p>
          <Link to="/shop" className="bg-white text-gray-900 px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl">
            {STORE_CONTENT.hero.buttonText}
          </Link>
        </motion.div>
      </div>

      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <MdLocalShipping className="text-3xl text-gray-700 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center">
              <MdAssignmentReturn className="text-3xl text-gray-700 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900">30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center">
              <MdSecurity className="text-3xl text-gray-700 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Secure Checkout</span>
            </div>
            <div className="flex flex-col items-center">
              <MdSupportAgent className="text-3xl text-gray-700 mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-900">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#f9f9f9] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end border-b border-[#eaeaea] mb-10">
            <h2 className="text-[14px] md:text-[28px] font-extrabold text-black uppercase tracking-wide pb-3 relative">
              Featured Categories
              <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#dd3333]"></span>
            </h2>
            <Link to="/shop" className="text-[14px] font-semibold text-[#555555] hover:text-black pb-3 transition-colors">
              View All
            </Link>
          </div>

          {!loading && collections.length > 0 && (
            <div className="relative group">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={20}
                slidesPerView={2}
                loop={collections.length >= 4}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                navigation={{
                  nextEl: '.swiper-button-next-custom',
                  prevEl: '.swiper-button-prev-custom',
                }}
                breakpoints={{
                  768: { slidesPerView: 4 }
                }}
              >
                {collections.map((col) => (
                  <SwiperSlide key={col._id}>
                    <div 
                      onClick={() => navigate(`/shop?collection=${col.name}`)} 
                      className="block bg-white border border-[#e5e5e5] overflow-hidden cursor-pointer"
                    >
                      <div className="relative w-full bg-[#f4f4f4] aspect-[3/4] overflow-hidden">
                        <img 
                          src={col.image} 
                          alt={col.name} 
                          className="w-full h-full object-cover absolute top-0 left-0 hover:scale-105 transition-transform duration-700" 
                        />
                      </div>
                      <div className="p-4 text-center bg-white">
                        <h3 className="m-0 text-[16px] text-black font-semibold">{col.name}</h3>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              <div className="hidden md:flex swiper-button-prev-custom absolute top-1/2 -left-4 -translate-y-1/2 w-11 h-11 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] items-center justify-center text-[#333] z-10 cursor-pointer hover:bg-[#333] hover:text-white transition-colors">
                <span className="font-bold text-lg">&#10094;</span>
              </div>
              <div className="hidden md:flex swiper-button-next-custom absolute top-1/2 -right-4 -translate-y-1/2 w-11 h-11 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] items-center justify-center text-[#333] z-10 cursor-pointer hover:bg-[#333] hover:text-white transition-colors">
                <span className="font-bold text-lg">&#10095;</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-10 bg-red-50 rounded-lg">{error}</div>
      ) : (
        collections.map((col) => {
          const colProducts = products.filter(p => p.collections && p.collections.includes(col.name));
          
          if (colProducts.length === 0) return null;

          const currentVisibleCount = visibleCounts[col._id] || 8;

          return (
            <div key={col._id} className="py-16 bg-white border-b border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="flex justify-between items-end border-b border-[#e6e6e6] mb-10">
                  <h2 className="text-[20px] md:text-[24px] font-extrabold text-black uppercase tracking-wide pb-3 relative flex items-center gap-2">
                    {col.name}
                    <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-black"></span>
                  </h2>
                  <Link to={`/shop?collection=${col.name}`} className="text-[12px] md:text-[14px] font-semibold text-[#555555] hover:text-black pb-3 transition-colors">
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {colProducts.slice(0, currentVisibleCount).map((product) => {
                    const discount = getDiscount(product.price, product.compareAtPrice);
                    const hasMultipleImages = product.images && product.images.length > 1;
                    const primaryImage = product.images?.[0] || product.image;
                    const secondaryImage = hasMultipleImages ? product.images[1] : primaryImage;

                    return (
                      <div key={product._id} className="relative flex flex-col w-full bg-white border border-[#e8e8e8] overflow-hidden group cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                        
                        <div className="relative overflow-hidden bg-[#f8f8f8] aspect-[4/5] mb-0">
                          {discount > 0 && (
                            <div className="absolute top-3 right-3 bg-[#e60000] text-white px-2.5 py-1 text-[11px] md:text-[12px] font-extrabold rounded-[4px] z-10 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
                              -Tk {discount.toFixed(2)}
                            </div>
                          )}
                          <img 
                            className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-500 z-[1] group-hover:opacity-0" 
                            src={primaryImage} 
                            alt={product.name} 
                            loading="lazy" 
                          />
                          <img 
                            className="w-full h-full object-cover absolute top-0 left-0 opacity-0 scale-100 transition-all duration-600 ease-in-out z-[2] group-hover:opacity-100 group-hover:scale-110" 
                            src={secondaryImage} 
                            alt={product.name} 
                            loading="lazy" 
                          />
                        </div>

                        <div className="flex flex-col gap-2 p-3 md:p-4 bg-[#f7f7f7] border-t border-[#e8e8e8] flex-grow">
                          <div className="text-[14px] md:text-[15px] font-medium text-black leading-snug uppercase line-clamp-2">
                            {product.name}
                          </div>
                          
                          <div className="flex items-center text-yellow-400 text-sm mt-1 min-h-[20px]">
                            {[...Array(5)].map((_, i) => (
                              i < Math.round(product.rating || 0) ? <MdStar key={i} /> : null
                            ))}
                            {product.numReviews > 0 && <span className="text-gray-500 text-xs ml-1">({product.numReviews})</span>}
                          </div>

                          <div className="flex flex-row flex-wrap items-center gap-2 mt-auto">
                            <span className={`${discount > 0 ? 'text-[#dd3333]' : 'text-black'} text-[14px] md:text-[16px] font-extrabold`}>
                              Tk {product.price ? product.price.toFixed(2) : '0.00'}
                            </span>
                            {discount > 0 && (
                              <s className="text-[calc(14px*0.85)] md:text-[calc(16px*0.85)] font-medium text-[#888] decoration-[#888]">
                                Tk {product.compareAtPrice.toFixed(2)}
                              </s>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {currentVisibleCount < colProducts.length && (
                  <div className="text-center mt-10">
                    <button 
                      onClick={() => handleLoadMore(col._id)}
                      className="inline-block bg-[#2b2b2b] text-white px-10 py-3.5 text-[14px] font-extrabold uppercase rounded-[4px] cursor-pointer border border-[#2b2b2b] transition-all duration-300 hover:bg-transparent hover:text-[#2b2b2b]"
                    >
                      SHOW MORE
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      <div 
        className="relative w-full h-[50vh] bg-cover bg-center flex items-center justify-center my-10"
        style={{ backgroundImage: `url('${STORE_CONTENT.promoBanner.image}')`, backgroundAttachment: 'fixed' }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">{STORE_CONTENT.promoBanner.title}</h2>
          <p className="text-gray-200 mb-8 max-w-lg mx-auto">{STORE_CONTENT.promoBanner.subtitle}</p>
          <Link to="/shop" className="border-2 border-white text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-gray-900 transition-colors inline-block">
            Claim Offer
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="h-[500px] w-full bg-gray-200 overflow-hidden">
            <img src={STORE_CONTENT.brandStory.image} alt="Brand Story" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
          </div>
          <div className="px-4 md:px-10">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-6">{STORE_CONTENT.brandStory.title}</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {STORE_CONTENT.brandStory.description}
            </p>
            <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-900 pb-1 hover:text-gray-500 hover:border-gray-500 transition-all">
              Discover Our Story
            </Link>
          </div>
        </div>
      </div>

      <div className="py-20 max-w-[1600px] mx-auto bg-gray-50">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-2">#ELARESTYLE</h2>
          <p className="text-gray-500 text-sm">Follow us on Instagram and tag us to be featured.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {STORE_CONTENT.ugcImages.map((img, index) => (
            <div key={index} className="relative group aspect-square overflow-hidden cursor-pointer">
              <img src={img} alt={`UGC ${index}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white font-bold tracking-widest uppercase transition-opacity duration-300">
                  Shop The Look
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomeScreen;