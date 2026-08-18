import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdHistory } from 'react-icons/md';

const AdminAILogsScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token || !userInfo.isAdmin) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const res = await axios.get('/api/ai/logs', config);
        setLogs(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load AI logs');
        setLoading(false);
      }
    };
    fetchLogs();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Full Logs...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f1f2f4] p-4 md:p-14 -mx-4 md:-mx-8 -my-4 md:-my-8 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/admin/ai-dashboard')} 
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <MdArrowBack className="text-xl text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdHistory className="text-blue-600" /> Full AI Conversation Logs
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">Detailed history of all customer interactions with the AI assistant.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-0 overflow-x-auto">
          {logs && logs.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Customer Message</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider w-1/3">AI Response</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-[12px] text-gray-500 font-medium whitespace-nowrap">{log.time}</td>
                    <td className="px-6 py-4 text-[13px] font-bold text-gray-900">{log.user}</td>
                    <td className="px-6 py-4 text-[13px] text-gray-700 font-medium bg-gray-50/50">"{log.message}"</td>
                    <td className="px-6 py-4 text-[13px] text-gray-600 leading-relaxed">{log.ai_response}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-[11px] font-bold uppercase rounded ${log.status === 'Converted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500 text-[14px]">
              No chat logs found in the database.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAILogsScreen;