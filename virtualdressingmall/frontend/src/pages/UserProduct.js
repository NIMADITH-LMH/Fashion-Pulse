import React, { useEffect, useState } from "react";
import UploadProduct from "../components/UploadProduct";
import SummaryApi from "../common";
import UserProductCard from "../components/UserProductCard";
import { useSelector } from "react-redux";
import productCategory from "../helpers/productCategory";

const UserProduct = () => {
  const user = useSelector((state) => state?.user?.user);

  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]); // Stores all fetched products
  const [filteredProduct, setFilteredProduct] = useState([]); // Stores filtered products
  const [selectedCategory, setSelectedCategory] = useState("NAN"); // Tracks selected category

  // Fetch all products
  const fetchAllProduct = async () => {
    try {
      const response = await fetch(SummaryApi.allProduct.url);
      const dataResponse = await response.json();
  
      console.log("Product Data:", dataResponse);
  
      if (Array.isArray(dataResponse?.data)) {
        // Filter only active products
        const activeProducts = dataResponse.data.filter(product => product.status === 'approved');
  
        setAllProduct(activeProducts);
        setFilteredProduct(activeProducts); // Initially show only active products
      } else {
        console.error("Unexpected data format:", dataResponse);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  

  useEffect(() => {
    if (user?._id) {
      fetchAllProduct();
    }
  }, [user?._id]); // Refetch when the user._id changes

  // Handle Category Selection
  const onChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);

    if (value === "NAN") {
      setFilteredProduct(allProduct); // Show all products if "All Product" is selected
    } else {
      const filtered = allProduct.filter((product) => product.category === value);
      setFilteredProduct(filtered);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Sorting by Category */}
        <label htmlFor="category" className="text-sm font-medium text-gray-700 pr-2">
    Category:
  </label>
  <select
    value={selectedCategory}
    name="category"
    onChange={onChange}
    className="w-32 h-8 px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
  >
        <option value="NAN">All Product</option>
        {productCategory.map((el, index) => (
          <option value={el.value} key={el.value + index}>
            {el.label}
          </option>
        ))}
      </select>

      {/* All Products Section */}
     <h2 className="text-2xl font-bold mb-4">
  {selectedCategory === "NAN" ? "All Products" : selectedCategory}
</h2>


      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProduct.map((product, index) => (
          <UserProductCard data={product} key={index} fetchdata={fetchAllProduct} />
        ))}
      </div>
    </div>
  );
};

export default UserProduct;
