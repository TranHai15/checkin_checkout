import React, { useState } from 'react';
import { Employee, Attendance } from '../types';
import { formatTime, calculateDuration } from '../utils/timeUtils';
import { LogIn, LogOut, Clock, User, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmployeeCardProps {
  employee: Employee;
  attendance: Attendance | undefined;
  onCheckIn: (employeeId: string) => void;
  onCheckOut: (attendanceId: string) => void;
  onUpdateNote: (attendanceId: string, note: string) => void;
  isHistoryView?: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  attendance, 
  onCheckIn, 
  onCheckOut,
  onUpdateNote,
  isHistoryView = false
}) => {
  const [note, setNote] = useState(attendance?.note || '');
  const [isNoteDirty, setIsNoteDirty] = useState(false);

  // Sync state note with props when props change (e.g. initial load or history switch)
  React.useEffect(() => {
    setNote(attendance?.note || '');
    setIsNoteDirty(false);
  }, [attendance]);

  const hasCheckedIn = !!attendance?.check_in_time;
  const hasCheckedOut = !!attendance?.check_out_time;

  const getStatusColor = () => {
    if (hasCheckedOut) return 'bg-[#3B82F6] border-[#3B82F6]'; // Hoàn thành (Blue)
    if (hasCheckedIn) return 'bg-[#10B981] border-[#10B981]'; // Đã check-in (Green)
    return 'bg-[#6B7280] border-[#6B7280]'; // Chưa check-in (Gray)
  };

  const getStatusText = () => {
    if (hasCheckedOut) return 'Đã hoàn thành';
    if (hasCheckedIn) return 'Đang làm việc';
    return 'Chưa điểm danh';
  };

  const handleNoteBlur = () => {
    if (attendance && isNoteDirty) {
      onUpdateNote(attendance.id, note);
      setIsNoteDirty(false);
      toast.success('Đã lưu ghi chú');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${getStatusColor()} transition-all hover:shadow-lg`}>
      {/* Header Card */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{employee.name}</h3>
            <p className="text-xs text-gray-500">{employee.email || 'No email'}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Time Info */}
      <div className="p-4 grid grid-cols-2 gap-4 bg-gray-50">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 flex items-center">
            <LogIn className="w-3 h-3 mr-1" /> Giờ vào
          </span>
          <span className={`font-mono font-medium ${hasCheckedIn ? 'text-gray-900' : 'text-gray-400'}`}>
            {formatTime(attendance?.check_in_time || null)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1 flex items-center">
            <LogOut className="w-3 h-3 mr-1" /> Giờ ra
          </span>
          <span className={`font-mono font-medium ${hasCheckedOut ? 'text-gray-900' : 'text-gray-400'}`}>
            {formatTime(attendance?.check_out_time || null)}
          </span>
        </div>
      </div>

      {/* Duration if completed */}
      {hasCheckedOut && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 text-center">
          <p className="text-xs text-blue-700 flex items-center justify-center">
            <Clock className="w-3 h-3 mr-1" />
            Tổng thời gian: <span className="font-bold ml-1">{calculateDuration(attendance?.check_in_time || null, attendance?.check_out_time || null)}</span>
          </p>
        </div>
      )}

      {/* Actions & Note */}
      <div className="p-4 space-y-3">
        {!isHistoryView && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onCheckIn(employee.id)}
              disabled={hasCheckedIn}
              className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors
                ${hasCheckedIn 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#10B981] text-white hover:bg-emerald-600 shadow-sm'}`}
            >
              <LogIn className="w-4 h-4 mr-2" /> Check In
            </button>
            
            <button
              onClick={() => attendance && onCheckOut(attendance.id)}
              disabled={!hasCheckedIn || hasCheckedOut}
              className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors
                ${!hasCheckedIn || hasCheckedOut 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#EF4444] text-white hover:bg-red-600 shadow-sm'}`}
            >
              <LogOut className="w-4 h-4 mr-2" /> Check Out
            </button>
          </div>
        )}

        <div className="relative">
          <textarea
            placeholder="Ghi chú (công tác, đi trễ...)"
            value={note}
            disabled={isHistoryView}
            onChange={(e) => {
              setNote(e.target.value);
              setIsNoteDirty(true);
            }}
            onBlur={handleNoteBlur}
            className="w-full text-sm border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
            rows={2}
          />
          {isNoteDirty && !isHistoryView && (
             <span className="absolute bottom-2 right-2 text-[10px] text-orange-500 flex items-center animate-pulse">
               <Save className="w-3 h-3 mr-1" /> Chưa lưu
             </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;