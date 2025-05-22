const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUD_NAME_CLOUDINARY}/upload`


const uploadImage = async(image) => {
    const formData = new FormData()
    formData.append("file", image)
    formData.append("upload_preset", "mern_product")
    
    try {
        const dataResponse = await fetch(url, {
            method: "POST",
            body: formData
        })
        
        if (!dataResponse.ok) {
            throw new Error('Network response was not ok')
        }
        
        return dataResponse.json()
    } catch (error) {
        console.error('Error uploading image:', error)
        throw error
    }
}

export default uploadImage 