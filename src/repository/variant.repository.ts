import { injectable } from "tsyringe";
import Variant from "../model/variant.model";
import { ImageInfo } from "../types/image.types";
import { VariantRepositoryInterface } from "../types/repository.types";
import { VariantInfo, VariantInput } from "../types/variants.types";

@injectable()
export class VariantRepository implements VariantRepositoryInterface{

    async createVariant(variantInfo:Partial<VariantInput>): Promise<VariantInfo>{
        return await Variant.create(variantInfo)
    }
    
    async getVariant(variantId: string): Promise<VariantInfo | null>{
        return await Variant.findById(variantId)
        .populate({path: "product", select: "_id name seller"})
    }

    async getVariantByProduct(productId: string): Promise<VariantInfo[]>{
        return await Variant.find({product: productId})
        .populate('product', '_id name seller')
    }

    async updateVariant(variantId: string, updateInfo: VariantInput): Promise<VariantInfo|null>{
        return await Variant.findByIdAndUpdate(variantId, updateInfo, {new: true})
    }
    async deleteVariant(variantId: string): Promise<VariantInfo | null>{
        return await Variant.findByIdAndDelete(variantId)
    }

    async addImageToProductVariant(variantId: string,image: ImageInfo): Promise<VariantInfo | null>{
        return await Variant.findOneAndUpdate(
            {_id: variantId},
            {$push: {images: image}},
            {new: true}
        )
    }

    async removeImageFromProductVariant(variantId:string, imageId: string): Promise<VariantInfo | null>{
        return await Variant.findOneAndUpdate(
            {_id: variantId},
            {$pull: {images: {_id: imageId}}},
            {new: true}
        )
    }

    async updateStock(variantId: string, quantity: number):Promise<VariantInfo | null>{
        return await Variant.findByIdAndUpdate(
            variantId,
            {$inc: {stock: quantity}},
            {new: true}
        )
    }
}