import React, { useState, useEffect } from "react";
import { getSalesReport } from "../common/index";
import { Line } from "react-chartjs-2";

const SalesReport = () => {
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      const result = await getSalesReport();
      setOrders(result.orders);

      const dates = result.orders.map(order => new Date(order.createdAt).toLocaleDateString());
      const sales = result.orders.map(order => order.TotalAmount);

      setChartData({
        labels: dates,
        datasets: [{ label: "Sales Over Time", data: sales, borderColor: "#3498db", fill: false }],
      });
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg mt-4">
      <h2 className="text-2xl font-semibold mb-4">📈 Sales Analysis</h2>
      <Line data={chartData} />
    </div>
  );
};

export default SalesReport;
