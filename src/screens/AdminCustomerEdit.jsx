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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading details...</div>;

  return (
    <div className="min-h-screen bg-[#f1f2f4] p-4 md:p-14 -mx-4 md:-mx-8 -my-4 md:-my-8 font-sans">
      <form onSubmit={submitHandler} className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin/customers" className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-600">
              <MdArrowBack className="text-xl" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Edit Customer</h1>
          </div>
          <button type="submit" disabled={updateLoading} className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-1.5 rounded-lg shadow-sm transition-colors">
            {updateLoading ? 'Saving...' : 'Save changes'}
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" />
              <div>
                <span className="block text-[14px] font-medium text-gray-900">Is Admin?</span>
                <span className="block text-[12px] text-gray-500">Give this user access to the admin panel.</span>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminCustomerEdit;