import React, { useState, useEffect } from 'react';

const SpeedDisplay = () => {
  const [currentSpeed, setCurrentSpeed] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpeed = async () => {
      try {
        const response = await fetch(
          'https://vehicle-tracking-backend-bwmz.onrender.com/api/detections?limit=1'
        );
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          setCurrentSpeed(data.data[0].speed);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching speed:', error);
        setError('Failed to fetch speed data');
      }
    };

    fetchSpeed();
    const interval = setInterval(fetchSpeed, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Speed</h2>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : currentSpeed === null ? (
        <div className="text-gray-500">Loading...</div>
      ) : (
        <div className="flex items-center justify-center">
          <span className="text-4xl font-bold text-blue-600">{currentSpeed}</span>
          <span className="ml-2 text-gray-500">km/h</span>
        </div>
      )}
    </div>
  );
};

export default SpeedDisplay; 