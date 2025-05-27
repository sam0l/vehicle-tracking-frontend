import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { backendUrl } from '../config';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapUpdater = ({ map, center, zoom }) => {
  useEffect(() => {
    if (map && center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
};

const Map = () => {
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;
  const [map, setMap] = useState(null);

  const fetchDetections = async (pageNum = 1) => {
    try {
      const skip = (pageNum - 1) * limit;
      const response = await fetch(
        `${backendUrl}/api/detections?skip=${skip}&limit=${limit}`
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

  // Default initial center, e.g., Singapore. The map will pan to the latest point once data loads.
  const initialCenter = [1.3521, 103.8198]; 
  const preferredZoom = 17; // Define a closer zoom level
  const latestDetection = detections.length > 0 ? detections[0] : null;
  const latestPosition = latestDetection ? [latestDetection.latitude, latestDetection.longitude] : null;

  const pathPositions = detections.map(detection => [detection.latitude, detection.longitude]);

  return (
    <div className="h-[600px] relative">
      <MapContainer
        center={initialCenter} // Use a fixed initial center
        zoom={preferredZoom} // Use the new preferred zoom for initialization
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap} // Get the map instance
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Show a single marker for the latest position */}
        {latestDetection && (
          <Marker
            key={`current-${latestDetection.id}`}
            position={latestPosition}
          >
            <Popup>
              <div>
                <p><strong>Speed:</strong> {latestDetection.speed} km/h</p>
                <p><strong>Time:</strong> {new Date(latestDetection.timestamp).toLocaleString()}</p>
                {latestDetection.sign_type && (
                  <p><strong>Sign Type:</strong> {latestDetection.sign_type}</p>
                )}
                {/* You can add more details from latestDetection here */}
              </div>
            </Popup>
          </Marker>
        )}
        {pathPositions.length > 0 && <Polyline pathOptions={{ color: 'blue' }} positions={pathPositions} />}
        {map && latestPosition && <MapUpdater map={map} center={latestPosition} zoom={preferredZoom} />} // Always use preferredZoom
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
