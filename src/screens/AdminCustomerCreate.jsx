import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

const AdminCustomerCreate = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

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

      await axios.post('/api/users', { name, email, password, isAdmin }, config);
      
      alert('Customer created successfully!');
      navigate('/admin/customers');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating customer. Email might already exist.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 font-sans space-y-4 sm:space-y-6">
      <form onSubmit={submitHandler} className="space-y-4 sm:space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20 md:static">
          <div className="flex items-center gap-3">
            <Link to="/admin/customers" className="p-2 sm:p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors text-gray-600 flex-shrink-0">
              <MdArrowBack className="text-lg sm:text-xl" />
            </Link>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">New Customer</p>
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 line-clamp-1">Add Customer</h1>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white text-[13px] font-bold px-6 py-3 sm:py-2.5 rounded-md shadow-sm transition-colors text-center disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Customer'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Customer Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md text-[16px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
              placeholder="e.g. John Doe"
              required 
            />
          </div>
          
          <div>
            <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md text-[16px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
              placeholder="e.g. john@example.com"
              required 
            />
          </div>

          <div>
            <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md text-[16px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
              placeholder="Set a password for this user"
              required 
            />
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-start sm:items-center gap-3 cursor-pointer p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
              <div className="pt-0.5 sm:pt-0">
                <input 
                  type="checkbox" 
                  checked={isAdmin} 
                  onChange={(e) => setIsAdmin(e.target.checked)} 
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer accent-gray-900" 
                />
              </div>
              <div className="flex-1">
                <span className="block text-[13px] sm:text-[14px] font-bold text-gray-900">Is Admin Account?</span>
                <span className="block text-[11px] sm:text-[12px] text-gray-500 mt-0.5 leading-snug">Checking this box gives this user full backend access to the admin panel.</span>
              </div>
            </label>
          </div>
        </div>

      </form>
    </div>
  );
};

export default AdminCustomerCreate;