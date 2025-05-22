import React, { useState } from "react";
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import SummaryApi from '../common';
import jsPDF from 'jspdf'; // Import jsPDF
import { useNavigate } from "react-router-dom";

const ReservationModal = ({ product, onClose }) => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [availableQty, setAvailableQty] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const user = useSelector((state) => state?.user?.user);

  const [data, setData] = useState({
    ReservationID: "",
    productID: product._id,
    Quantity: 0,
    userID: user._id || " ",
    size: '',
    ValidateReservation: 'Not visited'
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  const handleSizeChange = (size) => {
    setSelectedSize(size.size);
    setAvailableQty(size.quantity);
    setPrice(size.price);
    setQuantity(1); // Reset quantity when size is changed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Generate ReservationID before submission
    const reservationCode = generateReservationCode();
  
    // Update data with the reservation code immediately
    const updatedData = {
      ...data,
      ReservationID: reservationCode, // Ensure ReservationID is updated
      Quantity: quantity,
      size: selectedSize, // Ensure size is set before submission
    };
  
    // Validate required fields
    if (quantity <= 0 || !selectedSize) {
      toast.error("Please fill all required fields");
      return;
    }
  
    try {
      const response = await fetch(SummaryApi.addReservation.url, {
        method: SummaryApi.addReservation.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(updatedData), // Send the updated data here
      });
  
      const responseData = await response.json();
  
      if (responseData.success) {
        toast.success(`Your reservation ID is ${reservationCode}`);
  
        // Generate PDF when reservation is successful
        generatePDF(reservationCode);

        navigate('/Cart');

      } else {
        toast.error(responseData?.message || "Failed to upload reservation");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred while uploading the reservation");
    }
  };
  

  const generateReservationCode = () => {
    let code = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 20; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  // Function to generate the PDF
  const generatePDF = (reservationCode) => {
    const doc = new jsPDF();

    // Set font size and add title
    doc.setFontSize(18);
    doc.text("Fashion Pulse", 20, 20);

    // Add contact information
    doc.setFontSize(12);
    doc.text("+94 74 10 900 19", 20, 35);
    doc.text("fashionpulse@gmail.com", 20, 40);
    doc.text("www.fashionpulse.lk", 20, 45);

    // Add a line separator
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);

    // Add reservation details
    doc.setFontSize(14);
    doc.text("Reservation Details", 20, 60);

    // User details on the left-hand side
    doc.setFontSize(12);
    doc.text(`User Name: ${user.name}`, 20, 70);
    doc.text(`Email: ${user.email}`, 20, 75);

    // Shop details on the right-hand side
    doc.text(`Shop Name: ${product.ShopID.name}`, 120, 70);
    doc.text(`Address: ${product.ShopID.address}`, 120, 75);
    doc.text(`Email: ${product.ShopID.email}`, 120, 80);

    // Reservation details
    doc.text(`Reservation ID: ${reservationCode}`, 20, 100);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Reservation Date: ${currentDate}`, 20, 105);
    doc.text(`Reservation Status: Not visited`, 20, 110);

    // Add another line separator
    doc.line(20, 115, 190, 115);

    // Add quantity table
    doc.setFontSize(14);
    doc.text("Quantity", 20, 125);

    // Table headers
    doc.setFontSize(12);
    doc.text("Product Name", 20, 135);
    doc.text("Quantity", 100, 135);
    doc.text("Size", 120, 135);
    doc.text("Unit Price", 150, 135);
    doc.text("Amount", 180, 135);

    // Table rows
    doc.text(`${product.productName}`, 20, 145);
    doc.text(`${quantity}`, 100, 145);
    doc.text(`${selectedSize}`, 120, 145);
    doc.text(`${price}`, 150, 145);
    doc.text(`${quantity * price}`, 180, 145);

    // Add subtotal, tax, and total
    const total = quantity * price;

    doc.setFontSize(14);
    doc.text("Total", 20, 195);
    doc.text(`${total}`, 160, 195);

    // Add notes
    doc.setFontSize(12);
    doc.text("Thank you for staying with us. We look forward to your next visit :)", 20, 205);

    // Download the generated PDF
    doc.save(`reservation-${reservationCode}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-4">
          Make Reservation - {product.productName}
        </h2>
        <img
          src={product.productImage[0]}
          alt={product.productName}
          className="w-full h-40 object-contain mb-4 rounded"
        />

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Select Size</h4>
          <div className="flex flex-wrap gap-3">
            {product.Size.map((size, index) => (
              <button
                key={index}
                onClick={() => handleSizeChange(size)}
                className={`px-4 py-2 border rounded ${
                  selectedSize === size.size
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                {size.size}
              </button>
            ))}
          </div>
        </div>

        {selectedSize && (
          <>
            <p className="mb-4 text-sm">
              Available Quantity: <strong>{availableQty}</strong>
            </p>
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Select Quantity</label>
              <input
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min="1"
                max={availableQty}
                value={quantity}
                className="border p-2 w-full rounded"
              />
            </div>
          </>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
        >
          Confirm Reservation
        </button>
      </div>
    </div>
  );
};

export default ReservationModal;
