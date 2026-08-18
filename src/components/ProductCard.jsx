import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {

  const hasDiscount = product.compareAtPrice > product.price;

  return (
    <Link to={`/product/${product._id}`} className="group block">

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-100 mb-4">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        

        {hasDiscount && (
          <span className="absolute bottom-3 left-3 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 tracking-wider uppercase rounded-sm shadow-sm">
            Sale
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1">
        <h3 className="text-[14px] text-gray-900 font-medium group-hover:underline decoration-gray-400 underline-offset-4">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mt-1">
          {hasDiscount ? (
            <>
              <span className="text-[14px] text-gray-900 font-semibold">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-[13px] text-gray-500 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-[14px] text-gray-900 font-semibold">
              ${product.price ? product.price.toFixed(2) : '0.00'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;