import React from 'react';
import { Link } from 'react-router-dom';



const Dashboard = () => (
  <div className="flex">
    {/* Sidebar */}
 

    {/* Main content */}
    <div className="flex-1 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      {/* You can add the body content of your dashboard here */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* Example card placeholders */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">New Orders</h3>
          <p>156</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">Confirm Orders</h3>
          <p>88</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">New Reviews</h3>
          <p>243</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold">New Discussions</h3>
          <p>144</p>
        </div>
      </div>

      {/* Additional content (charts, tables, etc.) */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <h2 className="text-xl mb-4">Total Sales Revenue</h2>
        {/* Add chart or other relevant information here */}
      </div>

      {/* Top sales, graphs, or additional sections */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl mb-4">Top Sales</h2>
        {/* Add top sales table or graph */}
      </div>
    </div>
  </div>
);

export default Dashboard;
