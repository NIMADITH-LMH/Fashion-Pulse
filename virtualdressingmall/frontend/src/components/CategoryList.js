import React from "react"
import { useState } from "react"
import SummaryApi from "../common"
import { useEffect } from "react"
import { Link } from "react-router-dom"




const CategoryList = () =>{

const [categoryProduct,setCategoryProduct] = useState([])

const[loading,setLoading] = useState(false)

const catergoryLoading =  new Array(13).fill(null)


const fetchCategoryProduct = async () => {
    setLoading(true)
    const response = await fetch(SummaryApi.categoryProduct.url)
    const dataResponse = await response.json()
    
    setLoading(false)
    setCategoryProduct(dataResponse.data)
}

useEffect(() => {
    fetchCategoryProduct()
},[])



    return (
         <div className='container mx-auto p-4'>
                <div className = 'flex items-center gap-4 justify-between overflow-scroll scrollbar-none'>
                    {
                        loading ? (
                            
                                catergoryLoading.map((e1,index)=>{

                                    return(
                                        <div className = 'h-16 w-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-200 animate-pulse' key={"catergoryLoading" + index}>
                                        </div>
                                    )
                                })
                            
                        
                        ) : (

                        categoryProduct.map((product,index) => {
                            return(
                                <Link to={"/product-category/"+product?.category} className ='cursor-pointer' key={product?.category + index}>
                                    <div className='w-16 h-16  md:w-20 md:h-20 rounded-full overflow-hidden p-4 bg-slate-200 flex items-center justify-center'>
                                        <img src={product?.productImage[0]} alt={product?.catergory} className='h-full  object-scale-down mix-blend-multiply hover:scale-120  duration-110 transition-all'/>
                                    </div>
                                    <p className="text-center text- md text-base capitalize">{product?.category}</p>
                                </Link>
                            )
                        })
                    )
                    }

                </div>
        
        
    

    </div>

 

    )
}

export default CategoryList