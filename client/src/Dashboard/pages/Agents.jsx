import { useState } from 'react';
import { MoreVertical, MessageSquare, Clock, Edit2 } from 'lucide-react';
import { backendUrl, initialAgents, tableHeaders } from '../../utils/constants';
import axios from 'axios';
const Agents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStaff = async () => {
    const { data } = await axios.get(`${backendUrl}/staff/all-staff`, { withCredentials: true });
    console.log(data)
    return data;
  }

  getStaff();

  const getStatusBadge = (status) => {
    const colors = {
      online: 'bg-green-100 text-green-700',
      away: 'bg-yellow-100 text-yellow-700',
      busy: 'bg-red-100 text-red-700',
      offline: 'bg-gray-100 text-gray-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredAgents = initialAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || agent.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: initialAgents.length,
    online: initialAgents.filter(a => a.status === 'online').length,
    away: initialAgents.filter(a => a.status === 'away').length,
    busy: initialAgents.filter(a => a.status === 'busy').length,
    offline: initialAgents.filter(a => a.status === 'offline').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agents Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your support team in real-time</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Total Agents</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Online</div>
            <div className="text-2xl font-bold text-green-600">{stats.online}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">Away</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.away}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">Busy</div>
            <div className="text-2xl font-bold text-red-600">{stats.busy}</div>
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
                  filterStatus === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Agents
              </button>
              <button
                onClick={() => setFilterStatus('online')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === 'online'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Online
              </button>
              <button
                onClick={() => setFilterStatus('away')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === 'away'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Away
              </button>
              <button
                onClick={() => setFilterStatus('busy')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === 'busy'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Busy
              </button>
              <button
                onClick={() => setFilterStatus('offline')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filterStatus === 'offline'
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                {tableHeaders.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                            {agent.avatar}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(agent.status)} rounded-full border-2 border-white`}></div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{agent.name}</div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                          <div className="text-xs text-gray-400">{agent.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(agent.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-gray-900">{agent.activeChats}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{agent.totalChats}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{agent.avgResponseTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="font-semibold text-gray-900">{agent.satisfaction}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{agent.lastActive}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
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

        {/* Footer Stats */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredAgents.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{initialAgents.length}</span> agents
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agents;