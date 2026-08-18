import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { MdSearch, MdDelete, MdCheckCircle, MdPerson, MdAdd } from 'react-icons/md';

const AdminCustomerList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/users', config);
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching customers');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  const deleteHandler = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer: ${name}?`)) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/users/${id}`, config);
        alert('Customer deleted successfully');
        fetchUsers(); 
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting customer');
      }
    }
  };

  const handleExportCSV = () => {
    const exportData = users.map(u => ({
      'Customer ID': u._id,
      'Name': u.name,
      'Email': u.email,
      'Role': u.isAdmin ? 'Admin' : 'Customer',
      'Registered At': u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'customers_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setLoading(true);
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

          const rows = results.data;
          
          for (const row of rows) {
            if(row.Name && row.Email) {
                await axios.post('/api/users', {
                    name: row.Name,
                    email: row.Email,
                    password: 'password123', 
                }, config);
            }
          }
          alert(`Customers imported successfully! Default password is 'password123'`);
          fetchUsers(); 
        } catch (error) {
          alert('Error importing customers. Emails must be unique.');
          setLoading(false);
        }
      }
    });
    e.target.value = null; 
  };

  const filteredUsers = users.filter((user) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-10">
      

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Customers</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={handleExportCSV} className="text-[12px] sm:text-[13px] font-medium text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm transition-colors">
            Export
          </button>
          
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="text-[12px] sm:text-[13px] font-medium text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg border border-gray-300 bg-white shadow-sm transition-colors">
            Import
          </button>

          <button 
            onClick={() => navigate('/admin/customers/create')} 
            className="bg-gray-900 hover:bg-black text-white text-[12px] sm:text-[13px] font-bold px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ml-auto sm:ml-0"
          >
            <MdAdd className="text-lg" /> Add customer
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        
        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-[#fbfbfb]">
          <div className="flex items-center px-3 py-1.5 rounded-md bg-gray-100 border border-gray-200 flex-shrink-0">
            <span className="text-[12px] sm:text-[13px] font-bold text-gray-700">All customers</span>
          </div>
          <div className="flex-1 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg sm:text-xl" />
            <input 
              type="text" 
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white hover:bg-gray-50 focus:bg-white border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 rounded-lg text-[13px] sm:text-[14px] text-gray-900 focus:outline-none transition-colors"
            />
          </div>
        </div>


        {loading ? (
          <div className="p-10 text-center text-gray-500 text-[14px] font-medium">Loading customers...</div>
        ) : (
          <>

            <div className="block md:hidden">
              <div className="flex flex-col divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <div 
                    key={user._id} 
                    className="p-4 flex flex-col gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/admin/customers/${user._id}/edit`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-[14px] border border-blue-100">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[14px] font-bold text-gray-900 line-clamp-1">{user.name}</span>
                           <span className="text-[12px] text-gray-500 line-clamp-1">{user.email}</span>
                        </div>
                      </div>
                      

                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteHandler(user._id, user.name); }}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <MdDelete className="text-xl" />
                      </button>
                    </div>

                    <div className="flex items-center pl-13 ml-[52px]">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                          <MdCheckCircle className="text-[12px]" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                           Customer
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Customer Details</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-center">Role</th>
                    <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user._id} 
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/admin/customers/${user._id}/edit`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-[14px] border border-blue-100">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[14px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user.name}</span>
                             <span className="text-[13px] text-gray-500">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                            <MdCheckCircle className="text-[14px]" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                             Customer
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteHandler(user._id, user.name); }}
                          className="text-gray-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete Customer"
                        >
                          <MdDelete className="text-xl" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-10 text-center text-gray-500 text-[13px]">No customers match your search.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCustomerList;