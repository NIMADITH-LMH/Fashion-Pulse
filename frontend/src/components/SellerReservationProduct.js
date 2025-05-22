import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryApi from '../common';
import { useSelector } from 'react-redux';

const SellerReservationView = () => {
    const [reservations, setReservations] = useState([]); // All reservations
    const [filteredReservations, setFilteredReservations] = useState([]); // Filtered reservations
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state?.user?.user);
    // Fetch reservations from the backend
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await fetch(SummaryApi.getReservationDetails.url);
                const dataResponse = await response.json();
    
                console.log("Fetched Reservations:", dataResponse);
    
                if (Array.isArray(dataResponse?.data)) {
                    // Filter only the reservations that belong to the current shop
                    const sellerReservations = dataResponse.data.filter(
                        (reservation) => reservation.productID?.ShopID === user?._id
                    );
    
                    setReservations(sellerReservations);
                    setFilteredReservations(sellerReservations);
                    setLoading(false);
    
                    // Auto-reject reservations older than 2 days if not confirmed
                    const currentDate = new Date();
                    sellerReservations.forEach((reservation) => {
                        const reservationDate = new Date(reservation.createdAt);
                        const timeDifference = currentDate - reservationDate;
                        const daysDifference = timeDifference / (1000 * 3600 * 24);
    
                        if (daysDifference > 2 && reservation.ValidateReservation !== "Confirmed") {
                            handleStatusChange(reservation.ReservationID, "Rejected");
                        }
                    });
                } else {
                    console.error("Unexpected data format:", dataResponse);
                }
            } catch (error) {
                console.error("Error fetching reservations:", error);
            }
        };
        fetchReservations();
    }, [user?._id]);
    

    // Handle status change
    const handleStatusChange = async (reservationID, newStatus) => {
        try {
            const response = await axios.post(SummaryApi.updatereservation.url, {
                reservationID,
                status: newStatus,
            });

            if (response.data.success) {
                setReservations((prevReservations) =>
                    prevReservations.map((reservation) =>
                        reservation.ReservationID === reservationID
                            ? { ...reservation, ValidateReservation: newStatus }
                            : reservation
                    )
                );
                // If status is changed, update the filtered data as well
                setFilteredReservations((prevFilteredReservations) =>
                    prevFilteredReservations.map((reservation) =>
                        reservation.ReservationID === reservationID
                            ? { ...reservation, ValidateReservation: newStatus }
                            : reservation
                    )
                );
            } else {
                console.error('Error updating status:', response.data.message);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handlereservation = (e) => {
        e.preventDefault();
        const selectedStatus = e.target.value;

        if (selectedStatus === "All Reservation details") {
            // Show all reservations
            setFilteredReservations(reservations);
        } else {
            // Filter reservations based on selected status
            const filtered = reservations.filter((reservation) => reservation.ValidateReservation === selectedStatus);
            setFilteredReservations(filtered);
        }
    };

    const search = (e) => {
        const value = e.target.value.toLowerCase();
        const filtered = reservations.filter(
            (reservation) =>
                reservation.ReservationID.toLowerCase().includes(value) ||
                reservation.userID?.name.toLowerCase().includes(value)
        );
        setFilteredReservations(filtered);
    };

    if (loading) {
        return <div className="text-center text-xl">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center mb-6">
                <h3 className="mr-4">View</h3>
                <select className="px-4 py-2 border border-gray-300 rounded-md" onChange={handlereservation}>
                    <option value="All Reservation details">All Reservation details</option>
                    <option value="Confirmed">Confirmed Reservation</option>
                    <option value="Rejected">Rejected Reservation</option>
                    <option value="Not visited">Not visited Reservation</option>
                </select>
                <input
                    type="text"
                    placeholder="Search Reservation  Reservation ID or Name"
                    onChange={search}
                    className="px-4 py-2 border border-gray-300 rounded-md ml-4 w-1/3"
                />
            </div>
            <h2 className="text-2xl font-bold mb-6">Reservation Details</h2>

            {/* Table layout */}
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 border-b text-left">Product Image</th>
                            <th className="py-2 px-4 border-b text-left">Product Name</th>
                            <th className="py-2 px-4 border-b text-left">Reservation ID</th>
                            <th className="py-2 px-4 border-b text-left">Quantity</th>
                            <th className="py-2 px-4 border-b text-left">Size</th>
                            <th className="py-2 px-4 border-b text-left">Reservation Date</th>
                            <th className="py-2 px-4 border-b text-left">Status</th>
                            <th className="py-2 px-4 border-b text-left">Customer Name</th>
                            <th className="py-2 px-4 border-b text-left">Change Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReservations.map((reservation) => (
                            <tr key={reservation.ReservationID} className="hover:bg-gray-100">
                                <td className="py-2 px-4 border-b">
                                    <img
                                        src={reservation.productID?.productImage[0] || 'default-image.jpg'}  // Fallback image
                                        alt={reservation.productID?.productName || 'Product'}  // Fallback name
                                        className="w-20 h-20 object-cover rounded-md"
                                    />
                                </td>
                                <td className="py-2 px-4 border-b">{reservation.productID?.productName}</td>
                                <td className="py-2 px-4 border-b">{reservation.ReservationID}</td>
                                <td className="py-2 px-4 border-b">{reservation.Quantity}</td>
                                <td className="py-2 px-4 border-b">{reservation.size}</td>
                                <td className="py-2 px-4 border-b">{new Date(reservation.createdAt).toLocaleString()}</td>
                                <td className="py-2 px-4 border-b">{reservation.ValidateReservation}</td>
                                <td className="py-2 px-4 border-b">{reservation.userID?.name}</td>

                                {/* Dropdown for status change */}
                                <td className="py-2 px-4 border-b">
                                    <select
                                        value={reservation.ValidateReservation}
                                        onChange={(e) => handleStatusChange(reservation.ReservationID, e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-md"
                                        disabled={reservation.ValidateReservation === 'Confirmed'||reservation.ValidateReservation==='Rejected'} // Disable if already confirmed
                                    >
                                        <option value="Not visited">Not visited</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SellerReservationView;
