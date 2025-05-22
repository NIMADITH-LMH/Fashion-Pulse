import React from "react"
import CategoryList from "../components/CategoryList"
import BannerProduct from "../components/BannerProduct"
import HorizontalCardProduct from "../components/HorizontalCardProduct"
import VerticalCardProduct from "../components/VerticalCardProduct"
import productCategory from "../helpers/productCategory"; 
const Home = () => {
    return <div>
        <CategoryList/>
        <BannerProduct/>
        <div className="mb-10">
        <HorizontalCardProduct 
          heading="Featured Products" 
          category="Featured" 
        />
      </div>
      
      {/* Category-wise Products */}
      {productCategory.map((category) => (
        <div key={category.id} className="mb-10">
          <HorizontalCardProduct 
            heading={category.label} 
            category={category.value} 
          />
        </div>
      ))}
      
      {/* You can add any additional sections here */}
    </div>
        
}

export default Home;