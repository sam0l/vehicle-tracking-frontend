import React, { useState, useEffect } from 'react';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(
          'https://vehicle-tracking-backend-bwmz.onrender.com/api/detections?limit=1'
        );
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          setIsConnected(true);
          setLastSeen(new Date(data.data[0].timestamp));
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        setIsConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

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
          Last seen: {lastSeen.toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default ConnectionStatus; 