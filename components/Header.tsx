import React from 'react';
import { Calendar, LayoutDashboard, Clock, History } from 'lucide-react';
import { formatDateDisplay } from '../utils/timeUtils';
import { ViewMode } from '../types';

interface HeaderProps {
  currentDate: Date;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  showHistory: boolean;
  onToggleHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentDate, 
  currentView, 
  onViewChange,
  showHistory, 
  onToggleHistory 
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-2 rounded-lg mr-3 shadow-sm">
              <Clock className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">HR System</h1>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Quản lý chấm công</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors
                ${currentView === 'dashboard' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('attendance')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors
                ${currentView === 'attendance' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Chấm công
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end">
             <span className="text-xs font-semibold text-gray-500 uppercase">
              {showHistory ? 'Lịch sử' : 'Hôm nay'}
            </span>
            <span className="text-sm font-bold text-gray-800">
              {formatDateDisplay(currentDate)}
            </span>
          </div>

          <button
            onClick={onToggleHistory}
            className={`p-2 rounded-full transition-colors border shadow-sm
              ${showHistory 
                ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            title={showHistory ? 'Quay lại hôm nay' : 'Xem lịch sử'}
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;