import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdAutoAwesome, MdChat, MdShowChart, MdOutlineShoppingBag, MdThumbUp, MdWarning } from 'react-icons/md';

const AdminAIDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token || !userInfo.isAdmin) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const res = await axios.get('/api/ai/analytics', config);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load AI analytics');
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading AI Intelligence...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f1f2f4] p-4 md:p-14 -mx-4 md:-mx-8 -my-4 md:-my-8 font-sans">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdAutoAwesome className="text-purple-600" /> AI Intelligence Dashboard
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">Monitor your AI Fashion Assistant's performance and customer insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Total Chats</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MdChat className="text-xl" /></div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{data.overview.totalConversations}</p>
          <p className="text-[12px] text-green-600 font-bold mt-2">+14% from last week</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">AI Sales (Tk)</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><MdOutlineShoppingBag className="text-xl" /></div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">৳ {data.overview.aiAssistedSales.toLocaleString()}</p>
          <p className="text-[12px] text-green-600 font-bold mt-2">Driven by AI recommendations</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Conversion</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><MdShowChart className="text-xl" /></div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{data.overview.conversionRate}</p>
          <p className="text-[12px] text-gray-500 font-medium mt-2">Avg time: {data.overview.avgEngagementTime}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">Feedback</h3>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><MdThumbUp className="text-xl" /></div>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{data.overview.feedbackScore}</p>
          <p className="text-[12px] text-gray-500 font-medium mt-2">Customer satisfaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-[15px] font-bold text-gray-900 mb-6 uppercase tracking-wide">AI Sales Funnel</h2>
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div><span className="text-xs font-bold inline-block text-gray-700">Opened Chat</span></div>
                <div className="text-right"><span className="text-xs font-bold inline-block text-gray-900">{data.funnelData.openedChat}</span></div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div><span className="text-xs font-bold inline-block text-gray-700">Clicked AI Link</span></div>
                <div className="text-right"><span className="text-xs font-bold inline-block text-gray-900">{data.funnelData.clickedProduct}</span></div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                <div style={{ width: `${(data.funnelData.clickedProduct/data.funnelData.openedChat)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
              </div>
            </div>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div><span className="text-xs font-bold inline-block text-gray-700">Added to Cart</span></div>
                <div className="text-right"><span className="text-xs font-bold inline-block text-gray-900">{data.funnelData.addedToCart}</span></div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                <div style={{ width: `${(data.funnelData.addedToCart/data.funnelData.openedChat)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
              </div>
            </div>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div><span className="text-xs font-bold inline-block text-gray-700">Purchased</span></div>
                <div className="text-right"><span className="text-xs font-bold inline-block text-gray-900">{data.funnelData.purchased}</span></div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                <div style={{ width: `${(data.funnelData.purchased/data.funnelData.openedChat)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-[15px] font-bold text-gray-900 mb-4 uppercase tracking-wide">Top Queries</h2>
            <ul className="divide-y divide-gray-100">
              {data.topQueries.map((q, i) => (
                <li key={i} className="py-3 flex justify-between items-center">
                  <span className="text-[13px] text-gray-700 font-medium">"{q.query}"</span>
                  <span className="text-[12px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold">{q.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
            <h2 className="text-[15px] font-bold text-red-600 mb-4 uppercase tracking-wide flex items-center gap-2">
              <MdWarning /> Missed Opportunities
            </h2>
            <p className="text-[12px] text-gray-500 mb-3">Queries AI couldn't fulfill (Out of stock / Unknown)</p>
            <ul className="divide-y divide-gray-100">
              {data.unansweredQueries.map((q, i) => (
                <li key={i} className="py-3 flex justify-between items-center">
                  <span className="text-[13px] text-gray-700 font-medium">"{q.query}"</span>
                  <span className="text-[12px] bg-red-50 text-red-600 px-2 py-1 rounded font-bold">{q.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-[15px] font-bold text-gray-900 uppercase tracking-wide">Recent AI Chat Logs</h2>
          <button 
            onClick={() => navigate('/admin/ai-logs')} 
            className="text-[13px] font-bold text-blue-600 hover:underline"
          >
            View Full Logs
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          {data.recentChats && data.recentChats.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Customer Message</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">AI Response</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentChats.map((chat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-[13px] font-bold text-gray-900">{chat.user}</td>
                    <td className="px-6 py-4 text-[13px] text-gray-700 italic">"{chat.message}"</td>
                    <td className="px-6 py-4 text-[13px] text-gray-600 line-clamp-1">{chat.ai_response}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[11px] font-bold uppercase rounded ${chat.status === 'Converted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {chat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-gray-500 font-medium">{chat.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-10 text-center text-gray-500 text-[14px]">
              No chat logs available yet. Go to the storefront and send a message to the AI Stylist!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminAIDashboard;