import { initialAgents, tableHeaders } from "../../../utils/constants";
import { MoreVertical, MessageSquare, Clock, Edit2 } from "lucide-react";

const AgentsTable = () => {
  const getStatusBadge = (status) => {
    const colors = {
      online: "bg-green-100 text-green-700",
      away: "bg-yellow-100 text-yellow-700",
      busy: "bg-red-100 text-red-700",
      offline: "bg-gray-100 text-gray-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };
  return (
    <div className="bg-white my-4 w-full rounded-lg shadow overflow-hidden">
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
          {initialAgents.map((agent) => (
            <tbody className="divide-y divide-gray-200">
              <tr key={agent.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {agent.avatar}
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(
                          agent.status
                        )} rounded-full border-2 border-white`}
                      ></div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {agent.name}
                      </div>
                      <div className="text-sm text-gray-500">{agent.email}</div>
                      <div className="text-xs text-gray-400">{agent.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(agent.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-900">
                      {agent.activeChats}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-700">{agent.totalChats}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {agent.avgResponseTime}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="font-semibold text-gray-900">
                        {agent.satisfaction}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {agent.lastActive}
                  </span>
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
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
};

export default AgentsTable;