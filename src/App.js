import React, { useState } from 'react';
import Map from './components/Map';
import Detections from './components/Detections';
import SpeedDisplay from './components/SpeedDisplay';
import ConnectionStatus from './components/ConnectionStatus';
import SimDataDisplay from './components/SimDataDisplay';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Tracking Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="col-span-1">
              <SpeedDisplay />
            </div>
            <div className="col-span-1">
              <ConnectionStatus />
            </div>
            <div className="col-span-1">
              <SimDataDisplay />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`${
                    activeTab === 'map'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  Map View
                </button>
                <button
                  onClick={() => setActiveTab('detections')}
                  className={`${
                    activeTab === 'detections'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                >
                  Latest Detections
                </button>
              </nav>
            </div>

            <div className="p-4">
              {activeTab === 'map' ? <Map /> : <Detections />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
