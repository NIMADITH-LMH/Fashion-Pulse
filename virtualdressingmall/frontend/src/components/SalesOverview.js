// src/components/SalesOverview.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
const SalesOverview = ({ sellerId }) => {
    const user = useSelector((state) => state?.user?.user);

  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      if (!user?._id) {
        toast.error('User not found');
        return;
      }
  
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const response = await axios.get(SummaryApi.sellerSalesOverView.url, {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          sellerId:user._id
        }
      });
      console.log(user._id)
      
      if (response.data.success) {
        setSalesData(response.data.data);
      } else {
        toast.error('Failed to fetch sales data');
      }
    } catch (err) {
      console.error('Error fetching sales data:', err);
      toast.error('Error fetching sales data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading sales data...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!salesData) return null;

  const revenueData = [
    { name: 'Orders', value: salesData.totalOrderRevenue },
    { name: 'Bids', value: salesData.totalBidRevenue }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Sales Overview Dashboard</h1>
      
      {/* Date Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            className="p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            className="p-2 border rounded"
          />
        </div>
        <div className="flex items-end">
          <button 
            onClick={fetchSalesData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold opacity-80">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(salesData.totalRevenue)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold opacity-80">Orders Count</h3>
          <p className="text-3xl font-bold mt-2">{salesData.totalOrdersCount}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold opacity-80">Products Sold</h3>
          <p className="text-3xl font-bold mt-2">{salesData.totalProductsSold}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Distribution Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Revenue Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-blue-100 p-2 rounded">
              <p className="text-sm text-gray-600">Order Revenue</p>
              <p className="font-bold">{formatCurrency(salesData.totalOrderRevenue)}</p>
            </div>
            <div className="bg-green-100 p-2 rounded">
              <p className="text-sm text-gray-600">Bid Revenue</p>
              <p className="font-bold">{formatCurrency(salesData.totalBidRevenue)}</p>
            </div>
          </div>
        </div>
        
        {/* Top Products Chart */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" tick={false} label={{ value: 'Products', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Units Sold', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name, props) => [value, 'Units Sold']}
                  labelFormatter={(label) => `Product: ${label}`}
                />
                <Bar dataKey="totalSold" fill="#8884d8">
                  {salesData.topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Top Products Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Rank</th>
                <th className="py-2 px-4 text-left">Product ID</th>
                <th className="py-2 px-4 text-left">Product Name</th>
                <th className="py-2 px-4 text-right">Units Sold</th>
                <th className="py-2 px-4 text-right">% of Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesData.topProducts.map((product, index) => (
                <tr key={product.productId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{product.productId.toString().substring(0, 8)}...</td>
                  <td className="py-2 px-4">{product.productName}</td>
                  <td className="py-2 px-4 text-right">{product.totalSold}</td>
                  <td className="py-2 px-4 text-right">
                    {((product.totalSold / salesData.totalProductsSold) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesOverview;