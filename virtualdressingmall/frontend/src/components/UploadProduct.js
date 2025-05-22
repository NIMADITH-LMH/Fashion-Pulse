import React, { useState, useEffect } from 'react'
import { CgClose } from "react-icons/cg";
import productCategory from '../helpers/productCategory';
import { FaCloudUploadAlt, FaPlus } from "react-icons/fa";
import uploadImage from '../helpers/uploadImage';
import DisplayImage from './DisplayImage';
import { MdDelete } from "react-icons/md";
import SummaryApi from '../common';
import { toast } from 'react-toastify'
import SubCategory from '../helpers/subCategory';
import { useSelector } from 'react-redux';

const UploadProduct = ({
  onClose,
  fetchData
}) => {
  const user = useSelector((state) => state?.user?.user);
  const [data, setData] = useState({
    ShopID: user?._id || "",
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    subCategory: "",
    description: "",
    DiscoutPercentage: 0.0,
    Size: [{ size: "", quantity: 0.0, price: 0.0 }],
    Gender: "",
    color: '',
    Pattern: '',
    FitType: '',
    seasonalCollection: ''
  });

  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");

  useEffect(() => {
    if (user?._id) {
      setData((prevData) => ({
        ...prevData,
        ShopID: user._id
      }));
    }
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = [...data.Size];
    updatedSizes[index] = {
      ...updatedSizes[index],
      [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
    };
    setData((prev) => ({
      ...prev,
      Size: updatedSizes
    }));
  };

  const handleUploadProduct = async (e) => {
    const file = e.target.files[0];
    const uploadImageCloudinary = await uploadImage(file);

    setData((prev) => ({
      ...prev,
      productImage: [...prev.productImage, uploadImageCloudinary.url]
    }));
  }

  const handleDeleteProductImage = async (index) => {
    console.log("image index", index);

    const newProductImage = [...data.productImage];
    newProductImage.splice(index, 1);

    setData((prev) => ({
      ...prev,
      productImage: [...newProductImage]
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!data.productName || !data.brandName || !data.category || data.productImage.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate Size array
    if (!data.Size.every(size => size.size && size.quantity > 0 && size.price > 0)) {
      toast.error("Please fill all size details correctly");
      return;
    }

    try {
      const response = await fetch(SummaryApi.uploadProduct.url, {
        method: SummaryApi.uploadProduct.method,
        credentials: 'include',
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (responseData.success) {
        toast.success(responseData?.message);
        onClose();
        fetchData();
      } else {
        toast.error(responseData?.message || "Failed to upload product");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred while uploading the product");
    }
  }

  const handleAddSize = () => {
    setData({ ...data, Size: [...data.Size, { size: '', quantity: 0.0, price: 0.0 }] });
  };

  const removeSize = (index) => {
    if (data.Size.length > 1) {
      const updatedSizes = data.Size.filter((_, i) => i !== index);
      setData((prev) => ({ ...prev, Size: updatedSizes }));
    }
  };

  return (
    <div className='fixed w-full h-full bg-slate-200 bg-opacity-35 top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50'>
      <div className='bg-white p-4 rounded w-full max-w-2xl h-full max-h-[80%] overflow-hidden relative'>
        <div className='flex justify-between items-center pb-3 border-b mb-4 sticky top-0 bg-white z-10'>
          <h2 className='font-bold text-xl'>Upload Product</h2>
          <button
            className='p-2 hover:bg-red-100 rounded-full transition-colors duration-200 flex items-center justify-center'
            onClick={onClose}
            role="button"
            aria-label="Close"
          >
            <CgClose className='text-2xl text-red-600' />
          </button>
        </div>

        <form className='grid p-4 gap-2 overflow-y-scroll h-[calc(100%-4rem)] pb-5' onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type='text'
                id='productName'
                placeholder='Enter product name'
                name='productName'
                value={data.productName}
                onChange={handleOnChange}
                className='w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Brand Name
              </label>
              <input
                type='text'
                id='brandName'
                placeholder='Enter brand name'
                value={data.brandName}
                name='brandName'
                onChange={handleOnChange}
                className='w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                required
              />
            </div>
            <div>
              <label htmlFor='category' className='block text-sm font-medium text-gray-700'>Category :</label>
              <select required value={data.category} name='category' onChange={handleOnChange} className='w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'>
                <option value={""}>Select Category</option>
                {
                  productCategory.map((el, index) => {
                    return (
                      <option value={el.value} key={el.value + index}>{el.label}</option>
                    )
                  })
                }
              </select>
            </div>
            <div>
              <label htmlFor='category' className='block text-sm font-medium text-gray-700'>Sub Category :</label>
              <select required value={data.subCategory} name='subCategory' onChange={handleOnChange} className='w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'>
                <option value={""}>Select SubCategory</option>
                {
                  SubCategory.map((el, index) => {
                    return (
                      <option value={el.value} key={el.value + index}>{el.label}</option>
                    )
                  })
                }
              </select>
            </div>
            <div>
              <label htmlFor='category' className='block text-sm font-medium text-gray-700'>Gender :</label>
              <select required value={data.Gender} name='Gender' onChange={handleOnChange} className='w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'>
                <option value={""}>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div >
              <label className='block text-sm font-medium text-gray-700'>Colors:</label>
              <input
                type="text"
                name="color"
                placeholder="Enter colors (comma-separated)"
                className='w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                value={data.color}
                onChange={handleOnChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            {data.Size.map((Size, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <input
                    placeholder='enter size'
                    value={Size.size}
                    onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                    type="text"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    placeholder='enter quantity'
                    value={Size.quantity}
                    onChange={(e) => handleSizeChange(index, 'quantity', e.target.value)}
                    type="number"
                    min="0"
                    step="1"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder='enter price'
                    value={Size.price}
                    onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button
                  type='button'
                  onClick={() => removeSize(index)}
                  className='self-end p-2 text-red-600 hover:bg-red-100 rounded-full'
                >
                  <MdDelete size={20} />
                </button>
              </div>
            ))}
            <button type='button' onClick={handleAddSize} className='text-green-600 flex items-center'><FaPlus /> Add Size</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pattern</label>
              <input
                placeholder='enter Pattern'
                value={data.Pattern} onChange={handleOnChange} name='Pattern'
                type="text"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fit Type
              </label>
              <input
                placeholder='enter Fit Type'
                value={data.FitType} onChange={handleOnChange} name='FitType'
                type="text"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                seasonalCollection
              </label>
              <input
                type="text"
                id='seasonalCollection'
                placeholder='enter seasonalCollection'
                value={data.seasonalCollection}
                name='seasonalCollection'
                onChange={handleOnChange}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <label htmlFor='description' className='mt-3'>Description :</label>
          <textarea
            className='h-28 bg-slate-100 border resize-none p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
            placeholder='enter product description'
            rows={3}
            onChange={handleOnChange}
            name='description'
            value={data.description}
          >
          </textarea>

          <label htmlFor='productImage' className='mt-3'>Product Image :</label>
          <label htmlFor='uploadImageInput'>
            <div className='p-2 bg-slate-100 border rounded h-32 w-full flex justify-center items-center cursor-pointer'>
              <div className='text-slate-500 flex justify-center items-center flex-col gap-2'>
                <span className='text-4xl'><FaCloudUploadAlt /></span>
                <p className='text-sm'>Upload Product Image</p>
                <input type='file' id='uploadImageInput' className='hidden' onChange={handleUploadProduct} />
              </div>
            </div>
          </label>
          <div>
            {
              data?.productImage[0] ? (
                <div className='flex items-center gap-2'>
                  {
                    data.productImage.map((el, index) => {
                      return (
                        <div className='relative group'>
                          <img
                            src={el}
                            alt={el}
                            width={80}
                            height={80}
                            className='bg-slate-100 border cursor-pointer'
                            onClick={() => {
                              setOpenFullScreenImage(true)
                              setFullScreenImage(el)
                            }} />

                          <div className='absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full hidden group-hover:block cursor-pointer' onClick={() => handleDeleteProductImage(index)}>
                            <MdDelete />
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              ) : (
                <p className='text-red-600 text-xs'>*Please upload product image</p>
              )
            }
          </div>

          <button className='px-3 py-2 bg-red-600 text-white mb-10 hover:bg-red-700'>Upload Product</button>
        </form>

        {openFullScreenImage && (
          <DisplayImage onClose={() => setOpenFullScreenImage(false)} imgUrl={fullScreenImage} />
        )}
      </div>
    </div>
  )
}

export default UploadProduct