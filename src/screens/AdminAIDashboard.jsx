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

  if (loading) return <div className="min-h-full flex items-center justify-center py-20 text-gray-500 font-medium">Loading AI Intelligence...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold text-center">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdAutoAwesome className="text-purple-600 flex-shrink-0" /> AI Intelligence Dashboard
          </h1>
          <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">Monitor your AI Fashion Assistant's performance and customer insights.</p>
        </div>
      </div>


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-[10px] sm:text-[13px] font-bold text-gray-500 uppercase tracking-wider line-clamp-1">Total Chats</h3>
            <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0"><MdChat className="text-lg sm:text-xl" /></div>
          </div>
          <p className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-900">{data.overview.totalConversations}</p>
          <p className="text-[10px] sm:text-[12px] text-green-600 font-bold mt-1 sm:mt-2 truncate">+14% from last week</p>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-[10px] sm:text-[13px] font-bold text-gray-500 uppercase tracking-wider line-clamp-1">AI Sales</h3>
            <div className="p-1.5 sm:p-2 bg-green-50 text-green-600 rounded-lg flex-shrink-0"><MdOutlineShoppingBag className="text-lg sm:text-xl" /></div>
          </div>
          <p className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-900 truncate">৳ {data.overview.aiAssistedSales.toLocaleString()}</p>
          <p className="text-[10px] sm:text-[12px] text-green-600 font-bold mt-1 sm:mt-2 truncate">Driven by AI recommendations</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-[10px] sm:text-[13px] font-bold text-gray-500 uppercase tracking-wider line-clamp-1">Conversion</h3>
            <div className="p-1.5 sm:p-2 bg-purple-50 text-purple-600 rounded-lg flex-shrink-0"><MdShowChart className="text-lg sm:text-xl" /></div>
          </div>
          <p className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-900">{data.overview.conversionRate}</p>
          <p className="text-[10px] sm:text-[12px] text-gray-500 font-medium mt-1 sm:mt-2 truncate">Avg time: {data.overview.avgEngagementTime}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-[10px] sm:text-[13px] font-bold text-gray-500 uppercase tracking-wider line-clamp-1">Feedback</h3>
            <div className="p-1.5 sm:p-2 bg-yellow-50 text-yellow-600 rounded-lg flex-shrink-0"><MdThumbUp className="text-lg sm:text-xl" /></div>
          </div>
          <p className="text-lg sm:text-2xl md:text-3xl font-extrabold text-gray-900">{data.overview.feedbackScore}</p>
          <p className="text-[10px] sm:text-[12px] text-gray-500 font-medium mt-1 sm:mt-2 truncate">Customer satisfaction</p>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        

        <div className="lg:col-span-1 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-4 sm:mb-6 uppercase tracking-wide">AI Sales Funnel</h2>
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-1.5 sm:mb-2 items-center justify-between">
                <div><span className="text-[11px] sm:text-xs font-bold inline-block text-gray-700">Opened Chat</span></div>
                <div className="text-right"><span className="text-[11px] sm:text-xs font-bold inline-block text-gray-900">{data.funnelData.openedChat}</span></div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-1.5 sm:mb-2 items-center justify-between">
                <div><span className="text-[11px] sm:text-xs font-bold inline-block text-gray-700">Clicked AI Link</span></div>
                <div className="text-right"><span className="text-[11px] sm:text-xs font-bold inline-block text-gray-900">{data.funnelData.clickedProduct}</span></div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                <div style={{ width: `${(data.funnelData.clickedProduct/data.funnelData.openedChat)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
              </div>
            </div>

            <div className="relative pt-1">
              <div className="flex mb-1.5 sm:mb-2 items-center justify-between">
                <div><span className="text-[11px] sm:text-xs font-bold inline-block text-gray-700">Added to Cart</span></div>
                <div className="text-right"><span className="text-[11px] sm:text-xs font-bold inline-block text-gray-900">{data.funnelData.addedToCart}</span></div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                <div style={{ width: `${(data.funnelData.addedToCart/data.funnelData.openedChat)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div>
              </div>
            </div>

            <div className="relative pt-1">
              <div className="flex mb-1.5 sm:mb-2 items-center justify-between">
                <div><span className="text-[11px] sm:text-xs font-bold inline-block text-gray-700">Purchased</span></div>
                <div className="text-right"><span className="text-[11px] sm:text-xs font-bold inline-block text-gray-900">{data.funnelData.purchased}</span></div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                <div style={{ width: `${(data.funnelData.purchased/data.funnelData.openedChat)*100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-3 sm:mb-4 uppercase tracking-wide">Top Queries</h2>
            <ul className="divide-y divide-gray-100">
              {data.topQueries.map((q, i) => (
                <li key={i} className="py-2.5 sm:py-3 flex justify-between items-center gap-3">
                  <span className="text-[12px] sm:text-[13px] text-gray-700 font-medium line-clamp-1">"{q.query}"</span>
                  <span className="text-[11px] sm:text-[12px] bg-gray-100 text-gray-600 px-2 py-0.5 sm:py-1 rounded font-bold">{q.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-red-100">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-red-600 mb-2 sm:mb-4 uppercase tracking-wide flex items-center gap-2">
              <MdWarning className="flex-shrink-0" /> Missed Opportunities
            </h2>
            <p className="text-[11px] sm:text-[12px] text-gray-500 mb-2 sm:mb-3 leading-snug">Queries AI couldn't fulfill (Out of stock / Unknown)</p>
            <ul className="divide-y divide-gray-100">
              {data.unansweredQueries.map((q, i) => (
                <li key={i} className="py-2.5 sm:py-3 flex justify-between items-center gap-3">
                  <span className="text-[12px] sm:text-[13px] text-gray-700 font-medium line-clamp-1">"{q.query}"</span>
                  <span className="text-[11px] sm:text-[12px] bg-red-50 text-red-600 px-2 py-0.5 sm:py-1 rounded font-bold">{q.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>


      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center bg-[#fbfbfb]">
          <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900 uppercase tracking-wide">Recent AI Chat Logs</h2>
          <button 
            onClick={() => navigate('/admin/ai-logs')} 
            className="text-[12px] sm:text-[13px] font-bold text-blue-600 hover:underline"
          >
            View Full Logs
          </button>
        </div>
        
        {/* Table Wrapper for Horizontal Scrolling */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          {data.recentChats && data.recentChats.length > 0 ? (
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 text-[11px] sm:text-[12px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">User</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 text-[11px] sm:text-[12px] font-bold text-gray-500 uppercase tracking-wider">Customer Message</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 text-[11px] sm:text-[12px] font-bold text-gray-500 uppercase tracking-wider">AI Response</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 text-[11px] sm:text-[12px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3 text-[11px] sm:text-[12px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.recentChats.map((chat, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-[12px] sm:text-[13px] font-bold text-gray-900 whitespace-nowrap">{chat.user}</td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-[12px] sm:text-[13px] text-gray-700 italic min-w-[200px]">"{chat.message}"</td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-[12px] sm:text-[13px] text-gray-600 min-w-[250px] line-clamp-2">{chat.ai_response}</td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-[10px] sm:text-[11px] font-bold uppercase rounded ${chat.status === 'Converted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {chat.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 text-[11px] sm:text-[12px] text-gray-500 font-medium whitespace-nowrap">{chat.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 sm:p-10 text-center text-gray-500 text-[13px] sm:text-[14px]">
              No chat logs available yet. Go to the storefront and send a message to the AI Stylist!
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminAIDashboard;