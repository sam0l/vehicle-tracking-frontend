import React from 'react';

   const Dashboard = ({ telemetry }) => {
     const latest = telemetry[telemetry.length - 1];
     return (
       <div>
         <h2 className="text-xl">Current Data</h2>
         {latest && (
           <div>
             <p>Speed: {latest.speed} km/h</p>
             <p>Coordinates: ({latest.latitude}, {latest.longitude})</p>
           </div>
         )}
       </div>
     );
   };

   export default Dashboard;
