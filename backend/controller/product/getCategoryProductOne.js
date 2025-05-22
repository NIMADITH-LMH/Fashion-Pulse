
const productModel = require("../../models/productModel")


const getCategoryProduct = async (req,res) => {
    try {
        const productCategory = await productModel.distinct("category")
       console.log("category",productCategory)


       //array to store product by category
       const productByCategeory = []
       
        for (const category of productCategory) {
            const product = await productModel.findOne({category})

            if(product){
                productByCategeory.push(product)
        }
    }

        res.json({

            message : "Product by category",
            error : false,
            success : true,
            data : productByCategeory
        })
        
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error:true,
            success : false
        })
    }
}
        
module.exports = getCategoryProduct