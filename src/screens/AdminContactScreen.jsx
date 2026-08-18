import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminContactScreen = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        };
        const { data } = await axios.get('/api/contact', config);
        setMessages(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [userInfo]);

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">Customer Messages</h1>
        <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold">
          {messages.length} Messages
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No messages found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Customer Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Subject</th>
                  <th className="p-4 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map((msg) => (
                  <tr key={msg._id} className={`transition-colors hover:bg-gray-50 ${msg.isRead ? 'bg-white' : 'bg-blue-50/30'}`}>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {msg.name} {msg.isRead === false && <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>}
                    </td>
                    <td className="p-4 text-sm text-blue-600 whitespace-nowrap">
                      {msg.email}
                    </td>
                    <td className="p-4 text-sm text-gray-900 font-medium whitespace-nowrap">
                      {msg.subject.length > 30 ? msg.subject.substring(0, 30) + '...' : msg.subject}
                    </td>
                    <td className="p-4 text-sm text-center whitespace-nowrap">
                      <Link 
                        to={`/admin/messages/${msg._id}`}
                        className="bg-gray-900 text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContactScreen;