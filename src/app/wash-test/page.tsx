import DemoWashController from '@/components/DemoWashController';

export default function WashTestPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Wash Controller - Booking Management</h1>
                    <p className="text-gray-600">
                        Manage existing bookings and their wash states.
                        Select a booking from the list below to control its wash process through different states.
                    </p>
                </div>

                <DemoWashController />

                {/* Instructions */}
                <div className="mt-8 p-4 bg-white rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-3">How to Use:</h2>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        <li>Browse through existing bookings in the grid above</li>
                        <li>Click on any booking card to select it</li>
                        <li>View detailed booking information and current status</li>
                        <li>Use the Smart Wash Controller to manage the wash process</li>
                        <li>Progress through different states: Draft → In Progress → Departed → Completed</li>
                        <li>Watch as the vehicle wash status updates in real-time</li>
                    </ol>

                    <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                        <h3 className="font-medium text-yellow-800 mb-1">State Flow:</h3>
                        <p className="text-sm text-yellow-700">
                            <strong>Primary Flow:</strong> Draft → In Progress → Departed → Completed
                            <br />
                            <strong>Alternative:</strong> Draft → Booked → In Progress → Departed → Completed
                            <br />
                            <strong>Cancel:</strong> Available from Booked and In Progress states
                        </p>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <h3 className="font-medium text-blue-800 mb-1">Features:</h3>
                        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                            <li>Real-time booking status updates</li>
                            <li>Vehicle wash status tracking</li>
                            <li>Service and pricing information</li>
                            <li>State transition validation</li>
                            <li>Complete audit trail in booking_state table</li>
                        </ul>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                        <h3 className="font-medium text-green-800 mb-1">Database Tables Updated:</h3>
                        <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
                            <li><code>bookings</code> - Main booking record with status</li>
                            <li><code>booking_state</code> - State transition history</li>
                            <li><code>booking_services</code> - Services included in booking</li>
                            <li><code>vehicles</code> - Vehicle wash status updates</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
