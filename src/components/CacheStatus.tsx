// Component hiển thị trạng thái cache và kết nối
import React from 'react';
import { Wifi, WifiOff, HardDrive, RefreshCw } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useServiceCache';

interface CacheStatusProps {
  isFromCache: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  isDarkMode: boolean;
}

export default function CacheStatus({ 
  isFromCache, 
  isLoading, 
  onRefresh, 
  isDarkMode 
}: CacheStatusProps) {
  const { isOnline, hasSynced } = useOfflineSync();

  return (
    <div className="flex items-center space-x-2">
      {/* Connection Status */}
      <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
        isOnline 
          ? isDarkMode 
            ? 'bg-green-900/40 text-green-300' 
            : 'bg-green-100 text-green-800'
          : isDarkMode 
            ? 'bg-red-900/40 text-red-300' 
            : 'bg-red-100 text-red-800'
      }`}>
        {isOnline ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <WifiOff className="w-3 h-3" />
        )}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {/* Cache Status */}
      {isFromCache && (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
          isDarkMode 
            ? 'bg-blue-900/40 text-blue-300' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          <HardDrive className="w-3 h-3" />
          <span>Cached</span>
        </div>
      )}

      {/* Sync Status */}
      {!isOnline && hasSynced && (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
          isDarkMode 
            ? 'bg-yellow-900/40 text-yellow-300' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          <RefreshCw className="w-3 h-3" />
          <span>Synced</span>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${
          isDarkMode 
            ? 'bg-gray-900/40 text-gray-300' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className={`p-1 rounded transition-all duration-200 ${
          isLoading 
            ? isDarkMode 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
        title="Refresh services"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}
