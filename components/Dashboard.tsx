import React from "react";
import { DailyStats, Attendance, Employee } from "../types";
import {
  Users,
  UserCheck,
  UserMinus,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { formatDateTime } from "../utils/timeUtils";

interface DashboardProps {
  stats: DailyStats;
  recentActivity: {
    employeeName: string;
    time: string;
    type: "in" | "out";
  }[];
  lateEmployees: { name: string; time: string }[];
}

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  colorClass,
  bgClass,
}: any) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${bgClass} ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({
  stats,
  recentActivity,
  lateEmployees,
}) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng nhân sự"
          value={stats.totalEmployees}
          icon={Users}
          bgClass="bg-blue-50"
          colorClass="text-blue-600"
          subtext="Nhân viên trong hệ thống"
        />
        <StatCard
          title="Hiện diện"
          value={`${stats.present}/${stats.totalEmployees}`}
          icon={UserCheck}
          bgClass="bg-emerald-50"
          colorClass="text-emerald-600"
          subtext={`Vắng ${stats.totalEmployees - stats.present} người`}
        />
        <StatCard
          title="Đi trễ hôm nay"
          value={stats.late}
          icon={AlertTriangle}
          bgClass="bg-orange-50"
          colorClass="text-orange-600"
          subtext="Check-in sau 09:00"
        />
        <StatCard
          title="Đã ra về"
          value={stats.checkedOut}
          icon={UserMinus}
          bgClass="bg-purple-50"
          colorClass="text-purple-600"
          subtext={`Còn ${stats.working} người đang làm`}
        />
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
              Hoạt động gần đây
            </h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                Chưa có hoạt động nào
              </div>
            ) : (
              recentActivity.map((act, idx) => (
                <div
                  key={idx}
                  className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        act.type === "in" ? "bg-emerald-500" : "bg-purple-500"
                      }`}
                    ></div>
                    <span className="font-medium text-gray-700">
                      {act.employeeName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`text-xs px-2 py-1 rounded border ${
                        act.type === "in"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-purple-50 text-purple-700 border-purple-100"
                      }`}
                    >
                      {act.type === "in" ? "Check-in" : "Check-out"}
                    </span>
                    <span className="text-sm font-mono text-gray-500">
                      {formatDateTime(act.time)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Late List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-orange-50/30">
            <h3 className="font-bold text-gray-800 flex items-center text-orange-700">
              <Clock className="w-5 h-5 mr-2" />
              Danh sách đi trễ
            </h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
            {lateEmployees.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                Hôm nay không có ai đi trễ!
              </div>
            ) : (
              lateEmployees.map((emp, idx) => (
                <div
                  key={idx}
                  className="px-6 py-3 flex items-center justify-between hover:bg-orange-50/20"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {emp.name}
                  </span>
                  <span className="text-xs font-mono text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    {formatDateTime(emp.time)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
