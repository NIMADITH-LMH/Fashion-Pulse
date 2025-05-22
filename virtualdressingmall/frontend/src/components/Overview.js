import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import SummaryApi from '../common';
import { useSelector } from 'react-redux';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const OverviewOrder = () => {
  const [reservations, setReservations] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [confirmedOrders, setConfirmedOrders] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [orderData, setOrderData] = useState([]); // Store orders from backend
  const user = useSelector((state) => state?.user?.user);
  const [timeRange, setTimeRange] = useState('monthly');
  const [reservationStats, setReservationStats] = useState({
    notVisited: 0,
    confirmed: 0,
    rejected: 0,
  });
  

  useEffect(() => {
    const fetchReservationStats = async () => {
      try {
        const response = await fetch(SummaryApi.getReservationDetails.url);
        const data = await response.json();

        const stats = { notVisited: 0, confirmed: 0, rejected: 0 };
        const sellerReservations = data.data.filter(
          (reservation) => reservation.productID.ShopID === user?._id
        );

        setReservations(sellerReservations);
        if (data.success && data.data) {
          sellerReservations.forEach((reservation) => {
            switch (reservation.ValidateReservation) {
              case 'Not visited':
                stats.notVisited += 1;
                break;
              case 'Confirmed':
                stats.confirmed += 1;
                break;
              case 'Rejected':
                stats.rejected += 1;
                break;
              default:
                break;
            }
          });
          setReservationStats(stats);
          setConfirmedOrders(stats.confirmed);
          setPendingOrders(stats.notVisited);
          setProductsCount(sellerReservations.length);
        }
      } catch (error) {
        console.error('Error fetching reservation stats:', error);
      }
    };

    fetchReservationStats();
  }, []);

  // ✅ Fetch order data for Bar Chart
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(SummaryApi.getOrderDetails.url);
        const data = await response.json();
        if (data.success && data.data) {
          // Filter orders where the product's shop ID matches the current seller
          const sellerOrders = data.data.filter(
            (order) => order.productID?.ShopID === user?._id
          );
          setOrderData(sellerOrders);
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
      }
    };
  
    fetchOrderData();
  }, [user?._id]);
  

  //  Function to aggregate order data based on selected time range
  // ✅  FIXED AGGREGATION FUNCTION:
const aggregateOrderData = () => {
  const groupedData = {};

  orderData.forEach((order) => {
    const createdAt = new Date(order.createdAt);
    let keyDate;

    if (timeRange === 'daily') {
      keyDate = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (timeRange === 'weekly') {
      const day = createdAt.getDate() - createdAt.getDay(); // Sunday as start of week
      keyDate = new Date(createdAt.setDate(day)).toISOString().split('T')[0];
    } else if (timeRange === 'monthly') {
      keyDate = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
    } else if (timeRange === 'yearly') {
      keyDate = createdAt.getFullYear().toString();
    }

    if (!groupedData[keyDate]) {
      groupedData[keyDate] = { completed: 0, canceled: 0 };
    }

    if (order.Status === 'completed' || order.Status === 'Confirmed') {
      groupedData[keyDate].completed += 1;
    } else if (order.Status === 'pending' || order.Status === 'Rejected') {
      groupedData[keyDate].canceled += 1;
    }
  });

  const sortedKeys = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));

  // ✅ Format keys to readable form
  const labels = sortedKeys.map((key) => {
    if (timeRange === 'daily') {
      return new Date(key).toLocaleDateString();
    } else if (timeRange === 'weekly') {
      const weekStart = new Date(key);
      return `Week of ${weekStart.toLocaleDateString()}`;
    } else if (timeRange === 'monthly') {
      const [year, month] = key.split('-');
      return `${month}/${year}`;
    } else if (timeRange === 'yearly') {
      return key;
    }
  });

  const completedData = sortedKeys.map((key) => groupedData[key].completed);
  const canceledData = sortedKeys.map((key) => groupedData[key].canceled);

  return {
    labels,
    datasets: [
      {
        label: 'Completed Orders',
        data: completedData,
        backgroundColor: 'rgba(255, 159, 132, 0.6)',
        borderColor: 'rgba(255, 159, 132, )',
        borderWidth: 1,
      },
      {
        label: 'Pending/Cancelled Orders',
        data: canceledData,
        backgroundColor: 'rgba(255, 69, 58, 0.6)',
        borderColor: 'rgba(255, 69, 58, 1)',
        borderWidth: 1,
      },
    ],
  };
};


  const pieData = {
    labels: ['Not visited', 'Confirmed', 'Rejected'],
    datasets: [
      {
        data: [
          reservationStats.notVisited,
          reservationStats.confirmed,
          reservationStats.rejected,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 132, 0.6)',
          'rgba(255, 69, 58, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 132, 1)',
          'rgba(255, 69, 58, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Order Overview (${timeRange})`,
      },
    },
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-5">Overview Product</h1>

      <div className="mb-6">
        <div className="text-xl font-semibold mb-2">Product Overview</div>
        <div className="flex gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p>
              <strong>Total Products you are enter:</strong> {productsCount}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p>
              <strong>Out of Stocks </strong> {confirmedOrders}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p>
              <strong>Available Stocks</strong> {pendingOrders}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
          <label className="mr-4" key={range}>
            <input
              type="radio"
              value={range}
              checked={timeRange === range}
              onChange={() => setTimeRange(range)}
              className="mr-2"
            />
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </label>
        ))}
      </div>

      <div className="flex justify-between gap-6 mb-6">
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Order Overview ({timeRange})</h2>
          <Bar data={aggregateOrderData()} options={barOptions} />
        </div>

        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Reservation Product Overview</h2>
          {reservationStats.notVisited || reservationStats.confirmed || reservationStats.rejected ? (
            <Pie data={pieData} options={pieOptions} />
          ) : (
            <p>Loading data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewOrder;
