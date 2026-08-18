import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdAttachMoney, MdLocalShipping, MdPeople, MdInventory } from 'react-icons/md';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/orders/summary', config);
        
        const formattedDailyOrders = data.dailyOrders.map(order => ({
          date: order._id,
          sales: order.sales
        }));

        setSummary({ ...data, dailyOrders: formattedDailyOrders });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching dashboard data');
        setLoading(false);
      }
    };

    fetchSummary();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Loading Dashboard...</div>;
  if (error) return <div className="min-h-screen p-8 text-red-600 text-center">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f1f2f4] p-4 md:p-14 -mx-4 md:-mx-8 -my-4 md:-my-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-[14px] text-gray-500 mt-1">Here's what's happening with your store today.</p>
        </div>

        {/* Stats Cards (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider">Total Sales</h2>
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <MdAttachMoney className="text-xl" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">${summary?.totalSales?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider">Total Orders</h2>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <MdLocalShipping className="text-xl" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.totalOrders || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider">Total Customers</h2>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                <MdPeople className="text-xl" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.totalUsers || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-gray-600 uppercase tracking-wider">Total Products</h2>
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                <MdInventory className="text-xl" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary?.totalProducts || 0}</p>
          </div>

        </div>

        {/* Sales Chart Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-[16px] font-bold text-gray-900 mb-6">Sales Performance (COD & All Orders)</h2>
          
          {summary?.dailyOrders && summary.dailyOrders.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.dailyOrders} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{fontSize: 12, fill: '#6b7280'}} axisLine={false} tickLine={false} dx={-10} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']}
                    labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              No paid sales data available for the chart yet.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;