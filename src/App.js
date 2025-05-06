import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

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
  }, []);

  const path = telemetry.map(point => [point.latitude, point.longitude]);
  const latestPoint = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;

  return (
    <div className="App">
      <h1>Vehicle Tracking Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer center={[37.7749, -122.4194]} zoom={13} style={{ height: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {latestPoint && (
            <Marker position={[latestPoint.latitude, latestPoint.longitude]} />
          )}
          {path.length > 1 && <Polyline positions={path} color="blue" />}
        </MapContainer>
      </div>

      <div>
        <h2>Latest Telemetry</h2>
        {latestPoint ? (
          <p>
            Speed: {latestPoint.speed} km/h<br />
            Coordinates: {latestPoint.latitude}, {latestPoint.longitude}<br />
            Timestamp: {new Date(latestPoint.timestamp).toLocaleString()}
          </p>
        ) : (
          <p>No telemetry data available.</p>
        )}
      </div>

      <div>
        <h2>Detections</h2>
        {detections.length > 0 ? (
          <table border="1">
            <thead>
              <tr>
                <th>Sign Type</th>
                <th>Image</th>
                <th>Coordinates</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {detections.map((det, index) => (
                <tr key={index}>
                  <td>{det.sign_type}</td>
                  <td>
                    <img
                      src={`data:image/png;base64,${det.image}`}
                      alt="Traffic Sign"
                      style={{ width: '100px' }}
                    />
                  </td>
                  <td>{det.latitude}, {det.longitude}</td>
                  <td>{new Date(det.timestamp).toLocaleString()}</td>
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
