import Product from "../../model/product/product.model";
import { ImageInfo } from "../../types/image.types";
import { ProductInfo } from "../../types/product.types";

export class ProductRepository{

    async getProductList(){
        return await Product.find({}).populate('category', '-__v').populate('variants', '-__v').populate('seller', '_id, store_name')
    }

    async getProductById(id: string){
        return await Product.findById(id).populate('category', '-__v').populate('variants', '-__v').populate('seller', '_id, store_name')
    }
    
    async getSellerProductList(sellerId: string){
        return await Product.find({seller: sellerId}).populate('variants', '-__v').populate('seller', '_id, store_name')
    }

    async getSellerProductById(id: string, userId: string){
        return await Product.findOne({_id: id, seller: userId}).populate('category', '-__v').populate('variants', '-__v').populate('seller', '_id, store_name')
    }


    async createProduct(productInfo: ProductInfo){
        const product = await Product.create(productInfo)
        return product
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

    async removeVariant(productId:string, variantId: string, userId: string){
        return await Product.findOneAndUpdate(
            {_id: productId, seller: userId},
            {$pull: {variant: variantId}},
            {new: true}
        )
    }
}