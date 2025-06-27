'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/utils';
import { Vehicle, VehicleWashStatus, ApiVehicleResponse, convertApiVehicleToVehicle } from '@/types';

export default function CarsPage() {
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedWashStatus, setSelectedWashStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<{ [key: string]: boolean }>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const itemsPerPage = 10;

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vehicles/pagination?page=${currentPage}&limit=${itemsPerPage}`);

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const apiResponse: ApiVehicleResponse = await response.json();

      if (apiResponse.statusCode === 200) {
        const convertedVehicles = apiResponse.data.vehicles.map(convertApiVehicleToVehicle);
        setCars(convertedVehicles);
        setTotalVehicles(apiResponse.data.total);
        setTotalPages(Math.ceil(apiResponse.data.total / itemsPerPage));
      } else {
        throw new Error(apiResponse.message || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [currentPage]);

  // Action handlers
  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setExpandedNotes({}); // Reset expanded state
    setShowDetailModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowEditModal(true);
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${vehicle.licensePlate}?`)) {
      return;
    }

    try {
      console.log('Delete vehicle:', vehicle.id);
      setCars(prevCars => prevCars.filter(car => car.id !== vehicle.id));
      setTotalVehicles(prev => prev - 1);
      alert(`Vehicle ${vehicle.licensePlate} deleted successfully!`);
      await fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle. Please try again.');
    }
  };

  const handleSaveEdit = async (updatedVehicle: Partial<Vehicle>) => {
    if (!editingVehicle) return;

    try {
      setEditLoading(true);
      const updateData = {
        customer_id: updatedVehicle.id,
        make: updatedVehicle.brand,
        model: updatedVehicle.model,
        year: updatedVehicle.year,
        color: updatedVehicle.color,
        license_plate: updatedVehicle.licensePlate,
        notes: updatedVehicle.notes,
        status: updatedVehicle.status,
        last_wash_at: updatedVehicle.lastWash,
        wash_count: updatedVehicle.washCount,
        photo_url: updatedVehicle.photoUrl,
        internal_notes: updatedVehicle.internalNotes
      };

      const response = await fetch(`/api/vehicles/${editingVehicle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle');
      }

      const result = await response.json();

      if (result.statusCode === 200) {
        setCars(prevCars =>
          prevCars.map(car =>
            car.id === editingVehicle.id
              ? { ...car, ...updatedVehicle }
              : car
          )
        );

        setShowEditModal(false);
        setEditingVehicle(null);
        await fetchVehicles();
        alert('Vehicle updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert(error instanceof Error ? error.message : 'Failed to update vehicle. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Helper function to truncate long text
  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Edit Modal Component
  const EditModal = () => {
    const [formData, setFormData] = useState<Partial<Vehicle>>({});

    // Initialize form data when editing vehicle changes
    React.useEffect(() => {
      if (editingVehicle) {
        setFormData(editingVehicle);
      }
    }, [editingVehicle]);

    const handleInputChange = (field: keyof Vehicle, value: any) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSaveEdit(formData);
    };

    if (!showEditModal || !editingVehicle) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Vehicle</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{editingVehicle.licensePlate}</p>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Vehicle Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Vehicle Information</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    License Plate
                  </label>
                  <input
                    type="text"
                    value={formData.licensePlate || ''}
                    onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand || ''}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={formData.model || ''}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year
                    </label>
                    <input
                      type="number"
                      value={formData.year || ''}
                      onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={formData.color || ''}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Owner & Status Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Owner & Status</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName || ''}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="VIP">VIP</option>
                    <option value="New">New</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wash Count
                  </label>
                  <input
                    type="number"
                    value={formData.washCount || 0}
                    onChange={(e) => handleInputChange('washCount', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6 space-y-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Notes</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Customer Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Internal Notes
                </label>
                <textarea
                  value={formData.internalNotes || ''}
                  onChange={(e) => handleInputChange('internalNotes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {editLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // Utility functions for wash status
  const getWashStatusDisplay = (status: VehicleWashStatus): string => {
    const statusMap: Record<VehicleWashStatus, string> = {
      pending: 'Pending',
      started: 'Started',
      late: 'Late',
      finished: 'Finished',
      unpaid: 'Unpaid',
      collected: 'Collected',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getWashStatusColor = (status: VehicleWashStatus): string => {
    const colorMap: Record<VehicleWashStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      started: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      late: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      finished: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      unpaid: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      collected: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'VIP': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Inactive': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  // Filter cars based on search term and selected status
  const filteredCars = cars.filter(car => {
    const matchesSearch = car.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || car.status === selectedStatus;
    const matchesWashStatus = selectedWashStatus === 'All' ||
      (selectedWashStatus === 'None' && !car.washStatus) ||
      car.washStatus === selectedWashStatus;

    return matchesSearch && matchesStatus && matchesWashStatus;
  });

  // New Detail Modal Component
  const DetailModal = () => {
    if (!showDetailModal || !selectedVehicle) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Details</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedVehicle.licensePlate}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDetailModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Basic Information
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">ID:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedVehicle.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">License Plate:</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedVehicle.licensePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Brand:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedVehicle.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Model:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedVehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Year:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedVehicle.year || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Color:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedVehicle.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Type:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedVehicle.type}</span>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Owner Information
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Name:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedVehicle.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone:</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">{selectedVehicle.phone}</span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Statistics
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Washes:</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{selectedVehicle.washCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Spent:</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{formatCurrency(selectedVehicle.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Wash:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedVehicle.lastWash)}</span>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status Information
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Customer Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedVehicle.status)}`}>
                      {selectedVehicle.status}
                    </span>
                  </div>
                  {selectedVehicle.washStatus && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Wash Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getWashStatusColor(selectedVehicle.washStatus)}`}>
                        {getWashStatusDisplay(selectedVehicle.washStatus)}
                      </span>
                    </div>
                  )}
                  {selectedVehicle.washStatusUpdated && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Updated:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{formatDate(selectedVehicle.washStatusUpdated)}</span>
                    </div>
                  )}
                  {selectedVehicle.estimatedCompletion && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Est. Completion:</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">{formatDate(selectedVehicle.estimatedCompletion)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {(selectedVehicle.notes || selectedVehicle.internalNotes) && (
              <div className="mt-6 space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Notes
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {selectedVehicle.notes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Customer Notes:</h5>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        {expandedNotes.customer ? selectedVehicle.notes : truncateText(selectedVehicle.notes, 150)}
                        {selectedVehicle.notes.length > 150 && (
                          <button
                            onClick={() => setExpandedNotes(prev => ({ ...prev, customer: !prev.customer }))}
                            className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                          >
                            {expandedNotes.customer ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedVehicle.internalNotes && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Internal Notes:</h5>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        {expandedNotes.internal ? selectedVehicle.internalNotes : truncateText(selectedVehicle.internalNotes, 150)}
                        {selectedVehicle.internalNotes.length > 150 && (
                          <button
                            onClick={() => setExpandedNotes(prev => ({ ...prev, internal: !prev.internal }))}
                            className="ml-2 text-yellow-600 hover:text-yellow-800 underline text-xs"
                          >
                            {expandedNotes.internal ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditVehicle(selectedVehicle);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit Vehicle
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading vehicles...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error loading vehicles</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Button onClick={() => fetchVehicles()} className="bg-blue-600 hover:bg-blue-700 text-white">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vehicle Management</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Track and manage information of vehicles that have used our services</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => fetchVehicles()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Vehicle
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalVehicles}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{filteredCars.filter(car => car.status === 'Active').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">VIP</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{filteredCars.filter(car => car.status === 'VIP').length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">New</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredCars.filter(car => car.status === 'New').length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Wash</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{filteredCars.filter(car => car.washStatus && car.washStatus !== 'finished' && car.washStatus !== 'cancelled' && car.washStatus !== 'collected').length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(filteredCars.reduce((sum, car) => sum + car.totalSpent, 0))}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by license plate, owner name, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="VIP">VIP</option>
                  <option value="New">New</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedWashStatus}
                  onChange={(e) => setSelectedWashStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >                  <option value="All">All Wash Status</option>
                  <option value="None">No Active Wash</option>
                  <option value="pending">Pending</option>
                  <option value="started">Started</option>
                  <option value="late">Late</option>
                  <option value="finished">Finished</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="collected">Collected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Vehicle Info</th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Owner</th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Wash Status</th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCars.map((car) => (
                  <tr key={car.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{car.licensePlate.substring(0, 2)}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{car.licensePlate}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{car.brand} {car.model} {car.year}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{car.color} • {car.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{car.ownerName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{car.phone}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(car.status)}`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {car.washStatus ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getWashStatusColor(car.washStatus)}`}>
                          {getWashStatusDisplay(car.washStatus)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No active wash</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(car)}
                          className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditVehicle(car)}
                          className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteVehicle(car)}
                          className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalVehicles)} to{' '}
              {Math.min(currentPage * itemsPerPage, totalVehicles)} of {totalVehicles} vehicles
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>

        {/* Detail Modal */}
        <DetailModal />

        {/* Edit Modal */}
        <EditModal />
      </div>
    </DashboardLayout>
  );
}
