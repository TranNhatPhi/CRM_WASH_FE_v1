'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShoppingCart,
    Users,
    Car,
    TrendingUp,
    DollarSign,
    Calendar,
    Clock,
    Settings,
    BarChart3,
    CreditCard,
    Sun,
    Moon,
    ArrowRight
} from 'lucide-react';

export default function POSDashboard() {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const stats = [
        {
            title: 'Today\'s Sales',
            value: '$2,847.50',
            icon: DollarSign,
            color: 'text-green-500',
            bgColor: isDarkMode ? 'bg-green-500/10' : 'bg-green-50'
        },
        {
            title: 'Cars Washed',
            value: '47',
            icon: Car,
            color: 'text-blue-500',
            bgColor: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'
        },
        {
            title: 'Active Staff',
            value: '8',
            icon: Users,
            color: 'text-purple-500',
            bgColor: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50'
        },
        {
            title: 'Queue Length',
            value: '12',
            icon: Clock,
            color: 'text-orange-500',
            bgColor: isDarkMode ? 'bg-orange-500/10' : 'bg-orange-50'
        }
    ];

    const quickActions = [
        {
            title: 'Start New Sale',
            description: 'Process customer orders',
            icon: ShoppingCart,
            action: () => router.push('/pos'),
            color: 'from-blue-500 to-blue-600',
            primary: true
        },
        {
            title: 'View Reports',
            description: 'Sales and analytics',
            icon: BarChart3,
            action: () => router.push('/reports'),
            color: 'from-green-500 to-green-600'
        },
        {
            title: 'Manage Staff',
            description: 'Staff scheduling',
            icon: Users,
            action: () => router.push('/staff'),
            color: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Car Queue',
            description: 'Manage wash queue',
            icon: Car,
            action: () => router.push('/cars'),
            color: 'from-orange-500 to-orange-600'
        },
        {
            title: 'Payment History',
            description: 'Transaction records',
            icon: CreditCard,
            action: () => router.push('/payment'),
            color: 'from-indigo-500 to-indigo-600'
        },
        {
            title: 'Settings',
            description: 'System configuration',
            icon: Settings,
            action: () => router.push('/settings'),
            color: 'from-gray-500 to-gray-600'
        }
    ];
    return (
        <div className={`h-screen overflow-hidden transition-all duration-300 ${isDarkMode
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-blue-50 via-white to-gray-100'
            }`}>
            {/* Header */}
            <div className={`border-b shadow-lg backdrop-blur-sm ${isDarkMode
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-600'
                : 'bg-gradient-to-br from-blue-50 via-white to-gray-100 border-gray-200'
                }`}>
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                                <div className="text-xl">🚗</div>
                            </div>
                            <div>
                                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    Wash POS
                                </h1>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Point of Sale Dashboard
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className={`text-right ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <div className="text-sm font-semibold">
                                    {currentTime.toLocaleDateString()}
                                </div>
                                <div className="text-xs">
                                    {currentTime.toLocaleTimeString()}
                                </div>
                            </div>

                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isDarkMode
                                    ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Fixed Grid Layout */}
            <div className="h-[calc(100vh-80px)] max-w-7xl mx-auto px-4 py-4 grid grid-rows-[auto_1fr_auto] gap-4">
                {/* Stats Cards Row */}
                <div className="grid grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`rounded-lg p-4 border shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${isDarkMode
                                ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-gray-600'
                                : 'bg-gradient-to-br from-white via-white to-gray-50 border-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {stat.title}
                                    </p>
                                    <p className={`text-xl font-bold mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-12 gap-4 h-full">
                    {/* Quick Actions - Left Side */}
                    <div className="col-span-8 grid grid-cols-3 gap-3 auto-rows-fr">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.action}
                                className={`group relative overflow-hidden rounded-lg p-4 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isDarkMode
                                    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-gray-600 hover:border-gray-500'
                                    : 'bg-gradient-to-br from-white via-white to-gray-50 border-gray-200 hover:border-gray-300'
                                    } ${action.primary ? 'ring-2 ring-blue-500/50' : ''}`}
                            >
                                <div className="relative z-10 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white shadow-lg`}>
                                            <action.icon className="w-5 h-5" />
                                        </div>
                                        <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                    </div>
                                    <h3 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                        {action.title}
                                    </h3>
                                    <p className={`text-xs flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {action.description}
                                    </p>
                                </div>

                                {action.primary && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Status Cards - Right Side */}
                    <div className="col-span-4 grid grid-rows-2 gap-4">
                        {/* Current Queue Status */}
                        <div className={`rounded-lg p-4 border shadow-lg backdrop-blur-sm ${isDarkMode
                            ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-gray-600'
                            : 'bg-gradient-to-br from-white via-white to-gray-50 border-gray-200'
                            }`}>
                            <h3 className={`text-sm font-bold mb-3 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                <Clock className="w-4 h-4 mr-2 text-orange-500" />
                                Queue Status
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div className={`text-center py-2 rounded ${isDarkMode ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                                    <div className="font-bold text-lg">3</div>
                                    <div className="text-xs">Waiting</div>
                                </div>
                                <div className={`text-center py-2 rounded ${isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800'}`}>
                                    <div className="font-bold text-lg">2</div>
                                    <div className="text-xs">Late</div>
                                </div>
                                <div className={`text-center py-2 rounded ${isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-800'}`}>
                                    <div className="font-bold text-lg">5</div>
                                    <div className="text-xs">Started</div>
                                </div>
                                <div className={`text-center py-2 rounded ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                                    <div className="font-bold text-lg">2</div>
                                    <div className="text-xs">Finished</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className={`rounded-lg p-4 border shadow-lg backdrop-blur-sm ${isDarkMode
                            ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-gray-600'
                            : 'bg-gradient-to-br from-white via-white to-gray-50 border-gray-200'
                            }`}>
                            <h3 className={`text-sm font-bold mb-3 flex items-center ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                                Recent Activity
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className={`flex items-center justify-between py-1.5 px-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sale #98973 - $45.00</span>
                                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>2m</span>
                                </div>
                                <div className={`flex items-center justify-between py-1.5 px-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Car ABC123 completed</span>
                                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>5m</span>
                                </div>
                                <div className={`flex items-center justify-between py-1.5 px-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Staff John logged in</span>
                                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>10m</span>
                                </div>
                                <div className={`flex items-center justify-between py-1.5 px-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment processed</span>
                                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>15m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Status Bar */}
                <div className={`rounded-lg p-3 border backdrop-blur-sm ${isDarkMode
                    ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border-gray-600'
                    : 'bg-gradient-to-br from-white via-white to-gray-50 border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-6">
                            <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>System Online</span>
                            </div>
                            <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Last sync: {currentTime.toLocaleTimeString()}
                            </div>
                        </div>
                        <div className={`flex items-center space-x-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span>Active Users: 8</span>
                            <span>|</span>
                            <span>Today's Total: $2,847.50</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
