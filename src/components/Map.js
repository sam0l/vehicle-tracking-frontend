import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configure Leaflet default icon paths
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = () => {
  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const response = await fetch('https://vehicle-tracking-backend-bwmz.onrender.com/api/detections');
        const data = await response.json();
        // Ensure data is an array
        setDetections(Array.isArray(data) ? data : []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching detections:', error);
        setDetections([]);
        setIsLoading(false);
      }
    };

    fetchDetections();
    const interval = setInterval(fetchDetections, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">Loading detections...</div>;
  }

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {detections && detections.length > 0 && detections.map((detection) => (
        <Marker key={detection.id} position={[detection.latitude, detection.longitude]}>
          <Popup>
            <div>
              <p><strong>Timestamp:</strong> {new Date(detection.timestamp).toLocaleString()}</p>
              <p><strong>Speed:</strong> {detection.speed} km/h</p>
              <p><strong>Sign Type:</strong> {detection.sign_type || 'N/A'}</p>
              {detection.image && (
                <img src={`data:image/jpeg;base64,${detection.image}`} alt="Detection" className="w-24 h-24" />
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
