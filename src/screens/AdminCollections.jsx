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
    <div className="p-8 bg-[#f1f2f4] min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Collections</h1>
      
      <form onSubmit={createHandler} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Collection Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-900"
            placeholder="Enter collection name"
          />
        </div>
        <button type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-2 rounded font-bold uppercase tracking-widest hover:bg-black disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Collection'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-medium text-gray-600">Collection Name</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {collections.map((col) => (
              <tr key={col._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-900">{col.name}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-4">
                  <Link to={`/admin/collections/${col._id}`} className="text-blue-600 hover:text-blue-800 text-xl">
                    <MdEdit />
                  </Link>
                  <button onClick={() => deleteHandler(col._id)} className="text-red-500 hover:text-red-700 text-xl">
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr><td colSpan="2" className="px-6 py-8 text-center text-gray-500">No collections found. Create one above!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCollections;