import Product from "../../model/product/product.model";
import { ImageInfo } from "../../types/image.types";
import { ProductInfo } from "../../types/product.types";
import { VariantRepository } from "../variant/variant.repository";
import { VariantInfo } from "../../types/variants.types";

export class ProductRepository{
    private readonly variantRepository: VariantRepository

    constructor(){
        this.variantRepository = new VariantRepository()
    }

    async getProductList(){
        return await Product.find({}).populate('category seller variants','title images color price special_price stock sellerSKU store_name _id')
    }

    async getProductByUserId(id: string, userId: string){
        return await Product.findOne({_id: id, seller: userId})
    }

    async getProductById(id: string){
        return await Product.findById(id)
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

    async addImageToProduct(productId: string, userId: string, image: ImageInfo){
        await Product.findOneAndUpdate(
            {_id: productId, seller: userId},
            {$push: {images: image}},
            {new: true}
        )
    }

    async removeImageFromProduct(productId:string, imageId: string, userId:string){
        return await Product.findOneAndUpdate(
            {_id: productId, seller: userId},
            {$pull: {images: {_id: imageId}}},
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