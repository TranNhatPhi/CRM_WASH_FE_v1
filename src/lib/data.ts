import { DashboardStats, HourlyStats, ComparisonData, WashPackage, LaborData, MonthlyComparison, POSService, POSTransaction, CartItem, Vehicle } from '@/types';

// Mock data generator for development
export const mockDashboardStats: DashboardStats = {
  totalCars: 1273,
  totalRevenue: 2768.72, // 45678900 VND -> AUD
  averageRevenue: 2.17, // 35875 VND -> AUD
  activeStations: 6,
};

export const mockHourlyStats: HourlyStats[] = [
  { hour: '06:00', carsPerHour: 12, grossPerHour: 27.27, grossPerCarHour: 2.27 },
  { hour: '07:00', carsPerHour: 25, grossPerHour: 53.03, grossPerCarHour: 2.12 },
  { hour: '08:00', carsPerHour: 45, grossPerHour: 95.45, grossPerCarHour: 2.12 },
  { hour: '09:00', carsPerHour: 38, grossPerHour: 80.61, grossPerCarHour: 2.12 },
  { hour: '10:00', carsPerHour: 52, grossPerHour: 110.30, grossPerCarHour: 2.12 },
  { hour: '11:00', carsPerHour: 48, grossPerHour: 101.82, grossPerCarHour: 2.12 },
  { hour: '12:00', carsPerHour: 65, grossPerHour: 137.88, grossPerCarHour: 2.12 },
  { hour: '13:00', carsPerHour: 58, grossPerHour: 123.03, grossPerCarHour: 2.12 },
  { hour: '14:00', carsPerHour: 42, grossPerHour: 89.09, grossPerCarHour: 2.12 },
  { hour: '15:00', carsPerHour: 35, grossPerHour: 74.24, grossPerCarHour: 2.12 },
  { hour: '16:00', carsPerHour: 28, grossPerHour: 59.39, grossPerCarHour: 2.12 },
  { hour: '17:00', carsPerHour: 22, grossPerHour: 46.67, grossPerCarHour: 2.12 },
];

export const mockComparisonData: ComparisonData[] = [
  { date: '06:00', carsYesterday: 15, carsToday: 12, grossYesterday: 31.82, grossToday: 27.27 },
  { date: '07:00', carsYesterday: 22, carsToday: 25, grossYesterday: 46.67, grossToday: 53.03 },
  { date: '08:00', carsYesterday: 40, carsToday: 45, grossYesterday: 84.85, grossToday: 95.45 },
  { date: '09:00', carsYesterday: 35, carsToday: 38, grossYesterday: 74.24, grossToday: 80.61 },
  { date: '10:00', carsYesterday: 48, carsToday: 52, grossYesterday: 101.82, grossToday: 110.30 },
  { date: '11:00', carsYesterday: 45, carsToday: 48, grossYesterday: 95.45, grossToday: 101.82 },
  { date: '12:00', carsYesterday: 60, carsToday: 65, grossYesterday: 127.27, grossToday: 137.88 },
];

export const mockWashPackages: WashPackage[] = [
  { id: '1', name: 'BASIC PACKAGE', price: 1.52, color: '#22C55E', percentage: 34.5 }, // 25000 VND -> AUD
  { id: '2', name: 'SEMI CLEAN', price: 2.12, color: '#3B82F6', percentage: 22.3 }, // 35000 VND -> AUD
  { id: '3', name: 'PROTECT', price: 2.73, color: '#F59E0B', percentage: 15.8 }, // 45000 VND -> AUD
  { id: '4', name: 'WASH & PROTECT', price: 3.33, color: '#EF4444', percentage: 12.1 }, // 55000 VND -> AUD
  { id: '5', name: 'WAX & SUPER CLEAN', price: 4.55, color: '#8B5CF6', percentage: 8.7 }, // 75000 VND -> AUD
  { id: '6', name: 'EXPRESS WAX', price: 3.94, color: '#06B6D4', percentage: 6.6 }, // 65000 VND -> AUD
];

export const mockLaborData: LaborData[] = [
  { employee: 'John Smith', hrsToday: 8.5, hrsYesterday: 8.0 },
  { employee: 'Sarah Johnson', hrsToday: 7.8, hrsYesterday: 8.2 },
  { employee: 'Michael Brown', hrsToday: 8.2, hrsYesterday: 7.5 },
  { employee: 'Emily Davis', hrsToday: 8.0, hrsYesterday: 8.0 },
];

export const mockMonthlyComparison: MonthlyComparison[] = [
  { month: 'Mon', carsFeb: 450, carsMarch: 520, grossFeb: 954.55, grossMarch: 1103.03 },
  { month: 'Tue', carsFeb: 380, carsMarch: 420, grossFeb: 806.06, grossMarch: 890.91 },
  { month: 'Wed', carsFeb: 520, carsMarch: 580, grossFeb: 1103.03, grossMarch: 1230.30 },
  { month: 'Thu', carsFeb: 480, carsMarch: 540, grossFeb: 1018.18, grossMarch: 1145.45 },
  { month: 'Fri', carsFeb: 420, carsMarch: 460, grossFeb: 890.91, grossMarch: 975.76 },
  { month: 'Sat', carsFeb: 380, carsMarch: 410, grossFeb: 806.06, grossMarch: 869.70 },
  { month: 'Sun', carsFeb: 320, carsMarch: 350, grossFeb: 678.79, grossMarch: 742.42 },
];

// Chart colors
export const chartColors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
};

export const packageColors = [
  '#22C55E', '#3B82F6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#84CC16', '#F97316',
  '#EC4899', '#6366F1', '#14B8A6', '#F43F5E'
];

// API simulation functions
export const fetchDashboardData = async (): Promise<DashboardStats> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return mockDashboardStats;
};

export const fetchHourlyStats = async (): Promise<HourlyStats[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockHourlyStats;
};

export const fetchComparisonData = async (): Promise<ComparisonData[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockComparisonData;
};

export const fetchWashPackages = async (): Promise<WashPackage[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockWashPackages;
};

export const fetchLaborData = async (): Promise<LaborData[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockLaborData;
};

export const fetchMonthlyComparison = async (): Promise<MonthlyComparison[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockMonthlyComparison;
};

// POS System Mock Data
export const mockPOSServices: POSService[] = [
  // Basic Services
  {
    id: 'basic-1',
    name: 'Express Wash',
    price: 1.52, // 25000 VND -> AUD
    duration: 15,
    description: 'Quick exterior wash with soap and rinse',
    category: 'basic',
    color: '#10B981',
  },
  {
    id: 'basic-2',
    name: 'Basic Package',
    price: 2.12, // 35000 VND -> AUD
    duration: 25,
    description: 'Exterior wash, tire cleaning, and interior vacuum',
    category: 'basic',
    color: '#10B981',
  },
  // Premium Services
  {
    id: 'premium-1',
    name: 'Premium Wash',
    price: 3.33, // 55000 VND -> AUD
    duration: 35,
    description: 'Full wash, wax application, interior cleaning, and tire shine',
    category: 'premium',
    color: '#3B82F6',
  },
  {
    id: 'premium-2',
    name: 'Semi Clean',
    price: 2.73, // 45000 VND -> AUD
    duration: 30,
    description: 'Exterior wash, basic interior clean, dashboard wipe',
    category: 'premium',
    color: '#3B82F6',
  },
  // Deluxe Services
  {
    id: 'deluxe-1',
    name: 'Detail Wash',
    price: 5.15, // 85000 VND -> AUD
    duration: 60,
    description: 'Complete detailing, leather treatment, engine bay cleaning',
    category: 'deluxe',
    color: '#8B5CF6',
  },
  {
    id: 'deluxe-2',
    name: 'Supreme Package',
    price: 7.27, // 120000 VND -> AUD
    duration: 90,
    description: 'Ultimate care package with ceramic coating and full detailing',
    category: 'deluxe',
    color: '#8B5CF6',
  },
  // Add-on Services
  {
    id: 'addon-1',
    name: 'Wax Protection',
    price: 1.52, // 25000 VND -> AUD
    duration: 10,
    description: 'Premium wax application for paint protection',
    category: 'addon',
    color: '#F59E0B',
  },
  {
    id: 'addon-2',
    name: 'Interior Protection',
    price: 2.12, // 35000 VND -> AUD
    duration: 15,
    description: 'Fabric protection and leather conditioning',
    category: 'addon',
    color: '#F59E0B',
  },
  {
    id: 'addon-3',
    name: 'Air Freshener',
    price: 0.91, // 15000 VND -> AUD
    duration: 5,
    description: 'Premium car air freshener application',
    category: 'addon',
    color: '#F59E0B',
  }, {
    id: 'addon-4',
    name: 'Tire Black',
    price: 1.21, // 20000 VND -> AUD
    duration: 10,
    description: 'Tire shine and protection treatment',
    category: 'addon',
    color: '#F59E0B',
  },
  // Premium Services Extended
  {
    id: 'premium-3',
    name: 'Complete Wash',
    price: 4.54, // 75000 VND -> AUD
    duration: 45,
    description: 'Full service wash with interior and exterior detailing',
    category: 'premium',
    color: '#3B82F6',
  },
  {
    id: 'premium-4',
    name: 'VIP Wash',
    price: 6.06, // 100000 VND -> AUD
    duration: 50,
    description: 'Premium wash with hand drying and premium products',
    category: 'premium',
    color: '#3B82F6',
  },
  // Basic Services Extended
  {
    id: 'basic-3',
    name: 'Quick Rinse',
    price: 0.91, // 15000 VND -> AUD
    duration: 10,
    description: 'Quick water rinse and basic exterior clean',
    category: 'basic',
    color: '#10B981',
  },
  {
    id: 'basic-4',
    name: 'Economy Wash',
    price: 1.82, // 30000 VND -> AUD
    duration: 20,
    description: 'Budget-friendly wash with soap and basic rinse',
    category: 'basic',
    color: '#10B981',
  },
  // Deluxe Services Extended
  {
    id: 'deluxe-3',
    name: 'Luxury Package',
    price: 9.09, // 150000 VND -> AUD
    duration: 120,
    description: 'Ultimate luxury treatment with premium wax and interior leather care',
    category: 'deluxe',
    color: '#8B5CF6',
  },
  {
    id: 'deluxe-4',
    name: 'Elite Detail',
    price: 12.12, // 200000 VND -> AUD
    duration: 180,
    description: 'Professional detailing with paint correction and ceramic coating',
    category: 'deluxe',
    color: '#8B5CF6',
  },
  // Additional Add-on Services
  {
    id: 'addon-5',
    name: 'Paint Protection',
    price: 3.03, // 50000 VND -> AUD
    duration: 20,
    description: 'Advanced paint protection with ceramic coating',
    category: 'addon',
    color: '#F59E0B',
  },
  {
    id: 'addon-6',
    name: 'Engine Clean',
    price: 2.42, // 40000 VND -> AUD
    duration: 25,
    description: 'Engine bay cleaning and degreasing',
    category: 'addon',
    color: '#F59E0B',
  },
  {
    id: 'addon-7',
    name: 'Undercarriage Wash',
    price: 1.82, // 30000 VND -> AUD
    duration: 15,
    description: 'High-pressure undercarriage cleaning',
    category: 'addon',
    color: '#F59E0B',
  },
  {
    id: 'addon-8',
    name: 'Headlight Restoration',
    price: 3.64, // 60000 VND -> AUD
    duration: 30,
    description: 'Professional headlight cleaning and restoration',
    category: 'addon',
    color: '#F59E0B',
  },
];

export const fetchPOSServices = async (): Promise<POSService[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPOSServices), 100);
  });
};

export const generatePOSTransactions = (): POSTransaction[] => {
  const transactions: POSTransaction[] = [];
  const customers = [
    { name: 'John Smith', phone: '+1-555-0123', vehiclePlate: 'ABC123' },
    { name: 'Sarah Johnson', phone: '+1-555-0456', vehiclePlate: 'XYZ789', isVIP: true },
    { name: 'Michael Brown', phone: '+1-555-0789', vehiclePlate: 'DEF456' },
    { name: 'Emily Davis', phone: '+1-555-0234', vehiclePlate: 'GHI789', isVIP: true },
  ];

  for (let i = 0; i < 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const services = mockPOSServices
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);

    const items: CartItem[] = services.map(service => ({
      service,
      quantity: 1,
      subtotal: service.price,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = customer.isVIP ? subtotal * 0.1 : 0;
    const tax = (subtotal - discount) * 0.1;
    const total = subtotal - discount + tax;

    const transaction: POSTransaction = {
      id: `TXN-${String(i + 1).padStart(4, '0')}`,
      customer,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: ['cash', 'card', 'digital'][Math.floor(Math.random() * 3)] as any,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      status: ['completed', 'in-progress', 'pending'][Math.floor(Math.random() * 3)] as any,
    };

    transactions.push(transaction);
  }

  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Mock data for Analytics page
export const generateMonthlyRevenueData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    revenue: Math.floor(Math.random() * 3030) + 1212, // 20-70M VND -> 1212-4242 AUD
  }));
};

export const generateCustomerAnalytics = () => [
  { type: 'VIP Customers', count: 245 },
  { type: 'Regular Customers', count: 1580 },
  { type: 'New Customers', count: 892 },
  { type: 'Potential Customers', count: 456 },
];

export const generateWashTypeAnalytics = () => [
  { type: 'Basic Wash', percentage: 35 },
  { type: 'Premium Wash', percentage: 28 },
  { type: 'Detail Wash', percentage: 22 },
  { type: 'Quick Wash', percentage: 10 },
  { type: 'Other Services', percentage: 5 },
];

export const generateHourlyCustomerData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return hours.map(hour => ({
    hour,
    customers: hour >= 6 && hour <= 22
      ? Math.floor(Math.random() * 25) + (hour >= 8 && hour <= 18 ? 15 : 5)
      : Math.floor(Math.random() * 3),
  }));
};

// Mock data for Cars page
export const generateCarData = () => {
  const carTypes = ['Sedan', 'SUV', 'Hatchback', 'Pickup', 'Van', 'Luxury'];
  const brands = ['Toyota', 'Honda', 'Mazda', 'Ford', 'Hyundai', 'KIA', 'BMW', 'Mercedes'];
  const washStatuses: ('pending' | 'started' | 'late' | 'finished' | 'unpaid' | 'collected' | 'cancelled')[] = [
    'pending', 'started', 'late', 'finished', 'unpaid', 'collected', 'cancelled'
  ];

  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    licensePlate: `${Math.floor(Math.random() * 90) + 10}A-${Math.floor(Math.random() * 999) + 100}.${Math.floor(Math.random() * 99) + 10}`,
    brand: brands[Math.floor(Math.random() * brands.length)],
    model: `Model ${Math.floor(Math.random() * 10) + 1}`,
    type: carTypes[Math.floor(Math.random() * carTypes.length)],
    color: ['White', 'Black', 'Silver', 'Red', 'Blue'][Math.floor(Math.random() * 5)],
    ownerName: `Customer ${i + 1}`,
    phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    lastWash: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
    totalWashes: Math.floor(Math.random() * 50) + 1,
    totalSpent: Math.floor(Math.random() * 10000000) + 500000,
    status: ['Active', 'VIP', 'New', 'Inactive'][Math.floor(Math.random() * 4)],
    washStatus: i < 35 ? washStatuses[Math.floor(Math.random() * washStatuses.length)] : undefined,
    washStatusUpdated: i < 35 ? new Date(Date.now() - Math.floor(Math.random() * 6) * 60 * 60 * 1000) : undefined,
    estimatedCompletion: i < 20 ? new Date(Date.now() + Math.floor(Math.random() * 4) * 60 * 60 * 1000) : undefined,
    currentServiceId: i < 20 ? `service-${Math.floor(Math.random() * 10) + 1}` : undefined,
  }));
};

// Mock data for Staff page
export const generateStaffData = () => {
  const positions = ['Shift Manager', 'Wash Technician', 'Cashier', 'Security', 'Maintenance Technician'];
  const shifts = ['Morning Shift', 'Afternoon Shift', 'Evening Shift', 'Full-time'];

  return Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: `Employee ${i + 1}`,
    position: positions[Math.floor(Math.random() * positions.length)],
    shift: shifts[Math.floor(Math.random() * shifts.length)],
    phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    email: `employee${i + 1}@company.com`,
    hireDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
    salary: Math.floor(Math.random() * 606) + 485, // 8-18M VND -> 485-1091 AUD
    performance: Math.floor(Math.random() * 40) + 60, // 60-100%
    status: ['Working', 'On Leave', 'Inactive'][Math.floor(Math.random() * 3)],
    tasksCompleted: Math.floor(Math.random() * 100) + 50,
    rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
  }));
};

// Mock data for Revenue page
export const generateRevenueData = () => {
  const services = ['Basic Wash', 'Premium Wash', 'Detail Wash', 'Additional Services'];
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 303) + 61, // 1-6M VND -> 61-364 AUD
      transactions: Math.floor(Math.random() * 100) + 20,
      services: services.map(service => ({
        name: service,
        revenue: Math.floor(Math.random() * 61) + 12, // 200K-1.2M VND -> 12-73 AUD
        count: Math.floor(Math.random() * 30) + 5,
      })),
    };
  });

  return last30Days;
};

export const generateExpenseData = () => [
  { category: 'Personnel', amount: 2727.27, percentage: 35 }, // 45M VND -> AUD
  { category: 'Supplies', amount: 1515.15, percentage: 20 }, // 25M VND -> AUD
  { category: 'Utilities', amount: 909.09, percentage: 12 }, // 15M VND -> AUD
  { category: 'Maintenance', amount: 727.27, percentage: 10 }, // 12M VND -> AUD
  { category: 'Marketing', amount: 484.85, percentage: 6 }, // 8M VND -> AUD
  { category: 'Other', amount: 1333.33, percentage: 17 }, // 22M VND -> AUD
];

// Mock data for Reports page
export const generateReportData = () => ({
  daily: {
    customers: Math.floor(Math.random() * 200) + 100,
    revenue: Math.floor(Math.random() * 606) + 303, // 5-15M VND -> 303-909 AUD
    averageTicket: Math.floor(Math.random() * 12) + 6, // 100-300K VND -> 6-18 AUD
    efficiency: Math.floor(Math.random() * 30) + 70,
  },
  weekly: {
    customers: Math.floor(Math.random() * 1000) + 500,
    revenue: Math.floor(Math.random() * 3030) + 1515, // 25-75M VND -> 1515-4545 AUD
    averageTicket: Math.floor(Math.random() * 12) + 6, // 100-300K VND -> 6-18 AUD
    efficiency: Math.floor(Math.random() * 30) + 70,
  },
  monthly: {
    customers: Math.floor(Math.random() * 4000) + 2000,
    revenue: Math.floor(Math.random() * 12121) + 6061, // 100-300M VND -> 6061-18182 AUD
    averageTicket: Math.floor(Math.random() * 12) + 6, // 100-300K VND -> 6-18 AUD
    efficiency: Math.floor(Math.random() * 30) + 70,
  },
});
