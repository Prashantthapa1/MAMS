type Employee = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  joinDate: string;
  monthlySalary: number;
  status: 'Active' | 'Inactive';
};

type Attendance = {
  id: string;
  employeeName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: number;
  status: 'Present' | 'Absent';
};

type LeaveRequest = {
  id: string;
  employeeName: string;
  leaveType: 'Sick' | 'Casual' | 'Annual';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

type Salary = {
  id: string;
  employeeName: string;
  monthlySalary: number;
  paymentMonth: string;
  paymentStatus: 'Paid' | 'Pending';
  paymentDate: string | null;
};

type Revenue = {
  id: string;
  date: string;
  description: string;
  amount: number;
};

type Expense = {
  id: string;
  date: string;
  category: 'Rent' | 'Electricity' | 'Internet' | 'Salary' | 'Maintenance' | 'Other';
  description: string;
  amount: number;
};

const employees: Employee[] = [
  {
    id: 'emp-1',
    fullName: 'Aarav Sharma',
    email: 'aarav@example.com',
    phone: '+977-9800000001',
    position: 'Manager',
    joinDate: '2025-01-10',
    monthlySalary: 85000,
    status: 'Active',
  },
  {
    id: 'emp-2',
    fullName: 'Maya Gurung',
    email: 'maya@example.com',
    phone: '+977-9800000002',
    position: 'Accountant',
    joinDate: '2025-03-18',
    monthlySalary: 62000,
    status: 'Active',
  },
  {
    id: 'emp-3',
    fullName: 'Nisha Thapa',
    email: 'nisha@example.com',
    phone: '+977-9800000003',
    position: 'Front Desk',
    joinDate: '2025-05-01',
    monthlySalary: 42000,
    status: 'Active',
  },
  {
    id: 'emp-4',
    fullName: 'Rohan Rai',
    email: 'rohan@example.com',
    phone: '+977-9800000004',
    position: 'Technician',
    joinDate: '2025-08-22',
    monthlySalary: 50000,
    status: 'Inactive',
  },
  {
    id: 'emp-5',
    fullName: 'Sita Karki',
    email: 'sita@example.com',
    phone: '+977-9800000005',
    position: 'Sales Associate',
    joinDate: '2026-01-05',
    monthlySalary: 46000,
    status: 'Active',
  },
];

const attendance: Attendance[] = [
  {
    id: 'att-1',
    employeeName: 'Aarav Sharma',
    date: '2026-07-22',
    checkInTime: '09:02',
    checkOutTime: '17:18',
    workingHours: 8.25,
    status: 'Present',
  },
  {
    id: 'att-2',
    employeeName: 'Maya Gurung',
    date: '2026-07-22',
    checkInTime: '09:15',
    checkOutTime: null,
    workingHours: 0,
    status: 'Present',
  },
  {
    id: 'att-3',
    employeeName: 'Nisha Thapa',
    date: '2026-07-22',
    checkInTime: null,
    checkOutTime: null,
    workingHours: 0,
    status: 'Absent',
  },
];

const leaveRequests: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeName: 'Sita Karki',
    leaveType: 'Sick',
    startDate: '2026-07-22',
    endDate: '2026-07-23',
    reason: 'Medical appointment',
    status: 'Approved',
  },
  {
    id: 'leave-2',
    employeeName: 'Nisha Thapa',
    leaveType: 'Casual',
    startDate: '2026-07-26',
    endDate: '2026-07-26',
    reason: 'Family work',
    status: 'Pending',
  },
];

const salaries: Salary[] = [
  {
    id: 'sal-1',
    employeeName: 'Aarav Sharma',
    monthlySalary: 85000,
    paymentMonth: '2026-07',
    paymentStatus: 'Paid',
    paymentDate: '2026-07-05',
  },
  {
    id: 'sal-2',
    employeeName: 'Maya Gurung',
    monthlySalary: 62000,
    paymentMonth: '2026-07',
    paymentStatus: 'Pending',
    paymentDate: null,
  },
];

const revenue: Revenue[] = [
  { id: 'rev-1', date: '2026-07-16', description: 'Daily sales', amount: 32000 },
  { id: 'rev-2', date: '2026-07-17', description: 'Daily sales', amount: 28500 },
  { id: 'rev-3', date: '2026-07-18', description: 'Daily sales', amount: 41200 },
  { id: 'rev-4', date: '2026-07-19', description: 'Daily sales', amount: 26000 },
  { id: 'rev-5', date: '2026-07-20', description: 'Daily sales', amount: 37750 },
  { id: 'rev-6', date: '2026-07-21', description: 'Daily sales', amount: 44500 },
  { id: 'rev-7', date: '2026-07-22', description: 'Daily sales', amount: 39800 },
];

const expenses: Expense[] = [
  { id: 'exp-1', date: '2026-07-16', category: 'Internet', description: 'Office internet', amount: 3200 },
  { id: 'exp-2', date: '2026-07-17', category: 'Maintenance', description: 'Equipment repair', amount: 7500 },
  { id: 'exp-3', date: '2026-07-18', category: 'Other', description: 'Supplies', amount: 4800 },
  { id: 'exp-4', date: '2026-07-19', category: 'Electricity', description: 'Utility bill', amount: 6200 },
  { id: 'exp-5', date: '2026-07-20', category: 'Salary', description: 'Part-time wages', amount: 9000 },
  { id: 'exp-6', date: '2026-07-21', category: 'Rent', description: 'Monthly rent portion', amount: 12000 },
  { id: 'exp-7', date: '2026-07-22', category: 'Other', description: 'Office supplies', amount: 5600 },
];

const settings = {
  companyName: 'Small Business Pvt. Ltd.',
  companyAddress: 'Kathmandu, Nepal',
  currency: 'NPR',
};

const attendanceByMonth = [
  { month: 'Jan', present: 92, absent: 8 },
  { month: 'Feb', present: 88, absent: 12 },
  { month: 'Mar', present: 94, absent: 6 },
  { month: 'Apr', present: 90, absent: 10 },
  { month: 'May', present: 96, absent: 4 },
  { month: 'Jun', present: 91, absent: 9 },
  { month: 'Jul', present: 89, absent: 11 },
];

function deleteById<T extends { id: string }>(items: T[], id: string) {
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return false;
  }

  items.splice(index, 1);
  return true;
}

export const mockDataService = {
  getDashboard() {
    const today = '2026-07-22';
    const presentToday = attendance.filter((item) => item.date === today && item.status === 'Present').length;
    const absentToday = attendance.filter((item) => item.date === today && item.status === 'Absent').length;
    const onLeaveToday = leaveRequests.filter(
      (item) => item.status === 'Approved' && item.startDate <= today && item.endDate >= today,
    ).length;
    const todayRevenue = revenue.filter((item) => item.date === today).reduce((total, item) => total + item.amount, 0);
    const todayExpenses = expenses.filter((item) => item.date === today).reduce((total, item) => total + item.amount, 0);

    return {
      summary: {
        totalEmployees: employees.length,
        presentToday,
        absentToday,
        onLeaveToday,
        todayRevenue,
        todayExpenses,
        todayProfit: todayRevenue - todayExpenses,
      },
      revenueVsExpenses: revenue.map((item) => ({
        date: item.date,
        revenue: item.amount,
        expenses: expenses.find((expense) => expense.date === item.date)?.amount ?? 0,
      })),
      monthlyAttendance: attendanceByMonth,
      recentActivities: [
        'Aarav Sharma checked in at 09:02',
        'Sita Karki leave request approved',
        'Daily revenue added for 2026-07-22',
        'Office supplies expense recorded',
      ],
    };
  },
  getEmployees: () => employees,
  getAttendance: () => attendance,
  getLeaveRequests: () => leaveRequests,
  getSalaries: () => salaries,
  getRevenue: () => revenue,
  getExpenses: () => expenses,
  getProfit() {
    const totalRevenue = revenue.reduce((total, item) => total + item.amount, 0);
    const totalExpenses = expenses.reduce((total, item) => total + item.amount, 0);

    return {
      todayProfit: this.getDashboard().summary.todayProfit,
      monthlyProfit: totalRevenue - totalExpenses,
      monthly: revenue.map((item) => ({
        date: item.date,
        profit: item.amount - (expenses.find((expense) => expense.date === item.date)?.amount ?? 0),
      })),
    };
  },
  getReports() {
    return [
      { id: 'attendance', name: 'Attendance Report', records: attendance.length },
      { id: 'revenue', name: 'Revenue Report', records: revenue.length },
      { id: 'expense', name: 'Expense Report', records: expenses.length },
      { id: 'profit', name: 'Profit Report', records: revenue.length },
      { id: 'salary', name: 'Salary Report', records: salaries.length },
    ];
  },
  getSettings: () => settings,
  deleteEmployee: (id: string) => deleteById(employees, id),
  deleteRevenue: (id: string) => deleteById(revenue, id),
  deleteExpense: (id: string) => deleteById(expenses, id),
};
