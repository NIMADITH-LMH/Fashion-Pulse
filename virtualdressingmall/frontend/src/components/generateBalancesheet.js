import React, { useEffect, useState } from "react";
import SummaryApi from "../common";
import { useSelector } from "react-redux";
const GenerateBalance = () => {
    const user = useSelector((state) => state?.user?.user);
    const [order, setOrder] = useState([]);
  const [data, setData] = useState({
    totalSales: 0,
    pendingRevenue: 0,
    totalCompletedOrders: 0,
    totalPendingOrders: 0,
  });

  const fetchBalanceSheet = async () => {
    try {
      const response = await fetch(`${SummaryApi.generateBalanceSheet.url}?shopId=${user?._id}`);
      const dataResponse = await response.json();
  
      console.log("Balance Sheet Data:", dataResponse);
      if (dataResponse.success && dataResponse.data) {
        setData({
          totalSales: dataResponse.data.totalSales,
          pendingRevenue: dataResponse.data.pendingRevenue,
          totalCompletedOrders: dataResponse.data.totalCompletedOrders,
          totalPendingOrders: dataResponse.data.totalPendingOrders,
        });
        setOrder(dataResponse.data.orders);
      } else {
        console.error("Unexpected data format:", dataResponse);
      }
    } catch (err) {
      console.error("Error fetching balance sheet:", err);
    }
  };
  
  
  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold mb-8">Order Balance Sheet</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Completed Orders</h2>
          <div className="flex justify-between py-2 border-b">
            <span>Total Sales</span>
            <span>Rs.{data.totalSales.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Completed Orders</span>
            <span>{data.totalCompletedOrders}</span>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Pending Orders</h2>
          <div className="flex justify-between py-2 border-b">
            <span>Pending Revenue</span>
            <span>Rs.{data.pendingRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span>Pending Orders</span>
            <span>{data.totalPendingOrders}</span>
          </div>
        </div>
      </div>
      <div className="mt-10 bg-white rounded-2xl shadow-md p-6 w-full max-w-2xl">
        <h3 className="text-2xl font-semibold mb-4">Summary</h3>
        <div className="flex justify-between text-xl py-2 border-b">
          <span>Total Completed Sales</span>
          <span className="font-bold">Rs.{data.totalSales.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xl py-2 border-b">
          <span>Total Pending Revenue</span>
          <span className="font-bold">Rs.{data.pendingRevenue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xl mt-4">
          <span>Net Revenue (Completed - Pending)</span>
          <span className="font-bold text-green-600">
            Rs.{(data.totalSales - data.pendingRevenue).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GenerateBalance;
