
import Product from "../model/product.model";
import { paginationField } from "../types/pagination.types";
import {ArchieveStatus, CountFilter, ProductFilter, ProductInfo, ProductInputInfo } from "../types/product.types";
import { ProductRepositoryInterface } from "../types/repository.types";

export class ProductRepository implements ProductRepositoryInterface{
    private categoryPopulate = {path: "category", select: '-__v',populate: {path: "parent_category"}}
    private defaultVariantPopulate = {path: "defaultVariant"}

    async getAllProducts(pagination: paginationField, query: ProductFilter): Promise<ProductInfo[]>{
        return await Product.find({isActive: true, ...query})
        .limit(pagination.limit)
        .skip((pagination.page - 1) * pagination.limit)
        .populate(this.categoryPopulate)
        .populate({path: 'variants', select: '-__v'})
        .populate('seller', '_id, store_name').populate(this.defaultVariantPopulate)
    }

    async getProductList(pagination: paginationField): Promise<ProductInfo[]>{
        return await Product.find({isActive: true, archieveStatus: ArchieveStatus.UnArchieve})
        .skip((pagination.page-1)*pagination.limit)
        .limit(pagination.limit)
        .populate('category', '-__v')
        .populate({path: 'variants', select: '-__v', match: {'availability': true}})
        .populate('seller', '_id, store_name')
        .populate(this.defaultVariantPopulate)
        .select('-isActive -archieveStatus')
    }

    async getProductCounts(query: CountFilter): Promise<number>{
        return await Product.countDocuments({isActive: true, ...query})
    }

    async getProductById(id: string):Promise<ProductInfo | null>{
        return await Product.findById(id)
        .populate('category', '-__v')
        .populate('variants', '-__v')
        .populate('seller', '_id, store_name')
        .select('-isActive')
    }
    
    async getSellerProductList(sellerId: string, pagination: paginationField, query: ProductFilter): Promise<ProductInfo[]>{
        return await Product.find({seller: sellerId, isActive:true, ...query})
        .skip((pagination.page-1)*pagination.limit)
        .limit(pagination.limit)
        .populate('category','-__v')
        .populate('variants', '-__v')
        .populate('seller', '_id, store_name')
        .populate(this.defaultVariantPopulate)
        .select('-isActive')
    }

    async getSellerProductById(id: string, userId: string): Promise<ProductInfo | null>{
        return await Product.findOne({_id: id, seller: userId})
        .populate('category', '-__v')
        .populate('variants', '-__v')
        .populate('seller', '_id, store_name')
        .select('-isActive')
    }


    async createProduct(productInfo: Partial<ProductInputInfo>): Promise<ProductInfo>{
        const product = await Product.create(productInfo)
        return product
    }

    async editProduct(productId: string, productInfo: Partial<ProductInputInfo>): Promise<ProductInfo | null>{
        return await Product.findOneAndUpdate({_id: productId}, productInfo, {new: true})
        .select('-isActive')
    }

    async removeProduct(productId: string): Promise<ProductInfo | null>{
        return await Product.findOneAndDelete({_id: productId})
        .select('-isActive')
    }

    async removeCategoryFromProduct(productId: string, categoryId: string, userId: string): Promise<ProductInfo | null>{
        return await Product.findOneAndUpdate(
            {_id: productId, seller: userId},
            {$pull: {category: categoryId}},
            {new: true}
        ).select('-isActive')
    }

    async removeVariant(productId:string, variantId: string): Promise<ProductInfo | null>{
        return await Product.findOneAndUpdate(
            {_id: productId},
            {$pull: {variant: variantId}},
            {new: true}
        ).select('-isActive')
    }
}