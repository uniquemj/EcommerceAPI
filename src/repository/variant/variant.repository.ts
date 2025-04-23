import Variant from "../../model/variant/variant.model";
import { VariantInfo } from "../../types/variants.types";

export class VariantRepository{
    async createVariant(variantInfo: VariantInfo){
        return await Variant.create(variantInfo)
    }

    async getVariant(variantId: string){
        return await Variant.findById(variantId).populate('product', '_id name seller')
    }

    async getVariantByProduct(productId: string){
        return await Variant.find({product: productId}).populate('product', '_id name seller')
    }

    async deleteVariant(variantId: string){
        return await Variant.findByIdAndDelete(variantId)
    }
}