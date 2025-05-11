import React, { useState, useEffect } from 'react';
import { backendUrl } from '../config';

const PastLogs = () => {
  const [pastDetections, setPastDetections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPastDetections = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/past_detections`);
        const data = await response.json();
        // Ensure data is an array
        setPastDetections(Array.isArray(data) ? data : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching past detections:', error);
        setPastDetections([]);
        setError('Failed to load past detections. Please try again later.');
      }
    };

    fetchPastDetections();
    const interval = setInterval(fetchPastDetections, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Past Logs</h2>
      {pastDetections.length === 0 ? (
        <p>No past detections available.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Timestamp</th>
              <th className="border p-2">Latitude</th>
              <th className="border p-2">Longitude</th>
              <th className="border p-2">Speed</th>
              <th className="border p-2">Sign Type</th>
              <th className="border p-2">Image</th>
            </tr>
          </thead>
          <tbody>
            {pastDetections.map((detection) => (
              <tr key={detection.id}>
                <td className="border p-2">{new Date(detection.timestamp).toLocaleString()}</td>
                <td className="border p-2">{detection.latitude}</td>
                <td className="border p-2">{detection.longitude}</td>
                <td className="border p-2">{detection.speed}</td>
                <td className="border p-2">{detection.sign_type || 'N/A'}</td>
                <td className="border p-2">
                  {detection.image ? (
                    <img src={`data:image/jpeg;base64,${detection.image}`} alt="Detection" className="w-24 h-24 object-cover" />
                  ) : (
                    'No Image'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PastLogs;

