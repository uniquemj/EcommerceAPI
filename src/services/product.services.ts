import { ProductRepository } from "../repository/product.repository";
import { CategoryInfo } from "../types/category.types";
import { ImageInfo } from "../types/image.types";
import { ProductFilter, ProductInfo } from "../types/product.types";
import { VariantInfo } from "../types/variants.types";
import createHttpError from "../utils/httperror.utils";
import { uploadImages } from "../utils/uploadImage.utils";
import { VariantServices } from "./variant.services";
import { CategoryServices } from "./category.services";

export class ProductServices{

    constructor(private readonly productRepository: ProductRepository, private readonly categoryServices: CategoryServices, private readonly variantServices: VariantServices){}

    async getAllProducts(query: ProductFilter){
        try{
            const products = await this.productRepository.getAllProducts(query)
            if(products.length == 0){
                throw createHttpError.NotFound("Product list is Empty.")
            }
            return products
        }catch(error){
            throw error
        }
    }

    async getProductList(){
        try{
            const products = await this.productRepository.getProductList()
            if(products.length == 0){
                throw createHttpError.NotFound("Product list is Empty.")
            }
            return products
        }catch(error){
            throw error
        }
    }

    async getProductById(productId: string){
        try{
            const product = await this.productRepository.getProductById(productId)
            
            if(!product){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            return product
        }catch(error){
            throw error
        }
    }

    async getSellerProductList(sellerId: string, query: ProductFilter){
        try{
            const productExist = await this.productRepository.getSellerProductList(sellerId, query)

            if(productExist.length == 0){
                throw createHttpError.NotFound("Seller Product List Empty.")
            }
            return productExist
        }catch(error){
            throw error
        }
    }
    
    async getSellerProductById(productId: string, sellerID: string){
        try{
            const productExist = await this.productRepository.getSellerProductById(productId, sellerID)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            return productExist
        }catch(error){
            throw error
        }
    }

    async createProduct(productInfo: ProductInfo, userId: string){
        try{
            const {name, category, variants, productDescripton, productHighlights} = productInfo

            const categoryExist = await this.categoryServices.getCategoryById(category as string) as unknown as CategoryInfo

            let variantList: VariantInfo[] = []

            const productDetail = {
                seller: userId,
                name: name,
                category: [categoryExist],
                variants: variantList,
                productDescripton: productDescripton ?? "",
                productHighlights: productHighlights ?? "",
            }
            
            const product = await this.productRepository.createProduct(productDetail) as unknown as ProductInfo

            if(variants?.length as number > 0){
                variantList = await this.variantServices.createVariantFromVariantList(product._id as string, variants as VariantInfo[])
                const result = await this.productRepository.editProduct(product._id as string, {defaultVariant: variantList[0]._id,variants: variantList})
                return result
            }
            return product
        }catch(error){
            throw error
        }
    }

    async editProduct(productId: string, productInfo: ProductInfo){
        try{
            const productExist = await this.productRepository.getProductById(productId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }

            let variantList: VariantInfo[] = []

            if(productInfo.variants?.length as number > 0){
                variantList = await this.variantServices.createVariantFromVariantList(productExist._id as string, productInfo.variants as VariantInfo[])
            }

            let updateProductInfo: ProductInfo = {...productInfo, variants: [...productExist.variants, ...variantList]}

            if(productInfo.category){
                const categoryExist = await this.categoryServices.getCategoryById(productInfo.category as string) as unknown as CategoryInfo
                
                if(!categoryExist){
                    throw createHttpError.BadRequest("Category of Id not found.")
                } 
                updateProductInfo = {
                    category: [...productExist.category, categoryExist]
                }
            }
            
            const result = await this.productRepository.editProduct(productId, updateProductInfo as unknown as ProductInfo)
            return result
        }catch(error){
            throw error
        }
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

    async removeProduct(productId: string){
        try{
            const productExist = await this.productRepository.getProductById(productId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }

            const result = await this.productRepository.editProduct(productId, {isActive: false})
            return result
        }catch(error){
            throw error
        }
    }

    async removeCategoryFromProduct(productId: string, categoryId: string, userId: string){
        try{
            const productExist = await this.productRepository.getSellerProductById(productId, userId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            const result = await this.productRepository.removeCategoryFromProduct(productId, categoryId, userId)
            return result
        }catch(error){
            throw error
        }
    }

    async updateProductVariant(productId: string, variantId: string, updateInfo: VariantInfo, userId: string){
        try{
            const productExist = await this.productRepository.getSellerProductById(productId,userId)

            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }

            const variantStatus = productExist.variants.some((item) => item._id == variantId)

            if(!variantStatus){
                throw createHttpError.NotFound("Variant doesn't exist on product.")
            }

            const variant = await this.variantServices.getVariant(variantId)

            if(updateInfo.images){
                updateInfo.images = [...variant.images, ...updateInfo.images]
            } 

            const result = await this.variantServices.updateVariant(variantId, updateInfo)
            return result
        }catch(error){
            throw error
        }
    }

    async removeImageFromProductVariant(productId:string, variantId: string, imageId: string, userId: string){
        try{
            const productExist = await this.productRepository.getSellerProductById(productId,userId)

            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }

            const variantStatus = productExist.variants.some((item) => item._id == variantId)

            if(!variantStatus){
                throw createHttpError.NotFound("Variant doesn't exist on product.")
            }
            

            const result = await this.variantServices.removeImageFromProductVariant(variantId, imageId)
            return result
        }catch(error){
            throw error
        }
    }


    async removeVariant(productId: string, variantId: string){
        try{
            const productExist = await this.productRepository.getProductById(productId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            await this.variantServices.deleteVariant(variantId)
            const result = await this.productRepository.removeVariant(productId, variantId)
            return result
        }catch(error){
            throw error
        }
    }

    async getProductVariant(productId: string){
        try{
            const productExist = await this.productRepository.getProductById(productId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }

            const variants = await this.variantServices.getVariantByProduct(productId)
            return variants

        }catch(error){
            throw error
        }
    }

    async updateArchieveStatus(status: string, productId: string){
        try{
            const productExist = await this.productRepository.getProductById(productId)

            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }

            const result = await this.productRepository.editProduct(productId, {archieveStatus: status})
            return result
        }catch(error){
            throw error
        }
    }
}