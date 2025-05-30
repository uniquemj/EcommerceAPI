import { inject, injectable } from "tsyringe";
import { VariantRepository } from "../repository/variant.repository";
import { ImageInfo } from "../types/image.types";
import { VariantRepositoryInterface } from "../types/repository.types";
import { VariantInfo, VariantInput } from "../types/variants.types";
import createHttpError from "../utils/httperror.utils";
import { CloudServices } from "./cloud.services";

@injectable()
export class VariantServices {

    constructor(@inject('VariantRepositoryInterface') private readonly variantRepository: VariantRepositoryInterface, @inject(CloudServices) private readonly cloudServices: CloudServices) { }

    getVariantProduct = async (variantId: string) => {
        const variant = await this.variantRepository.getVariant(variantId)
        return variant?.product
    }

    createVariantFromVariantList = async (product_id: string, variants: VariantInput[]) => {
        const variantList: VariantInfo[] = await Promise.all(variants?.map(async (variant) => {
            const variantInfo = {
                product: product_id,
                color: variant.color,
                images: variant.images,
                price: variant.price,
                size: variant.size ?? "",
                stock: variant.stock,
                availability: variant.availability,
                packageWeight: variant.packageWeight ?? 1,
                packageLength: variant.packageLength
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

    async updateVariant(variantId: string, updateVariantInfo: Partial<VariantInput>) {
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
        await this.cloudServices.destroyImage(String(variantExist.images))
        const result = await this.variantRepository.deleteVariant(variantId)
        return result
    }

    async removeImageFromProductVariant(variantId: string, imageId: string) {
        const variantExist = await this.variantRepository.getVariant(variantId)

        if (!variantExist) {
            throw createHttpError.NotFound("Variant with Id not found.")
        }

        if (String(variantExist.images) != imageId) {
            throw createHttpError.NotFound("Image with id not found in variant.")
        }

        await this.cloudServices.destroyImage(imageId)

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