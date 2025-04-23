import { VariantRepository } from "../repository/variant/variant.repository"


export class Helper{
    private readonly variantRepository: VariantRepository

    constructor(){
        this.variantRepository = new VariantRepository()
    }

    getVariantSeller = async(variantId: string) =>{
        const variant = await this.variantRepository.getVariant(variantId)
        console.log(variant)
    }
}