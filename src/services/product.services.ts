import { ProductRepository } from "../repository/product.repository";
import { CategoryInfo } from "../types/category.types";
import { ImageInfo } from "../types/image.types";
import { ArchieveStatus, ProductFilter, ProductInfo, ProductInputInfo } from "../types/product.types";
import { VariantInfo, VariantInput } from "../types/variants.types";
import createHttpError from "../utils/httperror.utils";
import { VariantServices } from "./variant.services";
import { CategoryServices } from "./category.services";
import { paginationField } from "../types/pagination.types";

export class ProductServices {

    constructor(private readonly productRepository: ProductRepository, private readonly categoryServices: CategoryServices, private readonly variantServices: VariantServices) { }

    async getAllProducts(pagination: paginationField, query: ProductFilter) {
        const products = await this.productRepository.getAllProducts(pagination, query)
        const productCount = await this.productRepository.getProductCounts({...query})
        if (products.length == 0) {
            throw createHttpError.NotFound("Product list is Empty.")
        }
        return {count: productCount, product: products}
    }

    

    async getProductList(pagination: paginationField) {
        const products = await this.productRepository.getProductList(pagination)
        const productCount = await this.productRepository.getProductCounts({archieveStatus: ArchieveStatus.UnArchieve})
        if (products.length == 0) {
            throw createHttpError.NotFound("Product list is Empty.")
        }
        return {count: productCount, product: products}
    }

    async getProductById(productId: string) {
        const product = await this.productRepository.getProductById(productId)

        if (!product) {
            throw createHttpError.NotFound("Product with Id not found.")
        }
        return product
    }

    async getSellerProductList(sellerId: string, pagination: paginationField, query: ProductFilter) {
        const productExist = await this.productRepository.getSellerProductList(sellerId, pagination, query)

        if (productExist.length == 0) {
            throw createHttpError.NotFound("Seller Product List Empty.")
        }

        const productCount = await this.productRepository.getProductCounts({seller: sellerId, ...query})
        return {count: productCount, product: productExist}
    }

    async getSellerProductById(productId: string, sellerID: string) {
        const productExist = await this.productRepository.getSellerProductById(productId, sellerID)
        if (!productExist) {
            throw createHttpError.NotFound("Product with Id not found.")
        }
        return productExist
    }

    async createProduct(productInfo: ProductInfo, userId: string) {

        const { name, category, variants, productDescripton, productHighlights } = productInfo

        const categoryExist = await this.categoryServices.getCategoryById(category as string)

        let variantList: VariantInput[] = []

        const productDetail = {
            seller: userId,
            name: name,
            category: [categoryExist],
            variants: variantList,
            productDescripton: productDescripton ?? "",
            productHighlights: productHighlights ?? "",
        }

        const product = await this.productRepository.createProduct(productDetail)

        if (variants?.length > 0) {
            variantList = await this.variantServices.createVariantFromVariantList(product._id, variants as unknown as VariantInput[])
            const result = await this.productRepository.editProduct(product._id, { defaultVariant: variantList[0]._id, variants: variantList })
            return result
        }
        return product
    }

    async editProduct(productId: string, productInfo: Partial<ProductInputInfo>) {
        const productExist = await this.productRepository.getProductById(productId)
        if (!productExist) {
            throw createHttpError.NotFound("Product with Id not found.")
        }

        let variantList:VariantInfo[] = []

        if (productInfo.variants?.length as number > 0) {
            variantList = await this.variantServices.createVariantFromVariantList(productExist._id as string, productInfo.variants as VariantInput[])
        }

        let updateProductInfo: Partial<ProductInputInfo> = { ...productInfo, variants: [...productExist.variants, ...variantList] }

        if (productInfo.category) {
            const categoryExist = await this.categoryServices.getCategoryById(productInfo.category as string)

            if (!categoryExist) {
                throw createHttpError.BadRequest("Category of Id not found.")
            }
            updateProductInfo = {
                category: [...productExist.category as CategoryInfo[], categoryExist]
            }
        }

        const result = await this.productRepository.editProduct(productId, updateProductInfo)
        return result
    }

    // async deleteProduct(productId: string){
    //     try{
    //         const productExist = await this.productRepository.getProductById(productId)
    //         if(!productExist){
    //             throw createHttpError.NotFound("Product with Id not found.")
    //         }

    //         productExist.variants.forEach(async(variant)=>{
    //             await this.variantServices.deleteVariant(variant._id as string )
    //         })

    //         const result = await this.productRepository.removeProduct(productId)
    //         return result
    //     }catch(error){
    //         throw error
    //     }
    // }

    async removeProduct(productId: string) {
        const productExist = await this.productRepository.getProductById(productId)
        if (!productExist) {
            throw createHttpError.NotFound("Product with Id not found.")
        }

        const result = await this.productRepository.editProduct(productId, { isActive: false })
        return result
    }

    async removeCategoryFromProduct(productId: string, categoryId: string, userId: string) {
        const productExist = await this.productRepository.getSellerProductById(productId, userId)
        if (!productExist) {
            throw createHttpError.NotFound("Product with Id not found.")
        }
        const result = await this.productRepository.removeCategoryFromProduct(productId, categoryId, userId)
        return result
    }

    async updateProductVariant(productId: string, variantId: string, updateInfo: VariantInfo, userId: string) {
        const productExist = await this.productRepository.getSellerProductById(productId, userId)

        if (!productExist) {
            throw createHttpError.NotFound("Product with Id not found.")
        }

        const variantStatus = productExist.variants.some((item) => item._id == variantId)

        if (!variantStatus) {
            throw createHttpError.NotFound("Variant doesn't exist on product.")
        }

        const variant = await this.variantServices.getVariant(variantId)

        if (updateInfo.images) {
            updateInfo.images = [...variant.images, ...updateInfo.images]
        }

        const result = await this.variantServices.updateVariant(variantId, updateInfo)
        return result
    }

    async removeImageFromProductVariant(productId: string, variantId: string, imageId: string, userId: string) {
        const productExist = await this.productRepository.getSellerProductById(productId, userId)

        if (!productExist) {
            throw createHttpError.NotFound("Product with Id not found.")
        }

        const variantStatus = productExist.variants.some((item) => item._id == variantId)

        if (!variantStatus) {
            throw createHttpError.NotFound("Variant doesn't exist on product.")
        }


        const result = await this.variantServices.removeImageFromProductVariant(variantId, imageId)
        return result
    }


    async removeVariant(productId: string, variantId: string) {
        const productExist = await this.productRepository.getProductById(productId)
        if (!productExist) {
            throw createHttpError.NotFound("Product with Id not found.")
        }
        await this.variantServices.deleteVariant(variantId)
        const result = await this.productRepository.removeVariant(productId, variantId)
        return result
    }

    async getProductVariant(productId: string) {
        const productExist = await this.productRepository.getProductById(productId)
        if (!productExist) {
            throw createHttpError.NotFound("Product with Id not found.")
        }

        const variants = await this.variantServices.getVariantByProduct(productId)
        return variants
    }

    async updateArchieveStatus(status: string, productId: string) {
        const productExist = await this.productRepository.getProductById(productId)

        if (!productExist) {
            throw createHttpError.NotFound("Product with Id not found.")
        }

        const result = await this.productRepository.editProduct(productId, { archieveStatus: status })
        return result
    }
}