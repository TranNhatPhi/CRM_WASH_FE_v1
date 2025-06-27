import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const { data: transactions, error, count } = await DB.transactions.getAll(page, limit);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            statusCode: 200,
            message: 'Transactions fetched successfully',
            data: {
                transactions: transactions || [],
                total: count || 0,
                page,
                limit
            }
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            {
                statusCode: 500,
                message: 'Failed to fetch transactions',
                data: {
                    transactions: [],
                    total: 0,
                    page: 1,
                    limit: 10
                },
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { customer_id, booking_id, amount, payment_method, status } = body;

        // Validate required fields
        if (!customer_id || !amount) {
            return NextResponse.json(
                {
                    statusCode: 400,
                    message: 'Customer ID and amount are required',
                    data: null
                },
                { status: 400 }
            );
        }

        const transactionData = {
            customer_id,
            booking_id,
            membership_id: null,
            amount,
            payment_method: payment_method || 'cash',
            status: status || 'completed'
        };

        const { data: transaction, error } = await DB.transactions.create(transactionData);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            statusCode: 201,
            message: 'Transaction created successfully',
            data: transaction
        });

    } catch (error) {
        console.error('Error creating transaction:', error);
        return NextResponse.json(
            {
                statusCode: 500,
                message: 'Unable to create transaction',
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
