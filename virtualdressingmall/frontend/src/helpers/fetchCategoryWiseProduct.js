const { default: SummaryApi } = require("../common");

const fetchCategoryWiseProduct = async(category) => {
  try {
    if (!category) {
      throw new Error('Category parameter is required');
    }
    
    const response = await fetch(SummaryApi.fetchCategoryWiseProduct.url, {
      method: SummaryApi.fetchCategoryWiseProduct.method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        category: category
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const dataResponse = await response.json();
    
    if (!dataResponse.success && dataResponse.error) {
      throw new Error(dataResponse.message || 'Failed to fetch category products');
    }
    
    // If no products found for this category, return an empty array instead of throwing an error
    if (!dataResponse.data || dataResponse.data.length === 0) {
      console.log(`No products found for category: ${category}`);
      return { success: true, data: [] };
    }
    
    return dataResponse;
  } catch (error) {
    console.error(`Error fetching products for category "${category}":`, error);
    // Return empty array instead of throwing error to prevent component crash
    return { success: false, data: [], error: error.message };
  }
};

export default fetchCategoryWiseProduct;