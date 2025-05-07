import React, { useState } from 'react';
import Map from './components/Map';
import Detections from './components/Detections';
import PastLogs from './components/PastLogs';

function App() {
  const [activeTab, setActiveTab] = useState('detections');

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center py-4">Vehicle Tracking Dashboard</h1>
      <div className="flex justify-center mb-4">
        <button
          className={`px-4 py-2 mx-2 rounded ${activeTab === 'detections' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('detections')}
        >
          Latest Detections
        </button>
        <button
          className={`px-4 py-2 mx-2 rounded ${activeTab === 'past_logs' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('past_logs')}
        >
          Past Logs
        </button>
      </div>
      <div className="container mx-auto p-4">
        {activeTab === 'detections' ? <Detections /> : <PastLogs />}
        <Map />
      </div>
    </div>
  );
}

export default App;
