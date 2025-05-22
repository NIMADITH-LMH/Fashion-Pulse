import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SummaryApi from '../common'
import VerticalCard from '../components/VerticalCard'
import { MdSearch, MdFilterList, MdSort } from 'react-icons/md'

const SearchProduct = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [data,setData] = useState([])
    const [loading,setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [filterCategory, setFilterCategory] = useState('all')
    const [categories, setCategories] = useState([])

    // Get search query from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const query = params.get('q') || ''
        setSearchQuery(query)
    }, [location.search])

    // Fetch products based on search query
    useEffect(() => {
        if (searchQuery) {
            fetchProducts()
        }
    }, [searchQuery, sortBy, filterCategory])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${SummaryApi.searchProduct.url}${encodeURIComponent(searchQuery)}`)
            const dataResponse = await response.json()
            
            if (dataResponse.success) {
                let results = dataResponse.data
                
                // Extract unique categories for filtering
                const uniqueCategories = [...new Set(results.map(item => item.category))].filter(Boolean)
                setCategories(uniqueCategories)
                
                // Apply category filter if not 'all'
                if (filterCategory !== 'all') {
                    results = results.filter(item => item.category === filterCategory)
                }
                
                // Apply sorting
                results = sortResults(results, sortBy)
                
                setData(results)
            } else {
                setData([])
            }
        } catch (error) {
            console.error('Error fetching search results:', error)
            setData([])
        } finally {
            setLoading(false)
        }
    }

    const sortResults = (results, sortOption) => {
        switch (sortOption) {
            case 'newest':
                return [...results].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            case 'price-low':
                return [...results].sort((a, b) => {
                    const aPrice = a.Size?.[0]?.price || 0
                    const bPrice = b.Size?.[0]?.price || 0
                    return aPrice - bPrice
                })
            case 'price-high':
                return [...results].sort((a, b) => {
                    const aPrice = a.Size?.[0]?.price || 0
                    const bPrice = b.Size?.[0]?.price || 0
                    return bPrice - aPrice
                })
            default:
                return results
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    return (
        <div className='container mx-auto p-4 mt-20'>
            {/* Search Header */}
            <div className='mb-6'>
                <h1 className='text-2xl font-bold mb-4'>Search Results</h1>
                
                <form onSubmit={handleSearch} className='flex mb-4'>
                    <input
                        type='text'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder='Search products...'
                        className='flex-1 border border-gray-300 rounded-l-md p-2 outline-none focus:border-red-500'
                    />
                    <button 
                        type='submit'
                        className='bg-red-600 text-white px-4 rounded-r-md hover:bg-red-700 transition-colors flex items-center'
                    >
                        <MdSearch className='mr-1' /> Search
                    </button>
                </form>
            </div>
            
            {/* Filter and Sort Controls */}
            <div className='flex flex-wrap gap-4 mb-6 items-center'>
                <div className='flex items-center'>
                    <MdFilterList className='text-gray-500 mr-2' />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className='border border-gray-300 rounded-md p-2 outline-none focus:border-red-500'
                    >
                        <option value='all'>All Categories</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className='flex items-center'>
                    <MdSort className='text-gray-500 mr-2' />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className='border border-gray-300 rounded-md p-2 outline-none focus:border-red-500'
                    >
                        <option value='newest'>Newest First</option>
                        <option value='price-low'>Price: Low to High</option>
                        <option value='price-high'>Price: High to Low</option>
                    </select>
                </div>
                
                <div className='ml-auto font-medium'>
                    {data.length} {data.length === 1 ? 'result' : 'results'} found
                </div>
            </div>
            
            {/* Loading State */}
            {loading && (
                <div className='flex justify-center items-center py-12'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600'></div>
                </div>
            )}
            
            {/* No Results */}
            {!loading && data.length === 0 && (
                <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
                    <MdSearch className='text-5xl text-gray-400 mx-auto mb-4' />
                    <h2 className='text-xl font-medium mb-2'>No products found</h2>
                    <p className='text-gray-500 mb-4'>
                        We couldn't find any products matching "{searchQuery}"
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className='bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors'
                    >
                        Browse All Products
                    </button>
                </div>
            )}
            
            {/* Search Results */}
            {!loading && data.length > 0 && (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                    <VerticalCard data={data} loading={loading} />
                </div>
            )}
        </div>
    )
}

export default SearchProduct