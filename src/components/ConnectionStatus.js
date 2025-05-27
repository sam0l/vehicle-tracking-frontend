import React, { useState } from 'react';

const ConnectionStatus = () => {
  const [lastSeen] = useState("2025-05-27T13:14:39Z");
  const isConnected = true; // Always connected

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

  // Using fixed timestamp

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