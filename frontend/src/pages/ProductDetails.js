import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import SummaryApi from '../common'

const ProductDetails = () => {
  const [data, setData] = useState({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    price: "",
    description: "",
    sellingPrice: "",
  })
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const productImageListLoading = new Array(4).fill(null)
  console.log("product id", params)
  

  const fetchProductDetails = async () => {
    setLoading(true)
    const response = await fetch(SummaryApi.productDetails.url, {
      method: SummaryApi.productDetails.method,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        productId: params?.id
      })
    })
    setLoading(false)

    const dataResponse = await response.json()
    setData(dataResponse?.data)
  }
  console.log("data", data)
  useEffect(() => {
    fetchProductDetails()
  }, [])

  return (
    <div className='container mx-auto p-4'>
      {/**product Image */}
      <div>
        <div className='h-full'>
          {loading ? (
            <div className='flex gap-2 lg:flex-col overflow-scroll scrollbar-none'>
              {productImageListLoading.map((e1, index) => (
                <div key={index} className='h-20 w-20 bg-slate-200 rounded'>
                  {/* Placeholder content */}
                </div>
              ))}
            </div>
          ) : (
            <div className='flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full'>
              {data.productImage.map((imgURL, index) => (
                <div className='h-20 w-20 bg-slate-200 rounded p-1' key={imgURL}>
                  <img src={imgURL} alt={`Product ${index + 1}`} className='w-full h-full object-scale-down mix-blend-multiply' />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetails;