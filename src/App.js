import React, { useState, useEffect } from 'react';
   import axios from 'axios';
   import MapComponent from './components/Map';
   import Dashboard from './components/Dashboard';
   import DetectionTable from './components/DetectionTable';
   import './index.css';

   const App = () => {
     const [telemetry, setTelemetry] = useState([]);
     const [detections, setDetections] = useState([]);

     useEffect(() => {
       const fetchData = async () => {
         try {
           const telemetryRes = await axios.get('https://<your-backend-url>/api/telemetry');
           const detectionsRes = await axios.get('https://<your-backend-url>/api/detections');
           setTelemetry(telemetryRes.data);
           setDetections(detectionsRes.data);
         } catch (error) {
           console.error('Error fetching data:', error);
         }
       };
       fetchData();
       const interval = setInterval(fetchData, 5000); // Update every 5 seconds
       return () => clearInterval(interval);
     }, []);

     return (
       <div className="container mx-auto p-4">
         <h1 className="text-2xl font-bold mb-4">Vehicle Tracking Dashboard</h1>
         <div className="grid grid-cols-2 gap-4">
           <div>
             <h2 className="text-xl">Real-Time Map</h2>
             <MapComponent telemetry={telemetry} />
           </div>
           <div>
             <Dashboard telemetry={telemetry} />
           </div>
         </div>
         <h2 className="text-xl mt-4">Traffic Sign Detections</h2>
         <DetectionTable detections={detections} />
       </div>
     );
   };

   export default App;
