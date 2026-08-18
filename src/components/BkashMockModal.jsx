import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BkashMockModal = ({ isOpen, onClose, amount, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(step + 1);
    }, 1200);
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep(1);
        setPhone('');
        setOtp('');
        setPin('');
      }, 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-[350px] bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="bg-[#e2136e] pt-6 pb-4 px-4 flex flex-col items-center justify-center relative">
              <button 
                onClick={onClose}
                className="absolute top-3 right-3 text-white/80 hover:text-white font-bold text-xl"
              >
                ×
              </button>
              <div className="text-white font-black text-3xl tracking-tighter mb-1">
                bKash
              </div>
              <div className="w-full flex justify-between items-center text-white text-sm mt-4 border-t border-white/20 pt-2">
                <div className="flex flex-col">
                  <span className="opacity-80 text-[11px]">Merchant</span>
                  <span className="font-bold">ELARE Fashion</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="opacity-80 text-[11px]">Amount</span>
                  <span className="font-bold">৳ {amount}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#f5f5f5] min-h-[200px] flex flex-col justify-center">
              {step === 1 && (
                <div className="text-center">
                  <p className="text-[#e2136e] font-bold text-[14px] mb-4">Your bKash Account Number</p>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g 01XXXXXXXXX"
                    className="w-full text-center border-b-2 border-[#e2136e] bg-transparent outline-none py-2 text-lg font-medium text-gray-800 placeholder-gray-400 mb-6"
                  />
                  <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-gray-300 text-gray-700 font-bold rounded hover:bg-gray-400 transition-colors uppercase text-sm">Close</button>
                    <button onClick={handleNext} disabled={phone.length < 11 || loading} className="flex-1 py-2.5 bg-[#e2136e] text-white font-bold rounded hover:bg-[#c91060] disabled:opacity-50 transition-colors uppercase text-sm">
                      {loading ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="text-center">
                  <p className="text-[#e2136e] font-bold text-[14px] mb-2">bKash Verification Code</p>
                  <p className="text-[11px] text-gray-500 mb-4">A code has been sent to your number</p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="bKash OTP"
                    className="w-full text-center border-b-2 border-[#e2136e] bg-transparent outline-none py-2 text-lg font-medium text-gray-800 placeholder-gray-400 mb-6"
                  />
                  <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-gray-300 text-gray-700 font-bold rounded hover:bg-gray-400 transition-colors uppercase text-sm">Close</button>
                    <button onClick={handleNext} disabled={otp.length < 4 || loading} className="flex-1 py-2.5 bg-[#e2136e] text-white font-bold rounded hover:bg-[#c91060] disabled:opacity-50 transition-colors uppercase text-sm">
                      {loading ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center">
                  <p className="text-[#e2136e] font-bold text-[14px] mb-4">Enter bKash PIN</p>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="bKash PIN"
                    className="w-full text-center border-b-2 border-[#e2136e] bg-transparent outline-none py-2 text-2xl font-black text-gray-800 placeholder-gray-400 mb-6 tracking-widest"
                  />
                  <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-gray-300 text-gray-700 font-bold rounded hover:bg-gray-400 transition-colors uppercase text-sm">Close</button>
                    <button onClick={handleConfirm} disabled={pin.length < 4 || loading} className="flex-1 py-2.5 bg-[#e2136e] text-white font-bold rounded hover:bg-[#c91060] disabled:opacity-50 transition-colors uppercase text-sm">
                      {loading ? 'Verifying...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Payment Successful</h3>
                  <p className="text-sm text-gray-500 mt-1">Redirecting to order details...</p>
                </div>
              )}
            </div>

            <div className="bg-[#e2136e] py-2 text-center text-white/80 text-[10px]">
              16247
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BkashMockModal;