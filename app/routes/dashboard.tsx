import type { Route } from "./+types/dashboard";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const stats = [
  {
    name: "Total Users",
    value: "12,345",
    change: "+12.5%",
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-900/30",
  },
  {
    name: "Revenue",
    value: "$45,231",
    change: "+8.2%",
    icon: DollarSign,
    color: "text-[#76b900]",
    bgColor: "bg-[#76b900]/20",
  },
  {
    name: "Orders",
    value: "1,234",
    change: "+5.3%",
    icon: ShoppingCart,
    color: "text-purple-400",
    bgColor: "bg-purple-900/30",
  },
  {
    name: "Growth",
    value: "23.4%",
    change: "+2.1%",
    icon: TrendingUp,
    color: "text-orange-400",
    bgColor: "bg-orange-900/30",
  },
];

const chartData = [
  { name: "Jan", users: 4000, revenue: 2400 },
  { name: "Feb", users: 3000, revenue: 1398 },
  { name: "Mar", users: 2000, revenue: 9800 },
  { name: "Apr", users: 2780, revenue: 3908 },
  { name: "May", users: 1890, revenue: 4800 },
  { name: "Jun", users: 2390, revenue: 3800 },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Triton Studio" },
    { name: "description", content: "Triton Studio Dashboard" },
  ];
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-100">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-400">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-[#121212] rounded-lg shadow-sm border border-[#2a2a2a] p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      {stat.name}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-100">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-[#76b900]">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div
                    className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-[#121212] rounded-lg shadow-sm border border-[#2a2a2a] p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">
              User Growth
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f3f4f6' }} />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#76b900"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-[#121212] rounded-lg shadow-sm border border-[#2a2a2a] p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">
              Revenue Overview
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', color: '#f3f4f6' }} />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Bar dataKey="revenue" fill="#76b900" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

