import { Link } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <div className="flex justify-center items-center gap-2 md:gap-4 mb-10 text-[11px] md:text-sm font-bold uppercase tracking-wider">
      
      <div className={`flex items-center gap-1 ${step1 ? 'text-gray-900' : 'text-gray-400'}`}>
        {step1 ? <Link to="/login" className="hover:underline">Sign In</Link> : <span>Sign In</span>}
      </div>

      <div className={`w-8 md:w-16 h-px ${step2 ? 'bg-gray-900' : 'bg-gray-300'}`}></div>

      <div className={`flex items-center gap-1 ${step2 ? 'text-gray-900' : 'text-gray-400'}`}>
        {step2 ? <Link to="/shipping" className="hover:underline">Shipping</Link> : <span>Shipping</span>}
      </div>

      <div className={`w-8 md:w-16 h-px ${step3 ? 'bg-gray-900' : 'bg-gray-300'}`}></div>

      <div className={`flex items-center gap-1 ${step3 ? 'text-gray-900' : 'text-gray-400'}`}>
        {step3 ? <Link to="/payment" className="hover:underline">Payment</Link> : <span>Payment</span>}
      </div>

      <div className={`w-8 md:w-16 h-px ${step4 ? 'bg-gray-900' : 'bg-gray-300'}`}></div>

      <div className={`flex items-center gap-1 ${step4 ? 'text-gray-900' : 'text-gray-400'}`}>
        {step4 ? <Link to="/placeorder" className="hover:underline">Place Order</Link> : <span>Place Order</span>}
      </div>

    </div>
  );
};

export default CheckoutSteps;