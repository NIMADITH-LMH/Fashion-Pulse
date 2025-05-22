import React from "react";
import { FaShoppingCart, FaComment } from "react-icons/fa";
import { Link } from "react-router-dom";
const UserProductCard = ({ data }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col items-center w-full hover:shadow-xl transition duration-300 ease-in-out">
      {/* Image */}
      <div className="w-40 h-40 flex justify-center items-center overflow-hidden">
        <img
          src={data?.productImage?.[0]}
          className="w-full h-full object-cover rounded"
          alt="Product"
        />
      </div>

      {/* Product Info */}
      <h1 className="text-center font-semibold mt-2">
        <b>Product Name:</b> {data.productName}
      </h1>
      <h1 className="text-center font-semibold">
        <b>Price: Rs.</b> {data.Size.length > 0 ? data.Size[0].price : "N/A"}
      </h1>

      {/* Icons Section */}
      <div className="flex justify-between items-center w-full mt-2 text-red-500 text-lg px-6">
        
        
        <span className="font-semibold text-red-500 cursor-pointer"><Link to={`/view-product/${data._id}`}>View</Link></span>
      </div>
    </div>
  );
};

export default UserProductCard;
