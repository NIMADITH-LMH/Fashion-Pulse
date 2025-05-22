import React, { useState, useEffect } from "react";
import { getSalesReport } from "../common/index";

const Dashboard = () => {
  const [data, setData] = useState({ totalRevenue: 0, totalOrders: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const result = await getSalesReport();
      setData(result);
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">📊 Order Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-500 text-white p-4 rounded-lg">
          <h3 className="text-lg">Total Revenue</h3>
          <p className="text-2xl font-bold">Rs.{data.totalRevenue}</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg">
          <h3 className="text-lg">Total Orders</h3>
          <p className="text-2xl font-bold">{data.totalOrders}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
