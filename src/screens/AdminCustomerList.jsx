import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { MdSearch, MdDelete, MdCheckCircle, MdPerson } from 'react-icons/md';

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

  // ==========================================
  // IMPORT CSV LOGIC (Basic)
  // ==========================================
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
    <div className="min-h-screen bg-[#f1f2f4] p-4 md:p-14 -mx-4 md:-mx-8 -my-4 md:-my-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl font-bold text-gray-900">Customers</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="text-[13px] font-medium text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-300 bg-white shadow-sm transition-colors">
            Export
          </button>
          
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleImportCSV} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="text-[13px] font-medium text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-300 bg-white shadow-sm transition-colors">
            Import
          </button>

          <button onClick={() => navigate('/admin/customers/create')} className="bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-medium px-4 py-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1 ml-2">
            Add customer
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-2 border-b border-gray-200 flex items-center gap-2">
          <div className="flex items-center px-3 py-1.5 rounded-md bg-gray-100">
            <span className="text-[13px] font-medium text-gray-700">All customers</span>
          </div>
          <div className="flex-1 ml-2 relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input 
              type="text" 
              placeholder="Search customers by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-gray-100/50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-lg text-[14px] text-gray-900 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading customers...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-4 py-3 text-[13px] font-medium text-gray-700 pl-6">Customer Name</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-gray-700">Email Address</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-gray-700 text-center">Admin Role</th>
                  <th className="px-4 py-3 text-[13px] font-medium text-gray-700 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user._id} 
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/admin/customers/${user._id}/edit`)}
                  >
                    <td className="px-4 py-3 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[14px] font-semibold text-gray-900 group-hover:underline">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[14px] text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[12px] font-medium bg-green-100 text-green-800 border border-green-200">
                          <MdCheckCircle /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[12px] font-medium bg-gray-100 text-gray-600 border border-gray-300">
                           Customer
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right pr-6">
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteHandler(user._id, user.name); }}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <MdDelete className="text-xl" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomerList;