import React from 'react';
import { DailyStats } from '../types';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface StatsPanelProps {
  stats: DailyStats;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-gray-100 text-gray-600">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Tổng nhân viên</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Đã Check-in</p>
          <p className="text-2xl font-bold text-gray-800">{stats.present}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Đang làm việc</p>
          <p className="text-2xl font-bold text-gray-800">{stats.working}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Đã Check-out</p>
          <p className="text-2xl font-bold text-gray-800">{stats.checkedOut}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;