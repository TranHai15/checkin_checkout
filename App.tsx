import React, { useEffect, useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  supabase,
  supabaseUrl,
  TABLE_ATTENDANCE,
  TABLE_EMPLOYEES,
} from "./lib/supabase";
import { Employee, Attendance, DailyStats, ViewMode } from "./types";
import { getTodayString, calculateStatus } from "./utils/timeUtils";
import Header from "./components/Header";
import EmployeeForm from "./components/EmployeeForm";
import { Download, RefreshCw } from "lucide-react";
import Dashboard from "./components/Dashboard";
import AttendanceTable from "./components/AttendanceTable";
import EmployeeDetailModal from "./components/EmployeeDetailModal";

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Navigation & Modal State
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [employeeHistory, setEmployeeHistory] = useState<Attendance[]>([]);

  const isToday = selectedDate === getTodayString();

  // 1. Initial Data Load & Date Change
  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // 2. Realtime Subscription (Live Updates)
  useEffect(() => {
    const channel = supabase
      .channel("realtime_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: TABLE_ATTENDANCE },
        (payload) => {
          // Khi có thay đổi từ DB, cập nhật lại UI ngay lập tức
          if (payload.eventType === "INSERT") {
            const newRecord = payload.new as Attendance;
            if (newRecord.date === selectedDate) {
              setAttendances((prev) => [...prev, newRecord]);
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedRecord = payload.new as Attendance;
            if (updatedRecord.date === selectedDate) {
              setAttendances((prev) =>
                prev.map((a) => (a.id === updatedRecord.id ? updatedRecord : a))
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  // 3. Fetch History for Specific Employee when Modal Opens
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedEmployee) return;

      const { data, error } = await supabase
        .from(TABLE_ATTENDANCE)
        .select("*")
        .eq("employee_id", selectedEmployee.id)
        .order("date", { ascending: false }); // Mới nhất lên đầu

      if (!error && data) {
        setEmployeeHistory(data);
      }
    };

    fetchHistory();
  }, [selectedEmployee]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (supabaseUrl.includes("your-project.supabase.co")) {
        console.warn("Supabase URL chưa được cấu hình đúng.");
      }

      // 1. Get Employees
      const { data: empData, error: empError } = await supabase
        .from(TABLE_EMPLOYEES)
        .select("*")
        .order("name");

      if (empError) throw empError;
      setEmployees(empData || []);

      // 2. Get Attendance for SELECTED DATE only
      const { data: attData, error: attError } = await supabase
        .from(TABLE_ATTENDANCE)
        .select("*")
        .eq("date", selectedDate);

      if (attError) throw attError;
      setAttendances(attData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi tải dữ liệu từ server");
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleAddEmployee = async (
    name: string,
    email: string,
    phone: string
  ) => {
    try {
      const { data, error } = await supabase
        .from(TABLE_EMPLOYEES)
        .insert([{ name, email: email || null, phone: phone || null }])
        .select()
        .single();

      if (error) throw error;
      setEmployees((prev) => [...prev, data]);
      return true;
    } catch (error: any) {
      toast.error("Lỗi thêm nhân viên: " + error.message);
      return false;
    }
  };

  const handleCheckIn = async (employeeId: string) => {
    if (!isToday) {
      toast.error("Chỉ được phép Check-in cho ngày hôm nay!");
      return;
    }

    const now = new Date();
    const status = calculateStatus(now);

    // Optimistic Update (Cập nhật UI trước khi server trả về để cảm giác nhanh hơn)
    const tempId = crypto.randomUUID();
    const newRecord: Attendance = {
      id: tempId,
      employee_id: employeeId,
      date: selectedDate,
      check_in_time: now.toISOString(),
      check_out_time: null,
      note: "",
      status: status,
      created_at: now.toISOString(),
    };
    setAttendances((prev) => [...prev, newRecord]);

    try {
      const { data, error } = await supabase
        .from(TABLE_ATTENDANCE)
        .insert([
          {
            employee_id: employeeId,
            date: selectedDate,
            check_in_time: now.toISOString(),
            status: status,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      // Replace temp record with real record from DB
      setAttendances((prev) => prev.map((a) => (a.id === tempId ? data : a)));
      toast.success("Check-in thành công!");
    } catch (error: any) {
      toast.error("Lỗi check-in: " + error.message);
      setAttendances((prev) => prev.filter((a) => a.id !== tempId)); // Revert if fail
    }
  };

  const handleCheckOut = async (attendanceId: string) => {
    if (!isToday) {
      toast.error("Chỉ được phép thao tác cho ngày hôm nay!");
      return;
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // Optimistic Update
    setAttendances((prev) =>
      prev.map((a) =>
        a.id === attendanceId ? { ...a, check_out_time: nowIso } : a
      )
    );

    try {
      const { error } = await supabase
        .from(TABLE_ATTENDANCE)
        .update({ check_out_time: nowIso })
        .eq("id", attendanceId);

      if (error) throw error;
      toast.success("Check-out thành công!");
    } catch (error: any) {
      toast.error("Lỗi check-out: " + error.message);
      fetchData(); // Reload data to be safe
    }
  };

  const handleUpdateNote = async (attendanceId: string, note: string) => {
    // Update local UI
    setAttendances((prev) =>
      prev.map((a) => (a.id === attendanceId ? { ...a, note } : a))
    );

    try {
      const { error } = await supabase
        .from(TABLE_ATTENDANCE)
        .update({ note })
        .eq("id", attendanceId);

      if (error) throw error;
    } catch (error: any) {
      console.error("Save note error", error);
      toast.error("Không thể lưu ghi chú");
    }
  };

  const handleRefresh = async () => {
    setSyncing(true);
    await fetchData();
    setTimeout(() => {
      setSyncing(false);
      toast.success("Dữ liệu đã được làm mới!");
    }, 500);
  };

  const handleExportCSV = () => {
    const headers = [
      "Tên NV",
      "Ngày",
      "Giờ vào",
      "Giờ ra",
      "Trạng thái",
      "Ghi chú",
    ];
    const rows = employees.map((emp) => {
      const att = attendances.find((a) => a.employee_id === emp.id);
      return [
        emp.name,
        selectedDate,
        att
          ? att.check_in_time
            ? new Date(att.check_in_time).toLocaleTimeString()
            : "--"
          : "--",
        att
          ? att.check_out_time
            ? new Date(att.check_out_time).toLocaleTimeString()
            : "--"
          : "--",
        att ? (att.status === "present" ? "Đúng giờ" : "Đi trễ") : "Vắng",
        att?.note || "",
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `diem_danh_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats Calculation
  const stats: DailyStats = useMemo(() => {
    const present = attendances.filter((a) => !!a.check_in_time).length;
    const checkedOut = attendances.filter((a) => !!a.check_out_time).length;
    const late = attendances.filter((a) => a.status === "late").length;
    return {
      totalEmployees: employees.length,
      present: present,
      checkedOut: checkedOut,
      working: present - checkedOut,
      late: late,
    };
  }, [employees.length, attendances]);

  // Generate Recent Activity
  const recentActivity = useMemo(() => {
    const activity = [];
    const sortedAtt = [...attendances].sort((a, b) => {
      const tA = new Date(a.check_in_time || 0).getTime();
      const tB = new Date(b.check_in_time || 0).getTime();
      return tB - tA;
    });

    for (const att of sortedAtt.slice(0, 5)) {
      const emp = employees.find((e) => e.id === att.employee_id);
      if (emp && att.check_in_time) {
        activity.push({
          employeeName: emp.name,
          time: att.check_in_time,
          type: "in" as const,
        });
      }
    }
    return activity;
  }, [attendances, employees]);

  const lateEmployees = useMemo(() => {
    return attendances
      .filter((a) => a.status === "late" && a.check_in_time)
      .map((a) => ({
        name: employees.find((e) => e.id === a.employee_id)?.name || "Unknown",
        time: a.check_in_time!,
      }));
  }, [attendances, employees]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Toaster position="top-right" />

      {/* Modal View Detail */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          history={employeeHistory}
          onClose={() => {
            setSelectedEmployee(null);
            setEmployeeHistory([]);
          }}
        />
      )}

      <Header
        currentDate={new Date(selectedDate)}
        currentView={currentView}
        onViewChange={setCurrentView}
        showHistory={showHistory}
        onToggleHistory={() => {
          const newState = !showHistory;
          setShowHistory(newState);
          setSelectedDate(newState ? selectedDate : getTodayString());
        }}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentView === "dashboard"
                ? "Tổng quan hệ thống"
                : showHistory
                ? `Lịch sử ngày ${selectedDate}`
                : "Quản lý chấm công"}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {showHistory && (
              <input
                type="date"
                value={selectedDate}
                max={getTodayString()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              />
            )}
            {!showHistory && <EmployeeForm onAddEmployee={handleAddEmployee} />}
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Loading Global */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* VIEW CONTENT */}
        {!loading &&
          (currentView === "dashboard" && !showHistory ? (
            <Dashboard
              stats={stats}
              recentActivity={recentActivity}
              lateEmployees={lateEmployees}
            />
          ) : (
            <AttendanceTable
              employees={employees}
              attendances={attendances}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onUpdateNote={handleUpdateNote}
              onViewDetail={(emp) => setSelectedEmployee(emp)}
              isHistoryView={showHistory || !isToday}
            />
          ))}
      </main>

      {/* Footer Refresh Button */}
      {!showHistory && (
        <footer className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-6">
          <button
            onClick={handleRefresh}
            disabled={syncing}
            className="flex items-center space-x-2 px-6 py-3 rounded-full text-white font-bold shadow-lg bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
          >
            {syncing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            <span>Làm mới dữ liệu</span>
          </button>
        </footer>
      )}
    </div>
  );
}

export default App;
