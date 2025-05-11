import React, { useState, useEffect } from 'react';
import { backendUrl } from '../config';

const SpeedDisplay = () => {
  const [currentSpeed, setCurrentSpeed] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-SG', {
      timeZone: 'Asia/Singapore',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const isRecentData = (timestamp) => {
    const now = new Date();
    const dataTime = new Date(timestamp);
    const diffMinutes = (now - dataTime) / (1000 * 60);
    return diffMinutes <= 5; // Consider data recent if within last 5 minutes
  };

  useEffect(() => {
    const fetchSpeed = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/detections?limit=1`,
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
          const timestamp = data.data[0].timestamp;
          const isRecent = isRecentData(timestamp);
          
          if (isRecent) {
            setCurrentSpeed(data.data[0].speed);
            setLastUpdate(timestamp);
            setError(null);
            setRetryCount(0); // Reset retry count on success
          } else {
            setCurrentSpeed(null);
            setError('Speed data is stale');
          }
        } else {
          setCurrentSpeed(null);
          setError('No speed data available');
        }
      } catch (error) {
        console.error('Error fetching speed:', error);
        setError('Failed to fetch speed data');
        setCurrentSpeed(null);
        
        // Implement retry logic
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          setTimeout(fetchSpeed, 2000); // Retry after 2 seconds
        }
      }
    };

    fetchSpeed();
    const interval = setInterval(fetchSpeed, 5000);
    return () => clearInterval(interval);
  }, [retryCount]);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Speed</h2>
      {error ? (
        <div className="text-red-500">
          {error}
          {retryCount > 0 && <span className="ml-2">(Retrying... {retryCount}/3)</span>}
        </div>
      ) : currentSpeed === null ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="flex items-center justify-center">
            <span className="text-4xl font-bold text-blue-600">{currentSpeed}</span>
            <span className="ml-2 text-gray-500">km/h</span>
          </div>
          {lastUpdate && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Last updated: {formatDate(lastUpdate)}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default SpeedDisplay; 