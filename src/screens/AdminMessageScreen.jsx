import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MdArrowBack, MdDelete, MdReply } from 'react-icons/md';

const AdminMessageScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo') 
          ? JSON.parse(localStorage.getItem('userInfo')) 
          : null;

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        };
        const { data } = await axios.get(`/api/contact/${id}`, config);
        setMessage(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch message');
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [id]);

  const deleteHandler = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setDeleteLoading(true);
      try {
        const userInfo = localStorage.getItem('userInfo') 
          ? JSON.parse(localStorage.getItem('userInfo')) 
          : null;
          
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        };
        await axios.delete(`/api/contact/${id}`, config);
        navigate('/admin/messages');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete message');
        setDeleteLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center font-medium text-gray-500">
        Loading message...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md m-6 border border-red-200 font-medium text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-20 font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-20 md:static">
        <div className="flex items-center gap-3">
          <Link to="/admin/messages" className="p-2 sm:p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors text-gray-600 flex-shrink-0">
            <MdArrowBack className="text-lg sm:text-xl" />
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Message Details</p>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 line-clamp-1">{message.subject}</h1>
          </div>
        </div>
        
        <button
          onClick={deleteHandler}
          disabled={deleteLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-4 py-3 sm:py-2.5 rounded-md text-[13px] font-bold transition-colors disabled:opacity-50"
        >
          <MdDelete className="text-lg" /> {deleteLoading ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 bg-[#fbfbfb] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[16px] sm:text-[18px] font-bold text-gray-900">{message.subject}</h2>
            <p className="text-[13px] sm:text-[14px] text-gray-600 flex flex-wrap items-center gap-1.5">
              From: <span className="font-bold text-gray-900">{message.name}</span>
              <span className="text-gray-400 hidden sm:inline">•</span>
              <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline break-all">{message.email}</a>
            </p>
          </div>
          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0.5 text-left md:text-right pt-2 md:pt-0 border-t border-gray-200 md:border-0 mt-2 md:mt-0">
            <p className="text-[12px] sm:text-[13px] font-bold text-gray-900">
              {new Date(message.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </p>
            <span className="text-gray-400 md:hidden">•</span>
            <p className="text-[11px] sm:text-[12px] font-bold text-gray-500 uppercase tracking-wider">
              {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8 whitespace-pre-wrap text-gray-800 leading-relaxed text-[14px] sm:text-[15px] bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-100 min-h-[150px]">
            {message.message}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <a 
              href={`mailto:${message.email}?subject=Re: ${message.subject}`}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gray-900 text-white px-6 py-3.5 sm:py-3 rounded-md text-[13px] font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-sm"
            >
              <MdReply className="text-lg sm:text-xl" /> Reply to Customer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessageScreen;