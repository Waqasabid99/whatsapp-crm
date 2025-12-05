import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Edit2, Search, Trash } from 'lucide-react';
import { backendUrl, tableHeaders } from '../../utils/constants';
import axios from 'axios';
import AddStaffModal from '../components/Agents/CreateAgent';
import { useParams } from 'react-router-dom';
import Loader from '../../utils/LoadingPage';
import Fuse from 'fuse.js';
import { toast, ToastContainer } from 'react-toastify';
import EditStaffModal from '../components/Agents/EditAgent';
import DeleteStaffModal from '../components/Agents/DeleteAgent';

const Agents = () => {
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTable, setRefreshTable] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStaff = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backendUrl}/staff/all-staff`, { withCredentials: true });
      setStaffMembers(data.staff);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch staff members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getStaff();
  }, [refreshTable]);

  const getStatusBadge = (status) => {
    const colors = {
      online: 'bg-green-100 text-green-700',
      away: 'bg-yellow-100 text-yellow-700',
      busy: 'bg-red-100 text-red-700',
      offline: 'bg-gray-100 text-gray-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    );
  };

  const handleEdit = async (user) => {
    setSelectedStaff(user);
    setShowEditModal(true);
  }

  const deleteStaff = async (staff) => {
    setSelectedStaff(staff);
    setShowDeleteModal(true);
  }

  // Memoize Fuse instance
  const fuse = useMemo(() => new Fuse(staffMembers, { keys: ['user.name', 'user.email'], threshold: 0.3 }), [staffMembers]);

  // Combine search + filterStatus
  const filteredAgents = useMemo(() => {
    let results = staffMembers;

    if (debouncedQuery) {
      results = fuse.search(debouncedQuery).map(r => r.item);
    }

    if (filterStatus !== 'all') {
      results = results.filter(agent => agent.user.status === filterStatus);
    }

    return results;
  }, [debouncedQuery, filterStatus, staffMembers, fuse]);

  // Memoize stats
  const stats = useMemo(() => ({
    total: staffMembers.length,
    online: staffMembers.filter(a => a.user.status === 'online').length,
    offline: staffMembers.filter(a => a.user.status === 'offline').length,
  }), [staffMembers]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {isLoading ? <Loader /> : (
        <div className="mx-auto">
          <ToastContainer />
          {/* Header */}
          <div className="mb-6 flex justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Agents Dashboard</h1>
              <p className="text-gray-600">Monitor and manage your support team in real-time</p>
            </div>
            <div className='flex gap-3 items-center'>
              <button onClick={getStaff} className='btn-secondary'>Refresh</button>
              <button onClick={() => setShowModal(true)} className='btn-primary'>Add Agent</button>
            </div>
          </div>

          {showModal && (
            <AddStaffModal onClose={() => setShowModal(false)} workspaceId={id} refreshTable={setRefreshTable} />
          )}

          {showEditModal && (
            <EditStaffModal onClose={() => setShowEditModal(false)} user={selectedStaff} refreshTable={setRefreshTable} />
          )}

          {showDeleteModal && (
            <DeleteStaffModal onClose={() => setShowDeleteModal(false)} staff={selectedStaff} refreshTable={setRefreshTable} />
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="text-sm text-gray-600 mb-1">Total Agents</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="text-sm text-gray-600 mb-1">Online</div>
              <div className="text-2xl font-bold text-green-600">{stats.online}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
              <div className="text-sm text-gray-600 mb-1">Offline</div>
              <div className="text-2xl font-bold text-gray-600">{stats.offline}</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Agents
                </button>
                <button
                  onClick={() => setFilterStatus('online')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterStatus === 'online' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Online
                </button>
                <button
                  onClick={() => setFilterStatus('offline')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterStatus === 'offline' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Offline
                </button>
              </div>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Agents Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {tableHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAgents.map(({ user }) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">{user.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-gray-900">{user.activeChats}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-gray-700">{user.totalChats}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(user)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button onClick={() => deleteStaff(user)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <Trash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600">No agents found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;