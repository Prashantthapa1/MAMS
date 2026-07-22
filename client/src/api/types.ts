export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type AuthRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
  employeeId?: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type DashboardData = {
  summary: {
    totalEmployees: number;
    presentToday: number;
    absentToday: number;
    onLeaveToday: number;
    todayRevenue: number;
    todayExpenses: number;
    todayProfit: number;
  };
  revenueVsExpenses: Array<{ date: string; revenue: number; expenses: number }>;
  monthlyAttendance: Array<{ month: string; present: number; absent: number }>;
  recentActivities: string[];
};

export type Employee = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  joinDate: string;
  monthlySalary: number;
  status: 'Active' | 'Inactive';
  avatarUrl: string | null;
};

export type EmployeeProfile = {
  employee: Employee;
  attendanceHistory: Array<{
    id: string;
    date: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    workingHours: number;
    status: 'Present' | 'Absent';
  }>;
  leaveHistory: Array<{
    id: string;
    leaveType: 'Sick' | 'Casual' | 'Annual';
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
  }>;
  salaryHistory: Array<{
    id: string;
    monthlySalary: number;
    paymentMonth: string;
    paymentStatus: 'Paid' | 'Pending';
    paymentDate: string | null;
  }>;
};

export type Attendance = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: number;
  status: 'Present' | 'Absent';
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Sick' | 'Casual' | 'Annual';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

export type Salary = {
  id: string;
  employeeId: string;
  employeeName: string;
  monthlySalary: number;
  paymentMonth: string;
  paymentStatus: 'Paid' | 'Pending';
  paymentDate: string | null;
};

export type Revenue = {
  id: string;
  date: string;
  description: string;
  amount: number;
};

export type Expense = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
};

export type ProfitData = {
  todayProfit: number;
  monthlyProfit: number;
  monthly: Array<{ date: string; profit: number }>;
};

export type ReportSummary = {
  id: string;
  name: string;
  records: number;
};

export type Settings = {
  companyName: string;
  companyAddress: string;
  currency: string;
};

export type ManagedUser = AuthUser & { position: string | null };
