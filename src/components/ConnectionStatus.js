import React, { useState, useEffect } from 'react';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(
          'https://vehicle-tracking-backend-bwmz.onrender.com/api/detections?limit=1',
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
        
        if (data.data && data.data.length > 0) {
          setIsConnected(true);
          setLastSeen(new Date(data.data[0].timestamp));
          setError(null);
          setRetryCount(0); // Reset retry count on success
        } else {
          setIsConnected(false);
          setError('No data available');
        }
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
          Last seen: {lastSeen.toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default ConnectionStatus; 