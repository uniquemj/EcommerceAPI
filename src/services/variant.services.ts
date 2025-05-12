import { VariantRepository } from "../repository/variant.repository";
import { ImageInfo } from "../types/image.types";
import { VariantInfo, VariantInput } from "../types/variants.types";
import createHttpError from "../utils/httperror.utils";


export class VariantServices {

    constructor(private readonly variantRepository: VariantRepository) { }

    getVariantProduct = async (variantId: string) => {
        const variant = await this.variantRepository.getVariant(variantId)
        return variant?.product
    }

    createVariantFromVariantList = async (product_id: string, variants: VariantInput[]) => {
        const variantList: VariantInfo[] = await Promise.all(variants?.map(async (variant) => {
            const variantInfo = {
                product: product_id,
                color: variant.color,
                images: [...variant.images as ImageInfo[]],
                price: variant.price,
                size: variant.size ?? "",
                stock: variant.stock,
                availability: variant.availability,
                packageWeight: variant.packageWeight ?? 1,
                packageLength: variant.packageLength,
                dangerousGoods: variant.dangerousGoods,
                warrantyType: variant.warrantyType,
                warrantyPeriod: variant.warrantyPeriod ?? 1,
                warrantyPolicy: variant.warrantyPolicy ?? ""
            }

            const newVariant = await this.variantRepository.createVariant(variantInfo)
            return newVariant
        }) || [])

        return variantList
    }

    async createVariant(variantInfo: VariantInput) {
        const result = await this.variantRepository.createVariant(variantInfo)
        return result
    }

    async updateVariant(variantId: string, updateVariantInfo: VariantInfo) {
        const variantExist = await this.variantRepository.getVariant(variantId)
        if (!variantExist) {
            throw createHttpError.NotFound("Variant with Id not found.")
        }
        const result = await this.variantRepository.updateVariant(variantId, updateVariantInfo)
        return result
    }

    async getVariant(variantId: string) {
        const variantExist = await this.variantRepository.getVariant(variantId)
        if (!variantExist) {
            throw createHttpError.NotFound("Variant with Id not found.")
        }
        return variantExist
    }

    async getVariantByProduct(productId: string) {
        const variantExist = await this.variantRepository.getVariantByProduct(productId)
        if (!variantExist) {
            throw createHttpError.NotFound("Variant with Id not found.")
        }
        return variantExist
    }

    async deleteVariant(variantId: string) {
        const variantExist = await this.variantRepository.getVariant(variantId)
        if (!variantExist) {
            throw createHttpError.NotFound("Variant with Id not found.")
        }
        const result = await this.variantRepository.deleteVariant(variantId)
        return result
    }

    async removeImageFromProductVariant(variantId: string, imageId: string) {
        const variantExist = await this.variantRepository.getVariant(variantId)
        console.log(variantExist)

        if (!variantExist) {
            throw createHttpError.NotFound("Variant with Id not found.")
        }
        const imageStatus = variantExist.images.some((image) => image._id == imageId)

        if (!imageStatus) {
            throw createHttpError.NotFound("Image with id not found in variant.")
        }

        const result = await this.variantRepository.removeImageFromProductVariant(variantId, imageId)
        return result
    }

    async updateStock(variantId: string, stock: number) {
        const variantExist = await this.variantRepository.getVariant(variantId)
        if(!variantExist){
            throw createHttpError.NotFound("Variant with Id not found.")
        }
        const result = await this.variantRepository.updateStock(variantId, stock)
        return result
    }

    updateVariantAvailability = async(variantId: string, status: boolean)=>{
        const variantExist = await this.variantRepository.getVariant(variantId)
        if(!variantExist){
            throw createHttpError.NotFound("Variant with Id not found.")
        }
        const result = await this.variantRepository.updateVariant(variantId, {availability: status})
        return result
    }
}