export interface Employee {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface Attendance {
  id: string;
  employee_id: string;
  date: string; // YYYY-MM-DD
  check_in_time: string | null; // ISO Timestamp
  check_out_time: string | null; // ISO Timestamp
  note: string | null;
  status: AttendanceStatus;
  created_at: string;
}

export interface DailyStats {
  totalEmployees: number;
  present: number;
  checkedOut: number;
  working: number;
  late: number;
}

export type ViewMode = 'dashboard' | 'attendance';
export type AttendanceTab = 'checkin' | 'checkout' | 'all';
