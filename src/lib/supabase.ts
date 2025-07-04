import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  car_registration?: string
  created_at: string
  updated_at?: string
}

export interface Service {
  id: number
  name: string
  description?: string | null
  price: number
  duration?: number | null
  category?: string
  active?: boolean
  createdAt: string
  updatedAt?: string
}

export interface Transaction {
  id: string
  customer_id?: string
  staff_id?: string
  car_registration?: string
  total_amount: number
  payment_method?: 'cash' | 'card' | 'digital'
  status?: 'pending' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at?: string
}

export interface Booking {
  id: string
  customer_id?: string
  service_id?: string
  booking_date: string
  status?: string
  created_at: string
  updated_at?: string
}

export interface Message {
  id: string
  sender_id?: string
  receiver_id?: string
  content: string
  message_type?: string
  created_at: string
}

export interface Vehicle {
  id: string
  customer_id?: string
  make?: string
  model?: string
  year?: number
  license_plate?: string
  created_at: string
  updated_at?: string
}

// Database functions
export const db = {
  // Test connection
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('count', { count: 'exact', head: true })

      return { success: !error, error: error?.message }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  },

  // Get table counts
  async getTableCounts() {
    try {
      const tables = ['customers', 'services', 'transactions', 'bookings', 'messages', 'vehicles']
      const counts: any = {}

      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })

          counts[table] = error ? 0 : (count || 0)
        } catch {
          counts[table] = 0
        }
      }

      return counts
    } catch (error) {
      console.error('Error getting table counts:', error)
      return {
        customers: 0,
        services: 0,
        transactions: 0,
        bookings: 0,
        messages: 0,
        vehicles: 0
      }
    }
  },

  // Services
  services: {
    async getAll() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Service[]
    },

    async getByCategory(category: string) {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true })

      if (error) throw error
      return data as Service[]
    },

    async create(service: Omit<Service, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single()

      if (error) throw error
      return data as Service
    },

    async update(id: string, updates: Partial<Service>) {
      const { data, error } = await supabase
        .from('services')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Service
    }
  },

  // Customers
  customers: {
    async getAll() {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Customer[]
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Customer
    },

    async getByCarRego(carRego: string) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('car_registration', carRego)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as Customer | null
    },

    async create(customer: Omit<Customer, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()

      if (error) throw error
      return data as Customer
    },

    async update(id: string, updates: Partial<Customer>) {
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Customer
    }
  },

  // Transactions
  transactions: {
    async create(transaction: Omit<Transaction, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single()

      if (error) throw error
      return data as Transaction
    },

    async getAll(limit = 50) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as Transaction[]
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Transaction
    },

    async update(id: string, updates: Partial<Transaction>) {
      const { data, error } = await supabase
        .from('transactions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Transaction
    }
  },

  // Bookings
  bookings: {
    async getAll() {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Booking[]
    },

    async create(booking: Omit<Booking, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single()

      if (error) throw error
      return data as Booking
    },

    async update(id: string, updates: Partial<Booking>) {
      const { data, error } = await supabase
        .from('bookings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Booking
    }
  },

  // Messages
  messages: {
    async getAll() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Message[]
    },

    async create(message: Omit<Message, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single()

      if (error) throw error
      return data as Message
    }
  },

  // Vehicles
  vehicles: {
    async getAll() {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Vehicle[]
    },

    async create(vehicle: Omit<Vehicle, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicle)
        .select()
        .single()

      if (error) throw error
      return data as Vehicle
    },

    async update(id: string, updates: Partial<Vehicle>) {
      const { data, error } = await supabase
        .from('vehicles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Vehicle
    }
  }
}
