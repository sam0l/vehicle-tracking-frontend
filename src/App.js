import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './index.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function App() {
  const [telemetry, setTelemetry] = useState([]);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching telemetry data...');
        const telemetryRes = await axios.get('https://vehicle-tracking-backend-bwmz.onrender.com/api/telemetry');
        console.log('Telemetry response:', telemetryRes.data);
        setTelemetry(telemetryRes.data || []);

        console.log('Fetching detections data...');
        const detectionsRes = await axios.get('https://vehicle-tracking-backend-bwmz.onrender.com/api/detections');
        console.log('Detections response:', detectionsRes.data);
        setDetections(detectionsRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err.message, err.response?.data);
        setError('Failed to load data. Please try again later.');
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const path = telemetry.map(point => [point.latitude, point.longitude]);
  const latestPoint = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vehicle Tracking Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="mb-4">
        <h2 className="text-xl mb-2">Real-Time Map</h2>
        <div style={{ height: '400px', width: '100%' }}>
          <MapContainer center={[37.7749, -122.4194]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {latestPoint && (
              <Marker position={[latestPoint.latitude, latestPoint.longitude]} />
            )}
            {path.length > 1 && <Polyline positions={path} color="blue" />}
          </MapContainer>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl mb-2">Latest Telemetry</h2>
        {latestPoint ? (
          <div>
            <p>Speed: {latestPoint.speed} km/h</p>
            <p>Coordinates: ({latestPoint.latitude}, {latestPoint.longitude})</p>
            <p>Timestamp: {new Date(latestPoint.timestamp).toLocaleString()}</p>
          </div>
        ) : (
          <p>No telemetry data available.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl mb-2">Traffic Sign Detections</h2>
        {detections.length > 0 ? (
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Sign Type</th>
                <th className="border p-2">Image</th>
                <th className="border p-2">Coordinates</th>
                <th className="border p-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {detections.map((det, index) => (
                <tr key={index}>
                  <td className="border p-2">{det.sign_type}</td>
                  <td className="border p-2">
                    <img
                      src={`data:image/jpeg;base64,${det.image}`}
                      alt="Traffic Sign"
                      className="w-24"
                    />
                  </td>
                  <td className="border p-2">({det.latitude}, {det.longitude})</td>
                  <td className="border p-2">{new Date(det.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No detections available.</p>
        )}
      </div>
    </div>
  );
}

export default App;
