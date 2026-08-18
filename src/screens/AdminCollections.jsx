import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MdDelete, MdEdit } from 'react-icons/md';

const AdminCollections = () => {
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCollections = async () => {
    try {
      const { data } = await axios.get('/api/collections');
      setCollections(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const createHandler = async (e) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('/api/collections', { name }, config);
      setName('');
      fetchCollections();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating collection');
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/collections/${id}`, config);
        fetchCollections();
      } catch (err) {
        alert('Error deleting collection');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Collections</h1>
      
      <form onSubmit={createHandler} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
        <div className="flex-1">
          <label className="block text-[12px] sm:text-[13px] font-semibold text-gray-700 mb-1.5 sm:mb-2">Collection Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full px-4 py-2.5 sm:py-2 border border-gray-300 rounded-md text-[14px] focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
            placeholder="e.g. Summer Collection 2026"
          />
        </div>
        <button type="submit" disabled={loading} className="w-full sm:w-auto bg-gray-900 text-white px-6 py-3 sm:py-2.5 rounded-md text-[13px] font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-colors">
          {loading ? 'Creating...' : 'Create Collection'}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-[12px] sm:text-[13px] font-bold text-gray-500 uppercase tracking-wider">Collection Name</th>
                <th className="px-4 py-3 sm:px-6 sm:py-4 text-[12px] sm:text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {collections.map((col) => (
                <tr key={col._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-[13px] sm:text-[14px] text-gray-900">{col.name}</td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4 text-right flex justify-end gap-3 sm:gap-4">
                    <Link to={`/admin/collections/${col._id}`} className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 rounded-md transition-colors">
                      <MdEdit className="text-lg sm:text-xl" />
                    </Link>
                    <button onClick={() => deleteHandler(col._id)} className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 rounded-md transition-colors">
                      <MdDelete className="text-lg sm:text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr><td colSpan="2" className="px-6 py-10 text-center text-[13px] sm:text-[14px] text-gray-500">No collections found. Create one above!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCollections;