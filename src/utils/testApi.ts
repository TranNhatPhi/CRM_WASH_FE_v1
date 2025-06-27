// Test API endpoint
// Usage: Open this URL in browser or use curl
// http://localhost:3000/api/vehicles/pagination?page=1&limit=5

export const testVehiclesPagination = async (page = 1, limit = 5) => {
    try {
        const response = await fetch(`/api/vehicles/pagination?page=${page}&limit=${limit}`);
        const data = await response.json();
        console.log('API Response:', data);
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
};

// Test function - call this in browser console
if (typeof window !== 'undefined') {
    (window as any).testVehiclesPagination = testVehiclesPagination;
}
