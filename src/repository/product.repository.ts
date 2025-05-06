
import Product from "../model/product.model";
import {ArchieveStatus, ProductFilter, ProductInfo } from "../types/product.types";

export class ProductRepository{

    async getAllProducts(query: ProductFilter){
        return await Product.find({...query}).populate('category', '-__v').populate({path: 'variants', select: '-__v'}).populate('seller', '_id, store_name')
    }

    async getProductList(){
        return await Product.find({isActive: true, archieveStatus: ArchieveStatus.UnArchieve}).populate('category', '-__v').populate({path: 'variants', select: '-__v', match: {'availability': true}}).populate('seller', '_id, store_name').select('-isActive -archieveStatus')
    }

    async getProductById(id: string){
        return await Product.findById(id).populate('category', '-__v').populate('variants', '-__v').populate('seller', '_id, store_name').select('-isActive')
    }
    
    async getSellerProductList(sellerId: string, query: ProductFilter){
        return await Product.find({seller: sellerId, isActive:true, ...query}).populate('category','-__v').populate('variants', '-__v').populate('seller', '_id, store_name').select('-isActive')
    }

    async getSellerProductById(id: string, userId: string){
        return await Product.findOne({_id: id, seller: userId}).populate('category', '-__v').populate('variants', '-__v').populate('seller', '_id, store_name').select('-isActive')
    }


    async createProduct(productInfo: ProductInfo){
        const product = await Product.create(productInfo)
        return product
    }

    async editProduct(productId: string, productInfo: ProductInfo){
        return await Product.findOneAndUpdate({_id: productId}, productInfo, {new: true}).select('-isActive')
    }

    async removeProduct(productId: string){
        return await Product.findOneAndDelete({_id: productId}).select('-isActive')
    }

    async removeCategoryFromProduct(productId: string, categoryId: string, userId: string){
        return await Product.findOneAndUpdate(
            {_id: productId, seller: userId},
            {$pull: {category: categoryId}},
            {new: true}
        ).select('-isActive')
    }

    async removeVariant(productId:string, variantId: string){
        return await Product.findOneAndUpdate(
            {_id: productId},
            {$pull: {variant: variantId}},
            {new: true}
        ).select('-isActive')
    }
}