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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md m-6 border border-red-100">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 font-sans">
      <div className="flex items-center justify-between mb-8">
        <Link 
          to="/admin/messages" 
          className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors uppercase tracking-widest"
        >
          <MdArrowBack className="text-xl" /> Back to Messages
        </Link>
        
        <button
          onClick={deleteHandler}
          disabled={deleteLoading}
          className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-bold transition-colors disabled:opacity-50"
        >
          <MdDelete className="text-lg" /> {deleteLoading ? 'Deleting...' : 'Delete Message'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto">
        <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{message.subject}</h1>
            <p className="text-sm text-gray-500">
              From: <span className="font-bold text-gray-900">{message.name}</span>
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {new Date(message.createdAt).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(message.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="mb-8 whitespace-pre-wrap text-gray-700 leading-relaxed text-sm md:text-base">
            {message.message}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <a 
              href={`mailto:${message.email}?subject=Re: ${message.subject}`}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-md text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors"
            >
              <MdReply className="text-xl" /> Reply to {message.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessageScreen;