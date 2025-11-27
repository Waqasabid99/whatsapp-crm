import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const donutData = [
  { name: "Active", value: 65, color: "#3AB8BD" },
  { name: "Pending", value: 20, color: "#2A96D1" },
  { name: "Failed", value: 15, color: "#ff6b6b" },
];

const lineData = [
  { name: "Mon", messages: 120 },
  { name: "Tue", messages: 240 },
  { name: "Wed", messages: 180 },
  { name: "Thu", messages: 300 },
  { name: "Fri", messages: 200 },
  { name: "Sat", messages: 350 },
  { name: "Sun", messages: 400 },
];

const HomeCards = () => {
  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* DONUT CHART CARD */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          User Activity Breakdown
        </h2>

        <div className="w-full h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINE GRAPH CARD */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Weekly Message Analytics
        </h2>

        <div className="w-full h-64">
          <ResponsiveContainer>
            <LineChart data={lineData}>
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#2A96D1"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default HomeCards;