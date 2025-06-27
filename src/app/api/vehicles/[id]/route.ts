import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;

    const { data: vehicle, error } = await DB.vehicles.getById(parseInt(vehicleId));

    if (error) {
      throw new Error(error.message);
    }

    if (!vehicle) {
      return NextResponse.json(
        {
          statusCode: 404,
          message: 'Vehicle not found',
          data: null
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      statusCode: 200,
      message: 'Vehicle fetched successfully',
      data: vehicle
    });

  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to fetch vehicle',
        data: null
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id: vehicleId } = await params;

    const { data: vehicle, error } = await DB.vehicles.update(parseInt(vehicleId), body);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      statusCode: 200,
      message: 'Vehicle updated successfully',
      data: vehicle
    });

  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to update vehicle',
        data: null
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;

    const { error } = await DB.vehicles.delete(parseInt(vehicleId));

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      statusCode: 200,
      message: 'Vehicle deleted successfully',
      data: null
    });

  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to delete vehicle',
        data: null
      },
      { status: 500 }
    );
  }
}
