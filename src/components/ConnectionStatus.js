import React, { useState, useEffect } from 'react';
import { backendUrl } from '../config';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleString('en-SG', {
        timeZone: 'Asia/Singapore',
        year: 'numeric',
        month: 'numeric', // e.g., 5 instead of 05
        day: 'numeric',   // e.g., 28 instead of 28
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true      // Use AM/PM
      });
    } catch (error) {
      console.error("Error formatting date:", date, error);
      return "Invalid Date";
    }
  };

  const isRecentData = (timestamp) => {
    const now = new Date();
    const dataTime = new Date(timestamp);
    const diffMinutes = (now - dataTime) / (1000 * 60);
    return diffMinutes <= 5; // Consider data recent if within last 5 minutes
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/device_status`,
          {
            headers: {
              'Accept': 'application/json',
            },
            mode: 'cors',
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setIsConnected(data.status === 'connected');
        setLastSeen(data.last_seen);
        setError(data.message);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        console.error('Error checking connection:', error);
        setIsConnected(false);
        setError('Connection error');
        
        // Implement retry logic
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(checkConnection, 2000); // Retry after 2 seconds
        }
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [retryCount]);

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">
          {isConnected ? 'Device Connected' : 'Device Disconnected'}
        </span>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
          {retryCount > 0 && <span className="ml-1">(Retrying... {retryCount}/3)</span>}
        </p>
      )}
      {lastSeen && (
        <p className="text-xs text-gray-500 mt-1">
          Last seen: {formatDate(lastSeen)}
        </p>
      )}
    </div>
  );
};

export default ConnectionStatus; 