import React, { useState, useEffect } from 'react';

const Detections = () => {
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const response = await fetch('https://vehicle-tracking-backend-bwmz.onrender.com/api/detections');
        const data = await response.json();
        // Ensure data is an array and take latest 3
        setDetections(Array.isArray(data) ? data.slice(0, 3) : []);
        setError(null);
      } catch (error) {
        console.error('Error fetching detections:', error);
        setDetections([]);
        setError('Failed to load detections. Please try again later.');
      }
    };

    fetchDetections();
    const interval = setInterval(fetchDetections, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Latest Detections</h2>
      {detections.length === 0 ? (
        <p>No detections available.</p>
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
            {detections.map((detection) => (
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

export default Detections;
