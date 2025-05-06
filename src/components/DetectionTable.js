import React from 'react';

   const DetectionTable = ({ detections }) => {
     return (
       <table className="w-full border-collapse border">
         <thead>
           <tr>
             <th className="border p-2">Image</th>
             <th className="border p-2">Coordinates</th>
             <th className="border p-2">Speed (km/h)</th>
             <th className="border p-2">Sign Type</th>
           </tr>
         </thead>
         <tbody>
           {detections.map((detection, index) => (
             <tr key={index}>
               <td className="border p-2">
                 <img src={`data:image/jpeg;base64,${detection.image}`} alt="Detection" className="w-24" />
               </td>
               <td className="border p-2">({detection.latitude}, {detection.longitude})</td>
               <td className="border p-2">{detection.speed}</td>
               <td className="border p-2">{detection.sign_type}</td>
             </tr>
           ))}
         </tbody>
       </table>
     );
   };

   export default DetectionTable;
