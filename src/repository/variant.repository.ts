import Variant from "../model/variant.model";
import { ImageInfo } from "../types/image.types";
import { VariantInfo } from "../types/variants.types";

export class VariantRepository{

    async createVariant(variantInfo: VariantInfo){
        return await Variant.create(variantInfo)
    }
    
    async getVariant(variantId: string){
        return await Variant.findById(variantId).populate({path: "product", select: "_id name seller"})
    }

    async getVariantByProduct(productId: string){
        return await Variant.find({product: productId}).populate('product', '_id name seller')
    }

    async updateVariant(variantId: string, updateInfo: VariantInfo){
        return await Variant.findByIdAndUpdate(variantId, updateInfo, {new: true})
    }
    async deleteVariant(variantId: string){
        return await Variant.findByIdAndDelete(variantId)
    }

    async addImageToProductVariant(variantId: string,image: ImageInfo){
        await Variant.findOneAndUpdate(
            {_id: variantId},
            {$push: {images: image}},
            {new: true}
        )
    }

    async removeImageFromProductVariant(variantId:string, imageId: string){
        return await Variant.findOneAndUpdate(
            {_id: variantId},
            {$pull: {images: {_id: imageId}}},
            {new: true}
        )
    }

    async updateStock(variantId: string, quantity: number){
        return await Variant.findByIdAndUpdate(
            variantId,
            {$inc: {stock: quantity}},
            {new: true}
        )
    }
}