import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

const AdminCustomerEdit = () => {
  const { id: userId } = useParams();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        
        const { data } = await axios.get(`/api/users/${userId}`, config);
        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
        setLoading(false);
      } catch (err) {
        setError('Error fetching user details');
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [userId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      
      await axios.put(`/api/users/${userId}`, { name, email, isAdmin }, config);
      alert('Customer updated successfully!');
      navigate('/admin/customers');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user');
      setUpdateLoading(false);
    }
  };

  if (loading) return <div className="py-20 flex items-center justify-center font-medium text-gray-500">Loading details...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-24 font-sans space-y-4 sm:space-y-6">
      <form onSubmit={submitHandler} className="space-y-4 sm:space-y-6">
        

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20 md:static">
          <div className="flex items-center gap-3">
            <Link to="/admin/customers" className="p-2 sm:p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors text-gray-600 flex-shrink-0">
              <MdArrowBack className="text-lg sm:text-xl" />
            </Link>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Edit Customer</p>
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 line-clamp-1">{name || 'Unnamed User'}</h1>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={updateLoading} 
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white text-[13px] font-bold px-6 py-3 sm:py-2.5 rounded-md shadow-sm transition-colors text-center disabled:opacity-50"
          >
            {updateLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg text-sm font-medium">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[13px] sm:text-[14px] font-bold text-gray-800 mb-1.5">Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-md text-[16px] sm:text-[14px] focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors" 
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
                <span className="block text-[13px] sm:text-[14px] font-bold text-gray-900">Is Admin?</span>
                <span className="block text-[11px] sm:text-[12px] text-gray-500 mt-0.5 leading-snug">Give this user full access to the admin panel.</span>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminCustomerEdit;