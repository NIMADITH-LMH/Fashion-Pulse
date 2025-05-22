import { useLocation } from "react-router-dom";
import SummaryApi from "../common";
import UserProductCard from "../components/UserProductCard";
import productCategory from "../helpers/productCategory";
import { useEffect, useState } from "react";

const ShopProduct = () => {
  const location = useLocation();
  const shopId = location.state?.shopId;

  const [allProduct, setAllProduct] = useState([]);
  const [filteredProduct, setFilteredProduct] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("NAN");

  const fetchAllProduct = async () => {
    try {
      const response = await fetch(SummaryApi.allProduct.url);
      const dataResponse = await response.json();

      console.log("Product Data:", dataResponse);

      if (Array.isArray(dataResponse?.data)) {
        // Filter by ShopID
        const shopProducts = dataResponse.data.filter(product => product.ShopID._id === shopId && product.status === 'approved');
        setAllProduct(shopProducts);
        setFilteredProduct(shopProducts);
      } else {
        console.error("Unexpected data format:", dataResponse);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchAllProduct();
    }
  }, [shopId]);

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

      {/* Products Section */}
      <h2 className="text-2xl font-bold mb-4">
        {selectedCategory === "NAN" ? "All Products" : selectedCategory}
      </h2>

      {/* Display products or No products message */}
      {filteredProduct.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No products available for this shop.</p>
          
          {/* Add a button to open product upload modal or page */}
         
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProduct.map((product, index) => (
            <UserProductCard data={product} key={index} fetchdata={fetchAllProduct} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopProduct;
