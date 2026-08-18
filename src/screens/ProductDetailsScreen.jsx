import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdLocalShipping, MdAutorenew, MdVerifiedUser, MdEco, MdDesignServices,
  MdAdd, MdRemove, MdStar, MdStarBorder 
} from 'react-icons/md';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

const ProductDetailsScreen = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [qty, setQty] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setQty(1);
  }, [productId]);

  const { 
    data: product = { reviews: [] }, 
    isLoading: loading, 
    error: queryError 
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/products/${productId}`);
      return data;
    }
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['relatedProducts', productId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/products/${productId}/related`);
      return data;
    },
    enabled: !!productId
  });

  const { data: isEligibleToReview = false, isFetched: eligibilityChecked } = useQuery({
    queryKey: ['reviewEligibility', productId, userInfo?.token],
    queryFn: async () => {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders/mine', config);
      return data.some(order => 
        order.isDelivered && order.orderItems.some(item => item.product === productId || item.product._id === productId)
      );
    },
    enabled: !!userInfo && !!productId,
  });

  const _processCartItem = () => {
    const cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    const item = {
      product: product._id,
      name: product.name,
      image: product.images && product.images.length > 0 ? product.images[0] : product.image,
      price: product.price,
      qty: qty,
    };

    const existItem = cartItems.find((x) => x.product === item.product);
    let updatedItems = existItem 
      ? cartItems.map((x) => x.product === existItem.product ? { ...item, qty: x.qty + qty } : x)
      : [...cartItems, item];

    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const addToCartHandler = () => {
    if (!userInfo) {
      alert("Please login first to add items to your cart!");
      navigate('/login?redirect=/product/' + productId);
      return;
    }
    _processCartItem();
    window.dispatchEvent(new CustomEvent('toggleCartDrawer', { detail: true }));
  };

  const buyItNowHandler = () => {
    if (!userInfo) {
      alert("Please login first to proceed to checkout!");
      navigate('/login?redirect=/product/' + productId);
      return;
    }
    _processCartItem();
    navigate('/placeorder');
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!isEligibleToReview) return;

    setReviewLoading(true);
    setReviewError('');
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(`/api/products/${productId}/reviews`, { rating, comment }, config);
      setReviewLoading(false);
      setReviewSuccess(true);
      setComment('');
      setRating(5);
      
      queryClient.invalidateQueries(['product', productId]);
      
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewLoading(false);
      setReviewError(err.response?.data?.detail || 'Failed to submit review');
    }
  };

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const errorMessage = queryError ? (queryError.response?.data?.message || 'Error fetching product details') : '';

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  if (errorMessage) return <div className="min-h-screen p-8 text-red-600 text-center mt-10">{errorMessage}</div>;

  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      
      <div className="bg-gray-900 text-white py-2 text-[10px] sm:text-xs font-medium tracking-widest uppercase flex justify-center items-center gap-4 sm:gap-8 overflow-hidden px-2 text-center">
        <span className="flex items-center gap-1 sm:gap-2"><MdVerifiedUser /> Authentic</span>
        <span className="flex items-center gap-1 sm:gap-2"><MdLocalShipping /> Free Shipping</span>
        <span className="hidden sm:flex items-center gap-2"><MdAutorenew /> 30-Day Returns</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 h-auto md:h-[650px] md:sticky md:top-8">
            <div className="w-full md:w-24 h-20 md:h-full">
              <Swiper
                onSwiper={setThumbsSwiper}
                direction="horizontal"
                breakpoints={{ 768: { direction: 'vertical' } }}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="h-full w-full custom-thumb-swiper"
              >
                {productImages.map((img, index) => (
                  <SwiperSlide key={index} className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity [&.swiper-slide-thumb-active]:opacity-100 [&.swiper-slide-thumb-active]:border border-gray-900 rounded-sm overflow-hidden">
                    <img src={img} alt={`Thumb ${index}`} className="w-full h-full object-cover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="w-full md:w-[calc(100%-7rem)] h-[350px] sm:h-[450px] md:h-full bg-[#f4f4f4] rounded-sm overflow-hidden relative group border border-[#e5e5e5]">
              <Swiper
                style={{ '--swiper-navigation-color': '#000', '--swiper-navigation-size': '20px' }}
                spaceBetween={0}
                navigation={true}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                modules={[FreeMode, Navigation, Thumbs]}
                className="h-full w-full"
              >
                {productImages.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img src={img} alt={`Main ${index}`} className="w-full h-full object-cover zoom-on-hover" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col pt-0 sm:pt-4">
            {product.collections && product.collections.length > 0 && (
              <p className="text-[11px] text-gray-500 font-bold tracking-widest uppercase mb-2 sm:mb-3">
                {product.collections[0]}
              </p>
            )}
            <h1 className="text-[24px] sm:text-[28px] md:text-[32px] font-extrabold text-black mb-3 sm:mb-4 leading-tight uppercase tracking-wide">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="flex text-yellow-400 text-base sm:text-lg">
                {[...Array(5)].map((_, i) => (
                  i < Math.round(product.rating || 0) ? <MdStar key={i} /> : <MdStarBorder key={i} className="text-gray-300" />
                ))}
              </div>
              <a href="#reviews" className="text-[12px] sm:text-[13px] font-medium text-gray-500 hover:text-black transition-colors underline underline-offset-4">
                ({product.numReviews || 0} reviews)
              </a>
            </div>

            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <span className="text-[20px] sm:text-[22px] text-[#dd3333] font-extrabold">
                Tk {product.price ? product.price.toFixed(2) : '0.00'}
              </span>
              {product.compareAtPrice > product.price && (
                <s className="text-[14px] sm:text-[16px] font-medium text-[#888888]">
                  Tk {product.compareAtPrice.toFixed(2)}
                </s>
              )}
            </div>

            {/* ====== FIXED CART & QUANTITY SECTION FOR MOBILE ====== */}
            <div className="flex flex-col gap-2 sm:gap-3 mb-8">
              {/* Flex-row ensures they are side-by-side even on small screens */}
              <div className="flex flex-row gap-2 sm:gap-3">
                
                {/* Quantity Selector - Fixed smaller width on mobile */}
                <div className="flex items-center border border-[#e5e5e5] bg-white h-[45px] sm:h-[50px] w-[100px] sm:w-[120px] flex-shrink-0">
                  <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)} className="flex-1 h-full text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium">-</button>
                  <span className="w-8 sm:w-12 text-center text-[14px] sm:text-[15px] font-bold">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="flex-1 h-full text-gray-600 hover:bg-gray-50 transition-colors text-lg font-medium">+</button>
                </div>

                {/* Add to Cart Button - Flex-1 takes remaining space */}
                <button 
                  onClick={addToCartHandler}
                  className="flex-1 bg-white text-black border border-black h-[45px] sm:h-[50px] text-[12px] sm:text-[14px] font-extrabold tracking-wide sm:tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300 px-1"
                >
                  Add To Cart
                </button>
              </div>
              
              {/* Buy It Now Button */}
              <button 
                onClick={buyItNowHandler}
                className="w-full bg-[#dd3333] text-white h-[45px] sm:h-[50px] text-[13px] sm:text-[14px] font-extrabold tracking-widest uppercase shadow-md hover:bg-black transition-all duration-300"
              >
                Buy It Now
              </button>
            </div>
            {/* ====================================================== */}

            <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-8 sm:mb-10 text-[11px] sm:text-sm">
              <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 p-3 sm:p-4 bg-[#f9f9f9] border border-[#e5e5e5]">
                <MdEco className="text-lg sm:text-xl text-black flex-shrink-0" /> 
                <span className="font-medium text-black">Sustainable</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 p-3 sm:p-4 bg-[#f9f9f9] border border-[#e5e5e5]">
                <MdDesignServices className="text-lg sm:text-xl text-black flex-shrink-0" /> 
                <span className="font-medium text-black">Tailored Fit</span>
              </div>
            </div>

            <div className="border-t border-[#e5e5e5]">
              <div className="border-b border-[#e5e5e5]">
                <button onClick={() => toggleAccordion('description')} className="w-full flex justify-between items-center py-4 sm:py-5 text-[13px] sm:text-[14px] font-bold text-black uppercase tracking-wide">
                  Product Details
                  {activeAccordion === 'description' ? <MdRemove className="text-lg"/> : <MdAdd className="text-lg"/>}
                </button>
                <AnimatePresence>
                  {activeAccordion === 'description' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pb-6 text-[13px] sm:text-[14px] text-gray-600 leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="border-b border-[#e5e5e5]">
                <button onClick={() => toggleAccordion('fit')} className="w-full flex justify-between items-center py-4 sm:py-5 text-[13px] sm:text-[14px] font-bold text-black uppercase tracking-wide">
                  Size & Fit
                  {activeAccordion === 'fit' ? <MdRemove className="text-lg"/> : <MdAdd className="text-lg"/>}
                </button>
                <AnimatePresence>
                  {activeAccordion === 'fit' && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pb-6 text-[13px] sm:text-[14px] text-gray-600 space-y-2 leading-relaxed">
                        <p><strong>Fit:</strong> True to size. Designed for a tailored, elegant drape.</p>
                        <p><strong>Care:</strong> Machine wash cold with like colors. Do not bleach.</p>
                        <p className="mt-4 italic text-gray-500">Need help finding your size? Contact our support team.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-[#eaeaea]">
          <div className="flex justify-between items-end border-b border-[#eaeaea] mb-6 sm:mb-8">
            <h2 className="text-[18px] md:text-[24px] font-extrabold text-black uppercase tracking-wide pb-2 sm:pb-3 relative">
              Complete The Look
              <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-black"></span>
            </h2>
            {product.collections && product.collections.length > 0 && (
               <Link to={`/shop?collection=${product.collections[0]}`} className="text-[12px] sm:text-[13px] font-semibold text-[#555] hover:text-black pb-2 sm:pb-3 transition-colors">
                 View All
               </Link>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {relatedProducts.map((relProduct) => {
               const primaryImage = relProduct.images?.[0] || relProduct.image;
               const secondaryImage = relProduct.images && relProduct.images.length > 1 ? relProduct.images[1] : primaryImage;
               
               return (
                  <div key={relProduct._id} className="relative flex flex-col w-full bg-white border border-[#e8e8e8] overflow-hidden group cursor-pointer" onClick={() => navigate(`/product/${relProduct._id}`)}>
                    <div className="relative overflow-hidden bg-[#f8f8f8] aspect-[4/5] mb-0">
                      <img 
                        className="w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-500 z-[1] group-hover:opacity-0" 
                        src={primaryImage} 
                        alt={relProduct.name} 
                      />
                      <img 
                        className="w-full h-full object-cover absolute top-0 left-0 opacity-0 scale-100 transition-all duration-600 ease-in-out z-[2] group-hover:opacity-100 group-hover:scale-110" 
                        src={secondaryImage} 
                        alt={relProduct.name} 
                      />
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2 p-3 bg-[#f7f7f7] border-t border-[#e8e8e8] flex-grow">
                      <div className="text-[12px] sm:text-[14px] font-medium text-black leading-snug uppercase line-clamp-2">
                        {relProduct.name}
                      </div>
                      <div className="flex flex-row flex-wrap items-center gap-2 mt-auto">
                        <span className="text-black text-[13px] sm:text-[14px] font-extrabold">
                          Tk {relProduct.price ? relProduct.price.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
               );
            })}
          </div>
        </div>
      )}

      <div id="reviews" className="bg-[#f9f9f9] border-t border-[#eaeaea] py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-[20px] md:text-[28px] font-extrabold text-black uppercase tracking-wide relative inline-block pb-2 sm:pb-3">
              Customer Reviews
              <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#dd3333]"></span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16">
            
            <div className="md:col-span-7 order-2 md:order-1">
              {(!product.reviews || product.reviews.length === 0) ? (
                <div className="text-center p-8 sm:p-12 bg-white border border-[#e5e5e5] shadow-sm">
                  <p className="text-[#555] font-medium text-sm sm:text-base">No reviews yet. Be the first to share your experience!</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
                  {product.reviews.map((review, index) => (
                    <div key={index} className="bg-white p-4 sm:p-6 border border-[#e5e5e5] shadow-sm">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex text-yellow-400 text-[13px] sm:text-[15px]">
                          {[...Array(5)].map((_, i) => i < review.rating ? <MdStar key={i} /> : <MdStarBorder key={i} />)}
                        </div>
                        <span className="text-[11px] sm:text-[12px] font-medium text-[#888]">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-[13px] sm:text-[14px] font-extrabold text-black mb-2 flex items-center gap-2">
                        {review.name} 
                        <span className="text-green-700 text-[9px] sm:text-[10px] uppercase bg-green-50 px-2 py-0.5 rounded flex items-center gap-1"><MdVerifiedUser/> Verified Buyer</span>
                      </h4>
                      <p className="text-[13px] sm:text-[14px] text-[#555] leading-relaxed italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-5 order-1 md:order-2">
              <div className="bg-white p-5 sm:p-8 border border-[#e5e5e5] shadow-sm md:sticky md:top-8">
                <h3 className="text-[16px] sm:text-[18px] font-extrabold text-black mb-4 sm:mb-6 uppercase tracking-wide border-b border-[#eaeaea] pb-3 sm:pb-4">Write a Review</h3>
                
                {reviewSuccess && (
                  <div className="bg-green-50 text-green-700 p-3 sm:p-4 text-[12px] sm:text-[13px] font-medium mb-4 sm:mb-6 border border-green-200">
                    Thank you! Your review has been submitted successfully.
                  </div>
                )}

                {!userInfo ? (
                  <div className="text-[13px] sm:text-[14px] text-[#555] bg-[#f9f9f9] p-4 sm:p-5 text-center border border-[#eaeaea]">
                    Please <Link to={`/login?redirect=/product/${productId}`} className="font-extrabold text-black border-b border-black pb-0.5 ml-1">sign in</Link> to write a review.
                  </div>
                ) : eligibilityChecked && !isEligibleToReview ? (
                  <div className="bg-yellow-50 p-4 sm:p-5 border-l-4 border-yellow-400 text-[12px] sm:text-[13px] text-gray-800">
                    <p className="font-extrabold mb-1 uppercase tracking-wide">Want to review this product?</p>
                    <p>You can only write a review after you have purchased and received this item.</p>
                  </div>
                ) : (
                  <form onSubmit={submitReviewHandler}>
                    {reviewError && <div className="bg-red-50 text-red-600 p-3 sm:p-4 text-[12px] sm:text-[13px] font-medium mb-4 sm:mb-6 border border-red-100">{reviewError}</div>}
                    
                    <div className="mb-4 sm:mb-6">
                      <label className="block text-[11px] sm:text-[12px] font-extrabold text-black uppercase tracking-wider mb-2 sm:mb-3">Overall Rating</label>
                      <div className="flex gap-1 sm:gap-2 cursor-pointer">
                        {[...Array(5)].map((_, i) => (
                          <MdStar 
                            key={i} 
                            className={`text-2xl sm:text-3xl ${i < rating ? 'text-yellow-400' : 'text-gray-200'} hover:scale-110 transition-transform`}
                            onClick={() => setRating(i + 1)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mb-4 sm:mb-6">
                      <label className="block text-[11px] sm:text-[12px] font-extrabold text-black uppercase tracking-wider mb-2 sm:mb-3">Your Experience</label>
                      <textarea 
                        rows="4" 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        placeholder="What did you love about it? How was the fit?"
                        className="w-full border border-[#e5e5e5] p-3 sm:p-4 focus:outline-none focus:border-black text-[13px] sm:text-[14px] bg-[#f9f9f9] focus:bg-white transition-colors resize-none"
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={reviewLoading}
                      className="w-full bg-black text-white px-4 sm:px-6 py-3 sm:py-4 text-[13px] sm:text-[14px] font-extrabold uppercase tracking-widest hover:bg-[#333] transition-colors disabled:opacity-50"
                    >
                      {reviewLoading ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductDetailsScreen;