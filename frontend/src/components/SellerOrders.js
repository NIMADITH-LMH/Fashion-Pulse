import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import SummaryApi from '../common';
import { Switch } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SellerOrderView = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyIncomeData, setDailyIncomeData] = useState({});
  const user = useSelector((state) => state?.user?.user);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(SummaryApi.getOrderDetails.url);
        const dataResponse = await response.json();

        if (Array.isArray(dataResponse?.data)) {
          const sellerOrders = dataResponse.data.filter(
            (order) => order.productID?.ShopID === user?._id
          );
          setOrders(sellerOrders);
          setFilteredOrders(sellerOrders);
          calculateDailyIncome(sellerOrders);
        } else {
          console.error('Unexpected data format:', dataResponse);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?._id]);

  const calculateDailyIncome = (orders) => {
    const dailyIncome = {};

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const income = order.TotalAmount;

      if(order.Status==='Confirmed'){
        if (dailyIncome[orderDate]) {
          dailyIncome[orderDate] += income;
        } else {
          dailyIncome[orderDate] = income
      } }
        
  });

    const dates = Object.keys(dailyIncome);
    const incomes = Object.values(dailyIncome);

    setDailyIncomeData({
      labels: dates,
      datasets: [
        {
          label: 'Daily Income',
          data: incomes,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    });
  };

  const handleStatusChange = async (orderID, newStatus) => {
    try {
      const response = await axios.post(SummaryApi.updateOrderStatus.url, {
        orderID,
        status: newStatus,
      });

      if (response.data.success) {
        // Update both states
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderID ? { ...order, Status: newStatus } : order
          )
        );
        setFilteredOrders((prevFilteredOrders) =>
          prevFilteredOrders.map((order) =>
            order._id === orderID ? { ...order, Status: newStatus } : order
          )
        );
      } else {
        console.error('Error updating order status:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleOrderFilter = (e) => {
    const selectedStatus = e.target.value;
    if (selectedStatus === 'All Orders') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) => order.Status === selectedStatus
      );
      setFilteredOrders(filtered);
    }
  };

  const search = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        order.OrderID?.toLowerCase().includes(value) ||
        order.userID?.name?.toLowerCase().includes(value)
    );
    setFilteredOrders(filtered);
  };

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Line plot graph for daily income */}
      <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Daily Income</h2>
      <div className="bg-white shadow-md rounded-lg p-4 h-72"> {/* Tailwind class for height */}
        <Line
          data={dailyIncomeData}
          options={{
            responsive: true,
            maintainAspectRatio: false, // Ensures that the chart doesn't maintain its aspect ratio
          }}
          style={{ height: '100%' }} // This ensures the chart takes full height of the container
        />
      </div>
    </div>


      {/* Order filter and search bar */}
      <div className="flex items-center mb-6">
        <h3 className="mr-4">View</h3>
        <select
          className="px-4 py-2 border border-gray-300 rounded-md"
          onChange={handleOrderFilter}
        >
          <option value="All Orders">All Orders</option>
          <option value="Confirmed">Confirmed Orders</option>
          <option value="pending">Pending Orders</option>
        </select>
        <input
          type="text"
          placeholder="Search Order ID or Name"
          onChange={search}
          className="px-4 py-2 border border-gray-300 rounded-md ml-4 w-1/3"
        />
      </div>

      <h2 className="text-2xl font-bold mb-6">Order Details</h2>

      {/* Order Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b text-left">Product Image</th>
              <th className="py-2 px-4 border-b text-left">Product Name</th>
              <th className="py-2 px-4 border-b text-left">Quantity</th>
              <th className="py-2 px-4 border-b text-left">Size</th>
              <th className="py-2 px-4 border-b text-left">Total Amount</th>
              <th className="py-2 px-4 border-b text-left">Order Date</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Customer Name</th>
              <th className="py-2 px-4 border-b text-left">Change Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">
                  <img
                    src={order.productID?.productImage[0] || 'default-image.jpg'}
                    alt={order.productID?.productName || 'Product'}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </td>
                <td className="py-2 px-4 border-b">
                  {order.productID?.productName}
                </td>
                <td className="py-2 px-4 border-b">{order.Quantity}</td>
                <td className="py-2 px-4 border-b">{order.Size}</td>
                <td className="py-2 px-4 border-b">{order.TotalAmount}</td>
                <td className="py-2 px-4 border-b">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">{order.Status}</td>
                <td className="py-2 px-4 border-b">{order.userID?.name}</td>
                <td className="py-2 px-4 border-b">
                  <Switch
                    checked={order.Status === 'Confirmed'}
                    onChange={() =>
                      handleStatusChange(
                        order._id,
                        order.Status === 'pending' ? 'Confirmed' : 'pending'
                      )
                    }
                    color="success"
                  />
                  <span className="ml-2 text-gray-700 font-medium">
                    {order.Status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerOrderView;
