import React, { useState } from "react";
import { Employee, Attendance, AttendanceTab } from "../types";
import { formatDateTime } from "../utils/timeUtils";
import {
  LogIn,
  LogOut,
  CheckCircle2,
  Search,
  Filter,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";

interface AttendanceTableProps {
  employees: Employee[];
  attendances: Attendance[];
  onCheckIn: (employeeId: string) => void;
  onCheckOut: (attendanceId: string) => void;
  onUpdateNote: (attendanceId: string, note: string) => void;
  onViewDetail: (employee: Employee) => void;
  isHistoryView: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  employees,
  attendances,
  onCheckIn,
  onCheckOut,
  onUpdateNote,
  onViewDetail,
  isHistoryView,
}) => {
  const [activeTab, setActiveTab] = useState<AttendanceTab>("checkin");
  const [searchTerm, setSearchTerm] = useState("");

  // FILTER LOGIC
  const getFilteredData = () => {
    let filtered = employees;

    // 1. Search Filter
    if (searchTerm) {
      filtered = filtered.filter((e) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Tab Filter
    if (activeTab === "checkin") {
      // Show ONLY those who have NOT checked in yet
      return filtered.filter(
        (e) => !attendances.find((a) => a.employee_id === e.id)?.check_in_time
      );
    }

    if (activeTab === "checkout") {
      // Show ONLY those who HAVE checked in but NOT checked out
      return filtered.filter((e) => {
        const att = attendances.find((a) => a.employee_id === e.id);
        return att?.check_in_time && !att.check_out_time;
      });
    }

    // Tab 'all' - Show everyone
    return filtered;
  };

  const filteredEmployees = getFilteredData();

  // COPY TO CLIPBOARD LOGIC
  const handleCopyToClipboard = () => {
    if (filteredEmployees.length === 0) {
      toast.error("Không có dữ liệu để sao chép");
      return;
    }

    // Lấy ngày hiện tại làm tiêu đề báo cáo
    const todayStr = new Date().toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    let text = `📅 *BÁO CÁO CHẤM CÔNG (${todayStr})*\n`;

    // Thêm ngữ cảnh của Tab hiện tại vào tiêu đề
    if (activeTab === "checkin") text += `(Danh sách chưa đến)\n`;
    else if (activeTab === "checkout") text += `(Danh sách đang làm việc)\n`;

    text += `--------------------------------\n`;

    filteredEmployees.forEach((emp, index) => {
      const att = attendances.find((a) => a.employee_id === emp.id);
      const idx = index + 1;

      // Format: 1. Tên Nhân Viên
      let line = `${idx}. ${emp.name}`;

      if (!att?.check_in_time) {
        // Chưa check-in
        line += `: ❌ Chưa đến`;
      } else {
        // Đã check-in
        const checkInDate = new Date(att.check_in_time);

        // Lấy ngày tháng (dd/mm)
        const dateStr = checkInDate.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });

        // Lấy giờ phút gọn gàng (HH:mm)
        const inTime = checkInDate.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        let outTime = "...";
        if (att.check_out_time) {
          outTime = new Date(att.check_out_time).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }

        // 1. Nguyễn Văn A: 26/10 08:00 - 17:30
        line += `: ${dateStr} ${inTime} - ${outTime}`;

        // Thêm trạng thái nếu cần
        if (att.status === "late") line += ` (Trễ)`;
        if (att.note) line += ` [${att.note}]`;
      }

      text += line + "\n";
    });

    // Footer tổng kết
    const presentCount = filteredEmployees.filter(
      (e) => attendances.find((a) => a.employee_id === e.id)?.check_in_time
    ).length;
    text += `--------------------------------\n`;
    text += `Tổng cộng: ${filteredEmployees.length} nhân viên (Có mặt: ${presentCount})`;

    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Đã sao chép danh sách vào bộ nhớ tạm!"))
      .catch(() => toast.error("Lỗi khi sao chép"));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-220px)]">
      {/* Controls Header */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 bg-gray-50/50">
        {/* Tabs */}
        <div className="flex bg-gray-200/80 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("checkin")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "checkin"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Chưa đến
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full border border-gray-200">
              {
                employees.filter(
                  (e) =>
                    !attendances.find((a) => a.employee_id === e.id)
                      ?.check_in_time
                ).length
              }
            </span>
          </button>
          <button
            onClick={() => setActiveTab("checkout")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "checkout"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Đang làm
            <span className="ml-2 bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full border border-indigo-200">
              {
                employees.filter((e) => {
                  const att = attendances.find((a) => a.employee_id === e.id);
                  return att?.check_in_time && !att.check_out_time;
                }).length
              }
            </span>
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Tất cả
          </button>
        </div>

        {/* Right Controls: Search & Copy */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Copy Button */}
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center justify-center p-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
            title="Sao chép danh sách hiển thị để gửi Zalo"
          >
            <Copy className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-3 font-medium">Nhân viên</th>
              <th className="px-6 py-3 font-medium">Trạng thái</th>
              <th className="px-6 py-3 font-medium text-center">
                Thời gian vào
              </th>
              <th className="px-6 py-3 font-medium text-center">
                Thời gian ra
              </th>
              <th className="px-6 py-3 font-medium">Ghi chú</th>
              <th className="px-6 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-400 flex flex-col items-center justify-center"
                >
                  <Filter className="w-8 h-8 mb-2 opacity-20" />
                  Không tìm thấy nhân viên nào trong danh sách này
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => {
                const attendance = attendances.find(
                  (a) => a.employee_id === employee.id
                );
                const isPresent = !!attendance?.check_in_time;
                const isDone = !!attendance?.check_out_time;

                return (
                  <tr
                    key={employee.id}
                    className="bg-white hover:bg-gray-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => onViewDetail(employee)}
                      >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm mr-3">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {employee.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.phone || "---"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {!isPresent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Chưa đến
                        </span>
                      ) : isDone ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Hoàn thành
                        </span>
                      ) : attendance?.status === "late" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Đi trễ
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Đúng giờ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-gray-600">
                      {formatDateTime(attendance?.check_in_time || null)}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-xs text-gray-600">
                      {formatDateTime(attendance?.check_out_time || null)}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        defaultValue={attendance?.note || ""}
                        placeholder="Thêm ghi chú..."
                        onBlur={(e) => {
                          if (
                            attendance &&
                            e.target.value !== attendance.note
                          ) {
                            onUpdateNote(attendance.id, e.target.value);
                            toast.success("Đã lưu ghi chú");
                          }
                        }}
                        disabled={isHistoryView}
                        className="w-full bg-transparent border-b border-transparent focus:border-indigo-300 focus:ring-0 text-sm py-1 px-0 transition-colors placeholder-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isHistoryView && (
                        <>
                          {!isPresent ? (
                            <button
                              onClick={() => onCheckIn(employee.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-95"
                            >
                              <LogIn className="w-3 h-3 mr-1.5" /> Check In
                            </button>
                          ) : !isDone ? (
                            <button
                              onClick={() =>
                                attendance && onCheckOut(attendance.id)
                              }
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"
                            >
                              <LogOut className="w-3 h-3 mr-1.5" /> Check Out
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs flex items-center justify-end">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />{" "}
                              Xong
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
