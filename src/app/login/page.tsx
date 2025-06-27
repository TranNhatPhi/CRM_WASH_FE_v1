'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);        // Simulate login process
        setTimeout(() => {
            setIsLoading(false);
            router.push('/pos'); // Redirect to POS after login
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex relative"
            style={{
                background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 50%, #0288D1 100%)'
            }}>

            {/* Top Blue Bar */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-blue-400 to-blue-600"></div>

            {/* Left Panel - Login Form */}
            <div className="w-1/3 bg-gray-100 p-8 flex flex-col justify-center relative">
                <div className="max-w-sm mx-auto w-full">
                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <label className="text-gray-700 font-medium text-sm">Login :</label>
                            </div>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 text-sm"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <label className="text-gray-700 font-medium text-sm">Password :</label>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 text-sm"
                                required
                            />
                        </div>

                        {/* Login Button */}
                        <div className="flex justify-center mt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-2 bg-gray-300 text-gray-700 border border-gray-400 hover:bg-gray-400 transition-colors disabled:opacity-50 text-sm"
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </div>
                    </form>

                    {/* Support Contact */}
                    <div className="mt-16 text-center">
                        <h3 className="text-gray-700 font-medium mb-2 text-sm">Support Contact</h3>
                        <p className="text-gray-600 text-sm">Imagatec</p>
                        <p className="text-gray-600 text-sm">1300 365 443</p>
                    </div>

                    {/* Bottom Buttons */}
                    <div className="mt-16 space-y-2">
                        <button
                            onClick={() => router.push('/pos')}
                            className="w-full py-3 bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            TRAINING MODE
                        </button>
                        <button
                            className="w-full py-3 bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                            SYSTEM INFO
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel - Dashboard Cards */}
            <div className="flex-1 p-4 grid grid-cols-2 gap-4">
                {/* Top Row */}
                <div className="bg-blue-500 text-white flex items-center justify-center text-2xl font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-colors cursor-pointer"
                    onClick={() => router.push('/pos-dashboard')}>
                    <div className="text-center">
                        <div>Point of Sale</div>
                    </div>
                </div>
                <div className="bg-blue-500 text-white flex items-center justify-center text-2xl font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-colors cursor-pointer"
                    onClick={() => router.push('/pocketpos')}>
                    <div className="text-center">
                        <div>PocketPOS</div>
                    </div>
                </div>

                {/* Middle Row */}
                <div className="bg-blue-500 text-white flex items-center justify-center text-2xl font-bold col-span-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors cursor-pointer">
                    <div className="text-center flex items-center space-x-3">
                        <Clock className="w-8 h-8" />
                        <span>Time Clock</span>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="bg-blue-500 text-white flex items-center justify-center text-2xl font-bold col-span-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors cursor-pointer">
                    <div className="text-center flex items-center space-x-3">
                        <Users className="w-8 h-8" />
                        <span>Manager</span>
                    </div>                </div>
            </div>

            {/* Bottom Version Bar */}
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-4 py-1">
                POS v1.30.36 JUN 2025
            </div>
        </div>
    );
}
