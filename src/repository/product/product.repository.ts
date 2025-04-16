import Product from "../../model/product/product.model";
import { ProductInfo } from "../../types/product.types";

export class ProductRepository{
    async getProductList(){
        return await Product.find({}).populate('category seller','store_name name -_id')
    }

    async getProductById(id: string, userId: string){
        return await Product.findOne({_id: id, seller: userId})
    }

    async createProduct(productInfo: ProductInfo){
        return await Product.create(productInfo)
    }

    async editProduct(productId: string, productInfo: ProductInfo, userId: string){
        return await Product.findOneAndUpdate({seller: userId, _id: productId}, productInfo, {new: true})
    }

    async removeProduct(productId: string, userId: string){
        return await Product.findOneAndDelete({_id: productId, seller: userId})
    }

    async removeCategoryFromProduct(productId: string, categoryId: string, userId: string){
        return await Product.findOneAndUpdate(
            {_id: productId, seller: userId},
            {$pull: {category: categoryId}},
            {new: true}
        )
    }
}