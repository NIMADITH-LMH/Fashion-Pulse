import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import AppContext from "../context";
import SummaryApi from "../common";
import { useNavigate } from "react-router-dom";
import ResrvationModel from "../components/Reservation";
const ProductPage = ({ data }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [activePrice, setActivePrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const { fetchUserAddToCart } = useContext(AppContext);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);
  const [showReservationModal, setShowReservationModal] = useState(false)
  useEffect(() => {
    if (data) {
      setMainImage(data.productImage?.[0] || "/default.jpg");
      setActivePrice(
        data.DiscountPercentage
          ? data.Size[0]?.price * (1 - data.DiscountPercentage / 100)
          : data.Size[0]?.price || 0
      );
    }
  }, [data]);

  const handleSizeSelect = (sizeObj) => {
    setSelectedSize(sizeObj.size);
    const discountedPrice =
      sizeObj.price * (1 - (data.DiscountPercentage || 0) / 100);
    setActivePrice(discountedPrice);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user?._id || !token) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        userId: user._id,
        productId: data._id,
        size: selectedSize,
        quantity: 1,
      };

      const response = await fetch(SummaryApi.addToCartProduct.url, {
        method: SummaryApi.addToCartProduct.method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add to cart");
      }

      if (responseData.success) {
        toast.success("Added to cart successfully");
        fetchUserAddToCart();
      } else {
        toast.error(responseData.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error.message || "Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* LEFT IMAGE & THUMBNAILS */}
      <div className="flex">
        <div className="flex flex-col space-y-4 mr-4">
          {(data.productImage || []).map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index}`}
              className={`w-20 h-20 object-cover border rounded cursor-pointer hover:border-black ${
                img === mainImage ? "border-black" : "border-gray-300"
              }`}
              onClick={() => setMainImage(img)}
            />
          ))}
        </div>
        <img
          src={mainImage}
          alt={data.productName || "Product Image"}
          className="w-full object-contain rounded-lg max-h-[500px]"
        />
      </div>

      {/* RIGHT PRODUCT DETAILS */}
      <div className="flex flex-col">
        <h2 className="text-4xl font-bold mb-2">{data.productName}</h2>
        <p className="text-gray-500 text-lg mb-4">{data.brandName}</p>

        <div className="flex items-center space-x-4 mb-6">
          <span className="text-3xl font-bold text-rose-600">
            Rs.{activePrice.toFixed(2)}
          </span>
          {selectedSize && (
            <span className="text-gray-500 text-base">
              (Size: {selectedSize})
            </span>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Select Size</h3>
          <div className="flex flex-wrap gap-4">
            {(data.Size || []).map((sizeObj, index) => (
              <button
                key={index}
                onClick={() => handleSizeSelect(sizeObj)}
                className={`px-4 py-2 border rounded-md ${
                  selectedSize === sizeObj.size
                    ? "bg-red-600 text-white border-red-600"
                    : "border-gray-300 hover:border-red-600"
                }`}
              >
                {sizeObj.size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 mt-4">
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className={`bg-red-600 hover:bg-red-700 text-white text-base px-4 py-2 rounded-3xl w-1/2 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
          }`}
        >
          {loading ? "Adding to Cart..." : "Add to Cart"}
        </button>
         <button
            onClick={() => setShowReservationModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-base px-4 py-2 rounded-3xl w-1/2"
          >
            Make Reservation
          </button>
        </div>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {data.description || "No description available."}
          </p>
          
        </div>
      
      </div>
      {showReservationModal && (
        <ResrvationModel
          product={data}
          onClose={() => setShowReservationModal(false)}
        />
      )}
    </div>
  );
};

export default ProductPage;
