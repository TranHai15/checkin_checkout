export const formatDateDisplay = (date: Date): string => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${dayName}, ${d}/${m}/${y}`;
};

export const formatTime = (isoString: string | null): string => {
  if (!isoString) return '--:--:--';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '--:--:--';
  
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export const getTodayString = (): string => {
  const date = new Date();
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

export const calculateDuration = (startIso: string | null, endIso: string | null): string => {
  if (!startIso || !endIso) return '';
  
  const start = new Date(startIso);
  const end = new Date(endIso);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return '0g 0p';

  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  return `${hours}g ${minutes}p`;
};

// Hàm xác định trạng thái đi trễ (ví dụ: sau 9h sáng là trễ)
export const calculateStatus = (checkInTime: Date): 'present' | 'late' => {
  const lateThreshold = new Date(checkInTime);
  lateThreshold.setHours(9, 0, 0, 0); // 9:00 AM
  
  return checkInTime > lateThreshold ? 'late' : 'present';
};