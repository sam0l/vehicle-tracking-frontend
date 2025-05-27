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
  console.log('[MapUpdater] Props received - Center:', center, 'Zoom:', zoom, 'Map Instance:', map ? 'Exists' : 'Missing');
  useEffect(() => {
    if (map && center) {
      console.log('[MapUpdater] Calling map.setView with Center:', center, 'Zoom:', zoom);
      map.setView(center, zoom);
    } else {
      if (!map) console.log('[MapUpdater] map instance is not yet available.');
      if (!center) console.log('[MapUpdater] center is not yet available (latestPosition might be null).');
    }
  }, [map, center, zoom]);
  return null;
};

const Map = () => {
  const [detections, setDetections] = useState([]); // For drawing the historical path
  const [latestDetectionForMap, setLatestDetectionForMap] = useState(null); // For current marker, popup, and centering
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null); // State to hold the map instance
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 50;

  // Original fetchDetections - fetches a list of recent detections for the path
  const fetchDetectionsForPath = async (currentPage = 1) => {
    try {
      const skip = (currentPage - 1) * limit;
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
    } catch (error) {
      console.error('Error fetching detections:', error);
      setError('Failed to load map data. Please try again later.');
    }
  };

  // New function to fetch the latest detection for the map marker and centering
  const fetchLatestDetectionForMap = async () => {
    try {
      // Assuming the API sorts by newest first by default, or supports ordering.
      // Fetch page 1, limit 1 to get the single latest detection.
      const response = await fetch(`${backendUrl}/api/detections?skip=0&limit=1`); 
      const data = await response.json();
      if (data && data.data && data.data.length > 0) {
        console.log('[MapComponent] Fetched new latest detection for marker:', data.data[0]);
        setLatestDetectionForMap(data.data[0]);
        // Clear main error if this specific fetch is successful
        // Avoids error message from path fetch overwriting a successful marker update
        // setError(null); // Be cautious if path also sets errors
      } else {
        console.log('[MapComponent] No latest detection found for marker or empty data array.');
        // Optionally set to null if no data, or keep stale: setLatestDetectionForMap(null);
      }
    } catch (error) {
      console.error('Error fetching latest detection for marker:', error);
      // Consider a specific error state for this if needed, or add to a general error list
      // setError('Failed to fetch latest vehicle position.'); 
    }
  };

  useEffect(() => {
    // Initial fetches
    fetchDetectionsForPath(page);
    fetchLatestDetectionForMap();

    // Interval for fetching the list of detections for the path
    const pathInterval = setInterval(() => fetchDetectionsForPath(page), 7000); // e.g., every 7 seconds
    
    // Interval for fetching the single latest detection for the marker (more frequent)
    const latestDetectionInterval = setInterval(fetchLatestDetectionForMap, 3000); // e.g., every 3 seconds

    return () => {
      clearInterval(pathInterval);
      clearInterval(latestDetectionInterval);
    };
  }, [page]); // Re-run if 'page' changes for the path

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  // Default initial center, e.g., Singapore. The map will pan to the latest point once data loads.
  const initialCenter = [1.3521, 103.8198]; 
  const preferredZoom = 19; // Further increased zoom level
  const latestPosition = latestDetectionForMap ? [latestDetectionForMap.latitude, latestDetectionForMap.longitude] : null;
  console.log('[MapComponent] Detections:', detections);
  console.log('[MapComponent] Latest Detection for Map:', latestDetectionForMap);
  console.log('[MapComponent] Latest Position for map center:', latestPosition);

  // Path uses the 'detections' state, which is a list of recent points
  const pathPositions = detections.length > 0 ? detections.map(detection => [detection.latitude, detection.longitude]) : [];

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
        {latestDetectionForMap && (
          <Marker
            key={`current-${latestDetectionForMap.id}`}
            position={latestPosition}
          >
            <Popup>
              <div>
                <p><strong>Speed:</strong> {latestDetectionForMap.speed} km/h</p>
                <p><strong>Time:</strong> {new Date(latestDetectionForMap.timestamp).toLocaleString()}</p>
                {latestDetectionForMap.sign_label && (
                  <p><strong>Sign:</strong> {latestDetectionForMap.sign_label}</p>
                )}
                {latestDetectionForMap.image && (
                  <div>
                    <p><strong>Image:</strong></p>
                    <img src={latestDetectionForMap.image} alt={latestDetectionForMap.sign_label || 'Detection Image'} style={{maxWidth: '200px', maxHeight: '200px'}} />
                  </div>
                )}
                {/* You can add more details from latestDetection here */}
              </div>
            </Popup>
          </Marker>
        )}
        {pathPositions.length > 0 && <Polyline pathOptions={{ color: 'blue' }} positions={pathPositions} />}
        {latestDetectionForMap && latestPosition && <MapUpdater map={map} center={latestPosition} zoom={preferredZoom} />} // Always use preferredZoom
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

// Renamed fetchDetections to fetchDetectionsForPath for clarity
// Added fetchLatestDetectionForMapMarker for the current marker logic
export default Map;
