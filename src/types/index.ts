// Dashboard Types
export interface DashboardStats {
  totalCars: number;
  totalRevenue: number;
  averageRevenue: number;
  activeStations: number;
}

export interface HourlyStats {
  hour: string;
  carsPerHour: number;
  grossPerHour: number;
  grossPerCarHour: number;
}

export interface ComparisonData {
  date: string;
  carsYesterday: number;
  carsToday: number;
  grossYesterday: number;
  grossToday: number;
}

export interface WashPackage {
  id: string;
  name: string;
  price: number;
  color: string;
  percentage: number;
}

export interface LaborData {
  employee: string;
  hrsToday: number;
  hrsYesterday: number;
}

export interface MonthlyComparison {
  month: string;
  carsFeb: number;
  carsMarch: number;
  grossFeb: number;
  grossMarch: number;
}

// Chart Data Types
export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
  }[];
}

export interface PieChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// User and System Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  avatar?: string;
}

export interface Station {
  id: string;
  name: string;
  status: 'active' | 'maintenance' | 'offline';
  lastUpdate: Date;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  packageId: string;
  amount: number;
  stationId: string;
  customerInfo?: {
    id?: string;
    name?: string;
    phone?: string;
  };
}

// POS System Types
export interface POSService {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description: string;
  category: 'basic' | 'premium' | 'deluxe' | 'addon' | 'wash' | 'detailing' | 'protection' | 'maintenance';
  color: string;
  image?: string;
}

export interface CartItem {
  service: POSService;
  quantity: number;
  subtotal: number;
}

export interface POSCustomer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  vehiclePlate?: string;
  isVIP?: boolean;
  totalVisits?: number;
  loyaltyPoints?: number;
}

export interface POSTransaction {
  id: string;
  customer: POSCustomer;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  timestamp: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  estimatedCompletion?: Date;
  notes?: string;
}

// API Service Types for POS
export interface APIService {
  id: string;
  name: string;
  price: number;
  category: 'WASHES' | 'DETAILING' | 'ADDONS' | 'NEW_CAR_PROTECTION';
  color: string;
  darkColor: string;
}

export interface ServicesByCategory {
  WASHES: APIService[];
  DETAILING: APIService[];
  ADDONS: APIService[];
  NEW_CAR_PROTECTION: APIService[];
}

export interface ServicesAPIResponse {
  success: boolean;
  data: ServicesByCategory;
  message: string;
}

// Vehicle Wash Status Types
export type VehicleWashStatus =
  | 'pending'     // Pending - Waiting
  | 'started'     // Started - In progress
  | 'late'        // Late - Overdue
  | 'finished'    // Finished - Completed
  | 'unpaid'      // Unpaid - Payment pending
  | 'collected'   // Collected - Vehicle picked up (hidden)
  | 'cancelled';  // Cancelled - Service cancelled (hidden)

// Vehicle Management Types
export interface Vehicle {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  type: string;
  color: string;
  ownerName: string;
  phone: string;
  lastWash: Date;
  totalWashes: number;
  totalSpent: number;
  status: 'Active' | 'VIP' | 'New' | 'Inactive';
  washStatus?: VehicleWashStatus;
  washStatusUpdated?: Date;
  estimatedCompletion?: Date;
  currentServiceId?: string;
  year?: number;
  notes?: string;
  photoUrl?: string;
  internalNotes?: string;
  washCount: number;
}

// Backend API Vehicle Types (matching your backend structure)
export interface ApiVehicle {
  id: number;
  customer_id: number;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  notes: string;
  status: string;
  last_wash_at: string | null;
  wash_count: number;
  photo_url: string | null;
  internal_notes: string | null;
  wash_status?: string | null;
  createdAt: string;
  updatedAt: string;
  Customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

export interface ApiVehicleResponse {
  statusCode: number;
  message: string;
  data: {
    vehicles: ApiVehicle[];
    total: number;
    page: number;
    limit: number;
  };
}

// Function to convert API vehicle to frontend vehicle format
export function convertApiVehicleToVehicle(apiVehicle: ApiVehicle): Vehicle {
  // Map backend status to frontend status
  const mapStatus = (backendStatus: string): 'Active' | 'VIP' | 'New' | 'Inactive' => {
    const status = backendStatus.toLowerCase();
    if (status.includes('vip') || status.includes('premium')) return 'VIP';
    if (status.includes('new')) return 'New';
    if (status.includes('inactive') || status.includes('disabled')) return 'Inactive';
    return 'Active'; // Default to Active
  };

  return {
    id: apiVehicle.id,
    licensePlate: apiVehicle.license_plate,
    brand: apiVehicle.make,
    model: apiVehicle.model,
    type: 'Sedan', // Default type since not provided by API
    color: apiVehicle.color,
    ownerName: apiVehicle.Customer.name,
    phone: apiVehicle.Customer.phone,
    lastWash: apiVehicle.last_wash_at ? new Date(apiVehicle.last_wash_at) : new Date(apiVehicle.updatedAt),
    totalWashes: apiVehicle.wash_count,
    totalSpent: 0, // Default value since not provided by API - could be calculated
    status: mapStatus(apiVehicle.status),
    washStatus: apiVehicle.wash_status as VehicleWashStatus || undefined,
    washStatusUpdated: undefined,
    estimatedCompletion: undefined,
    currentServiceId: undefined,
    year: apiVehicle.year,
    notes: apiVehicle.notes,
    photoUrl: apiVehicle.photo_url || undefined,
    internalNotes: apiVehicle.internal_notes || undefined,
    washCount: apiVehicle.wash_count,
  };
}
