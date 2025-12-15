import React from 'react';
import { X, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Employee, Attendance } from '../types';
import { formatTime, calculateDuration } from '../utils/timeUtils';

interface EmployeeDetailModalProps {
  employee: Employee;
  history: Attendance[];
  onClose: () => void;
}

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({ employee, history, onClose }) => {
  // Calculate quick stats for this employee
  const totalDays = history.length;
  const lateDays = history.filter(h => h.status === 'late').length;
  const onTimeDays = history.filter(h => h.status === 'present').length;
  
  // Sort history by date descending
  const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl border-2 border-white shadow-sm">
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{employee.name}</h3>
              <p className="text-sm text-gray-500">{employee.email || 'Chưa cập nhật email'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Personal Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-gray-100">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
            <span className="block text-2xl font-bold text-blue-700">{totalDays}</span>
            <span className="text-xs text-blue-600 uppercase font-medium">Ngày công</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
            <span className="block text-2xl font-bold text-emerald-700">{onTimeDays}</span>
            <span className="text-xs text-emerald-600 uppercase font-medium">Đúng giờ</span>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-center">
            <span className="block text-2xl font-bold text-orange-700">{lateDays}</span>
            <span className="text-xs text-orange-600 uppercase font-medium">Đi trễ</span>
          </div>
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 font-medium">Ngày</th>
                <th className="px-6 py-3 font-medium">Giờ vào</th>
                <th className="px-6 py-3 font-medium">Giờ ra</th>
                <th className="px-6 py-3 font-medium">Tổng giờ</th>
                <th className="px-6 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Chưa có dữ liệu chấm công
                  </td>
                </tr>
              ) : (
                sortedHistory.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-800 flex items-center">
                      <Calendar className="w-3 h-3 mr-2 text-gray-400" />
                      {record.date}
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-600">
                      {formatTime(record.check_in_time)}
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-600">
                      {formatTime(record.check_out_time)}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {calculateDuration(record.check_in_time, record.check_out_time)}
                    </td>
                    <td className="px-6 py-3">
                      {record.status === 'late' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <AlertCircle className="w-3 h-3 mr-1" /> Đi trễ
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Đúng giờ
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;