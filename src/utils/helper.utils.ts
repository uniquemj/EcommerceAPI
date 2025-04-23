import { ProductRepository } from "../repository/product/product.repository"
import { VariantRepository } from "../repository/variant/variant.repository"


export class Helper{
    private readonly variantRepository: VariantRepository
    private readonly productRepository: ProductRepository

    constructor(){
        this.variantRepository = new VariantRepository()
        this.productRepository = new ProductRepository()
    }

    getVariantSeller = async(variantId: string): Promise<string> =>{
        const variant = await this.variantRepository.getVariant(variantId)
        const productDetail = await this.productRepository.getProductById(variant?.product as unknown as string)
        return productDetail?.seller as unknown as string
    }
}