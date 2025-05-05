import { ProductRepository } from "../repository/product.repository";
import { VariantRepository } from "../repository/variant.repository";
import { ImageInfo } from "../types/image.types";
import { VariantInfo } from "../types/variants.types";
import createHttpError from "../utils/httperror.utils";
import { ProductServices } from "./product.services";


export class VariantServices{

    constructor(private readonly variantRepository: VariantRepository){}

    getVariantSeller = async(variantId: string) =>{
        try{
            const variant = await this.variantRepository.getVariant(variantId)
            return variant?.product
        } catch(error){
            throw error
        }
    }

    createVariantFromVariantList = async(product_id: string, variants: VariantInfo[]) =>{
        try{
            const variantList : VariantInfo[] = await Promise.all(variants?.map(async (variant) => {
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
                const newVariant =  await this.variantRepository.createVariant(variantInfo)
                return newVariant as unknown as VariantInfo
            }) || [])

            return variantList
        }catch(error){
            throw error
        }
    }

    async createVariant(variantInfo: VariantInfo){
        try{
            const result = await this.variantRepository.createVariant(variantInfo)
            return result
        }catch(error){
            throw error
        }
    }

    async updateVariant(variantId: string, updateVariantInfo: VariantInfo){
        try{    
            const variantExist = await this.variantRepository.getVariant(variantId)
            if(!variantExist){
                throw createHttpError.NotFound("Variant with Id not found.")
            }
            const result = await this.variantRepository.updateVariant(variantId, updateVariantInfo)
            return result
        }catch(error){
            throw error
        }
    }

    async getVariant(variantId: string){
        try{
            const variantExist = await this.variantRepository.getVariant(variantId)
            if(!variantExist){
                throw createHttpError.NotFound("Variant with Id not found.")
            }
            return variantExist
        }catch(error){
            throw error
        }
    }

    async getVariantByProduct(productId: string){
        try{
            const variantExist = await this.variantRepository.getVariantByProduct(productId)
            if(!variantExist){
                throw createHttpError.NotFound("Variant with Id not found.")
            }
            return variantExist
        }catch(error){
            throw error
        }
    }

    async deleteVariant(variantId: string){
        try{
            const variantExist = await this.variantRepository.getVariant(variantId)
            if(!variantExist){
                throw createHttpError.NotFound("Variant with Id not found.")
            }
            const result = await this.variantRepository.deleteVariant(variantId)
            return result
        }catch(error){
            throw error
        }
    }

    async removeImageFromProductVariant(variantId: string, imageId: string){
        try{
            console.log(variantId)
            const variantExist = await this.variantRepository.getVariant(variantId)
            console.log(variantExist)

            if(!variantExist){
                throw createHttpError.NotFound("Variant with Id not found.")
            }
            const imageStatus = variantExist.images.some((image) => image._id == imageId)

            if(!imageStatus){
                throw createHttpError.NotFound("Image with id not found in variant.")
            }

            const result = await this.variantRepository.removeImageFromProductVariant(variantId, imageId)
            return result
        }catch(error){
            throw error
        }
    }

    async updateStock(variantId: string, quantity: number){
        try{
            const result = await this.variantRepository.updateStock(variantId, quantity)
            return result
        }catch(error){
            throw error
        }
    }
}