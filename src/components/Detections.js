import React, { useState, useEffect } from 'react';

const Detections = () => {
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 3;

  const fetchDetections = async (pageNum = 1) => {
    try {
      const skip = (pageNum - 1) * limit;
      const response = await fetch(
        `https://vehicle-tracking-backend-bwmz.onrender.com/api/detections?skip=${skip}&limit=${limit}`
      );
      const data = await response.json();
      
      if (data.data) {
        setDetections(data.data);
        setHasMore(data.data.length === limit);
        setError(null);
      } else {
        setDetections([]);
        setHasMore(false);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching detections:', error);
      setError('Failed to load detections. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections(page);
    const interval = setInterval(() => fetchDetections(page), 5000);
    return () => clearInterval(interval);
  }, [page]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading detections...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Latest Detections</h2>
      {detections.length === 0 ? (
        <p>No detections available.</p>
      ) : (
        <>
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
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Detections;
