import React, { useState, useEffect } from 'react';
import { backendUrl } from '../config';

const ConnectionStatus = () => {
  const [lastSeen, setLastSeen] = useState(null);
  const isConnected = true; // Always connected
  const error = null; // No errors
  
  // Fetch the latest detection to get its timestamp
  useEffect(() => {
    const fetchLatestDetection = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/detections?limit=1`);
        const data = await response.json();
        if (data && data.data && data.data.length > 0) {
          // Use frontend_timestamp if available, otherwise fall back to timestamp
          const detection = data.data[0];
          setLastSeen(detection.frontend_timestamp || detection.timestamp);
        }
      } catch (error) {
        console.error('Error fetching latest detection:', error);
      }
    };
    
    fetchLatestDetection();
    const interval = setInterval(fetchLatestDetection, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

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

  // Timestamp is updated via the latest detection fetch

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">
          {isConnected ? 'Device Connected' : 'Device Disconnected'}
        </span>
      </div>

      {lastSeen && (
        <p className="text-xs text-gray-500 mt-1">
          Last seen: {formatDate(lastSeen)}
        </p>
      )}
    </div>
  );
};

export default ConnectionStatus; 