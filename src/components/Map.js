import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = () => {
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

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
      setError('Failed to load map data. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections(page);
    const interval = setInterval(() => fetchDetections(page), 5000);
    return () => clearInterval(interval);
  }, [page]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading map data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  const center = detections.length > 0
    ? [detections[0].latitude, detections[0].longitude]
    : [0, 0];

  return (
    <div className="h-[600px] relative">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {detections.map((detection) => (
          <Marker
            key={detection.id}
            position={[detection.latitude, detection.longitude]}
          >
            <Popup>
              <div>
                <p><strong>Speed:</strong> {detection.speed} km/h</p>
                <p><strong>Time:</strong> {new Date(detection.timestamp).toLocaleString()}</p>
                {detection.sign_type && (
                  <p><strong>Sign Type:</strong> {detection.sign_type}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg">
        <div className="flex space-x-4">
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
      </div>
    </div>
  );
};

export default Map;
