import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface Customer {
    id: number
    name: string | null
    email: string | null
    phone: string | null
    joined_at: string | null
    tags: string | null
    membership_id: number | null
    createdAt: string
    updatedAt: string
}

export interface Vehicle {
    id: number
    customer_id: number
    make: string | null
    model: string | null
    year: number | null
    color: string | null
    license_plate: string
    notes: string | null
    status: string | null
    last_wash_at: string | null
    wash_count: number | null
    photo_url: string | null
    internal_notes: string | null
    wash_status: string
    createdAt: string
    updatedAt: string
}

export interface Service {
    id: number
    name: string | null
    description: string | null
    price: number | null
    duration: number | null
    category: string | null
    createdAt: string
    updatedAt: string
}

export interface Booking {
    id: number
    customer_id: number | null
    vehicle_id: number | null
    date: string | null
    status: string | null
    total_price: number | null
    notes: string | null
    created_by: number
    updated_by: number | null
    createdAt: string
    updatedAt: string
}

export interface BookingService {
    id: number
    booking_id: number | null
    service_id: number | null
    createdAt: string
    updatedAt: string
}

export interface Transaction {
    id: number
    customer_id: number | null
    booking_id: number | null
    membership_id: number | null
    amount: number | null
    payment_method: string | null
    status: string | null
    createdAt: string
    updatedAt: string
}

export interface Membership {
    id: number
    name: string | null
    description: string | null
    price: number | null
    period: string | null
    benefits: string | null
    is_active: boolean | null
    createdAt: string
    updatedAt: string
}

export interface User {
    id: number
    fullname: string
    email: string
    password: string
    address: string | null
    phone: string | null
    date_of_birth: string | null
    role_id: number
}

export interface Role {
    id: number
    name: string
}

export interface Message {
    id: number
    customer_id: number
    text: string
    timestamp: string | null
    status: string | null
    is_incoming: boolean | null
}

// Database helper functions
export const DB = {
    // Customer operations
    customers: {
        async getAll(page = 1, limit = 10) {
            const offset = (page - 1) * limit
            const { data, error, count } = await supabase
                .from('customers')
                .select('*', { count: 'exact' })
                .range(offset, offset + limit - 1)
                .order('createdAt', { ascending: false })

            return { data, error, count }
        },

        async search(searchTerm: string, page = 1, limit = 10) {
            const offset = (page - 1) * limit
            const { data, error, count } = await supabase
                .from('customers')
                .select('*', { count: 'exact' })
                .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
                .range(offset, offset + limit - 1)
                .order('createdAt', { ascending: false })

            return { data, error, count }
        },

        async getById(id: number) {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('id', id)
                .single()

            return { data, error }
        },

        async create(customer: Partial<Customer>) {
            const now = new Date().toISOString()
            const { data, error } = await supabase
                .from('customers')
                .insert({
                    ...customer,
                    createdAt: now,
                    updatedAt: now
                })
                .select()
                .single()

            return { data, error }
        },

        async update(id: number, customer: Partial<Customer>) {
            const { data, error } = await supabase
                .from('customers')
                .update({
                    ...customer,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single()

            return { data, error }
        },

        async delete(id: number) {
            const { data, error } = await supabase
                .from('customers')
                .delete()
                .eq('id', id)

            return { data, error }
        }
    },

    // Vehicle operations
    vehicles: {
        async getAll(page = 1, limit = 10) {
            const offset = (page - 1) * limit
            const { data, error, count } = await supabase
                .from('vehicles')
                .select(`
          *,
          customers!vehicles_customer_id_fkey(
            id,
            name,
            email,
            phone
          )
        `, { count: 'exact' })
                .range(offset, offset + limit - 1)
                .order('createdAt', { ascending: false })

            return { data, error, count }
        },

        async search(searchTerm: string, page = 1, limit = 10) {
            const offset = (page - 1) * limit
            const { data, error, count } = await supabase
                .from('vehicles')
                .select(`
          *,
          customers!vehicles_customer_id_fkey(
            id,
            name,
            email,
            phone
          )
        `, { count: 'exact' })
                .or(`make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,license_plate.ilike.%${searchTerm}%,color.ilike.%${searchTerm}%`)
                .range(offset, offset + limit - 1)
                .order('createdAt', { ascending: false })

            return { data, error, count }
        },

        async getById(id: number) {
            const { data, error } = await supabase
                .from('vehicles')
                .select(`
          *,
          customers!vehicles_customer_id_fkey(
            id,
            name,
            email,
            phone
          )
        `)
                .eq('id', id)
                .single()

            return { data, error }
        },

        async getByCustomerId(customerId: number) {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('customer_id', customerId)

            return { data, error }
        },

        async create(vehicle: Partial<Vehicle>) {
            const now = new Date().toISOString()
            const { data, error } = await supabase
                .from('vehicles')
                .insert({
                    ...vehicle,
                    createdAt: now,
                    updatedAt: now
                })
                .select()
                .single()

            return { data, error }
        },

        async update(id: number, vehicle: Partial<Vehicle>) {
            const { data, error } = await supabase
                .from('vehicles')
                .update({
                    ...vehicle,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single()

            return { data, error }
        },

        async delete(id: number) {
            const { data, error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id)

            return { data, error }
        },

        async getByLicensePlate(licensePlate: string) {
            const { data, error } = await supabase
                .from('vehicles')
                .select(`
          *,
          customers!vehicles_customer_id_fkey(
            id,
            name,
            email,
            phone
          )
        `)
                .eq('license_plate', licensePlate)
                .single()

            return { data, error }
        }
    },

    // Service operations
    services: {
        async getAll() {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('createdAt', { ascending: false })

            return { data, error }
        },

        async getById(id: number) {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single()

            return { data, error }
        },

        async create(service: Partial<Service>) {
            const now = new Date().toISOString()
            const { data, error } = await supabase
                .from('services')
                .insert({
                    ...service,
                    createdAt: now,
                    updatedAt: now
                })
                .select()
                .single()

            return { data, error }
        },

        async update(id: number, service: Partial<Service>) {
            const { data, error } = await supabase
                .from('services')
                .update({
                    ...service,
                    updatedAt: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single()

            return { data, error }
        },

        async delete(id: number) {
            const { data, error } = await supabase
                .from('services')
                .delete()
                .eq('id', id)

            return { data, error }
        }
    },

    // Booking operations
    bookings: {
        async getAll(page = 1, limit = 10) {
            const offset = (page - 1) * limit
            const { data, error, count } = await supabase
                .from('bookings')
                .select(`
          *,
          customers!bookings_customer_id_fkey(
            id,
            name,
            email,
            phone
          ),
          vehicles!bookings_vehicle_id_fkey(
            id,
            make,
            model,
            license_plate
          )
        `, { count: 'exact' })
                .range(offset, offset + limit - 1)
                .order('createdAt', { ascending: false })

            return { data, error, count }
        },

        async create(booking: Partial<Booking>) {
            const now = new Date().toISOString()
            const { data, error } = await supabase
                .from('bookings')
                .insert({
                    ...booking,
                    createdAt: now,
                    updatedAt: now
                })
                .select()
                .single()

            return { data, error }
        },

        async update(id: number, updates: Partial<Booking>) {
            const now = new Date().toISOString()
            const { data, error } = await supabase
                .from('bookings')
                .update({
                    ...updates,
                    updatedAt: now
                })
                .eq('id', id)
                .select()
                .single()

            return { data, error }
        },

        async delete(id: number) {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', id)

            return { error }
        },

        async getById(id: number) {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          customers!bookings_customer_id_fkey(
            id,
            name,
            email,
            phone
          ),
          vehicles!bookings_vehicle_id_fkey(
            id,
            make,
            model,
            license_plate
          )
        `)
                .eq('id', id)
                .single()

            return { data, error }
        }
    },

    // Transaction operations
    transactions: {
        async getAll(page = 1, limit = 10) {
            const offset = (page - 1) * limit
            const { data, error, count } = await supabase
                .from('transactions')
                .select(`
          *,
          customers!transactions_customer_id_fkey(
            id,
            name,
            email,
            phone
          )
        `, { count: 'exact' })
                .range(offset, offset + limit - 1)
                .order('createdAt', { ascending: false })

            return { data, error, count }
        },

        async create(transaction: Partial<Transaction>) {
            const now = new Date().toISOString()
            const { data, error } = await supabase
                .from('transactions')
                .insert({
                    ...transaction,
                    createdAt: now,
                    updatedAt: now
                })
                .select()
                .single()

            return { data, error }
        },

        async update(id: number, updates: Partial<Transaction>) {
            const now = new Date().toISOString()
            const { data, error } = await supabase
                .from('transactions')
                .update({
                    ...updates,
                    updatedAt: now
                })
                .eq('id', id)
                .select()
                .single()

            return { data, error }
        },

        async delete(id: number) {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)

            return { error }
        },

        async getById(id: number) {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          customers!transactions_customer_id_fkey(
            id,
            name,
            email,
            phone
          )
        `)
                .eq('id', id)
                .single()

            return { data, error }
        }
    }
}
