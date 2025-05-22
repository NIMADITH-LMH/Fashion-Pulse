
import React from "react"
import { useParams } from "react-router-dom"

const CategeoryProduct = () => {

    const params = useParams()
    
    return (
        <div>
            {params?.categoryName}
        </div>
    )
}

export default CategeoryProduct