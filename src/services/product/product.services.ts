import { CategoryRepository } from "../../repository/category/category.repository";
import { ProductRepository } from "../../repository/product/product.repository";
import { SellerRepository } from "../../repository/user/seller.repository";
import { CategoryInfo } from "../../types/category.types";
import { ImageInfo } from "../../types/image.types";
import { ProductInfo } from "../../types/product.types";
import { VariantInfo } from "../../types/variants.types";
import createHttpError from "../../utils/httperror.utils";
import { uploadImages } from "../../utils/uploadImage.utils";
import { VariantRepository } from "../../repository/variant/variant.repository";

export class ProductServices{
    private readonly productRepository: ProductRepository;
    private readonly categoryRepository: CategoryRepository;
    private readonly variantRepository: VariantRepository

    constructor(){
        this.productRepository = new ProductRepository()
        this.categoryRepository = new CategoryRepository()
        this.variantRepository = new VariantRepository()
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

    async createProduct(productInfo: ProductInfo, productImages: Express.Multer.File[],variantImages: Express.Multer.File[], userId: string){
        try{
            const {name, category, variants, productDescripton, productHighlights} = productInfo
            
            const productImageUrls =  await Promise.all(
                productImages?.map(async(image) =>{
                const secure_url = await uploadImages(image.path)
                return {url: secure_url}
                }) || []
            ) as ImageInfo[]

            const variantImagesUrls = await Promise.all(
                variantImages.map(async (image)=>{
                    const secure_url = await uploadImages(image.path)
                    return {url: secure_url}
                }) || []
            ) as ImageInfo[]

            const categoryExist = await this.categoryRepository.getCategoryById(category as string) as unknown as CategoryInfo
            if(!categoryExist){
                throw createHttpError.BadRequest("Category of Id not found.")
            } 

            let variantList: VariantInfo[] = []
            const productDetail = {
                seller: userId,
                name: name,
                images: productImageUrls,
                category: [categoryExist],
                variants: variantList,
                productDescripton: productDescripton ?? "",
                productHighlights: productHighlights ?? "",
            }
            
            const product = await this.productRepository.createProduct(productDetail) as unknown as ProductInfo

            if(variants?.length as number > 0){
                variantList = await Promise.all(variants?.map(async (variant, index) => {
                        const variantInfo = {
                            product: product._id,
                            color: variant.color,
                            images: [variantImagesUrls[index]],
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
                    }) || []
                )
                const result = await this.productRepository.editProduct(product._id as string, {variants: variantList}, userId)
                return result
            }
            return product
        }catch(error){
            throw error
        }
    }

    async editProduct(productId: string, productInfo: ProductInfo, variantImages: Express.Multer.File[], userId: string){
        try{
            const productExist = await this.productRepository.getProductByUserId(productId, userId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }

            const variantImagesUrls = await Promise.all(
                variantImages.map(async (image)=>{
                    const secure_url = await uploadImages(image.path)
                    return {url: secure_url}
                }) || []
            ) as ImageInfo[]

            let variantList: VariantInfo[] = []

            if(productInfo.variants?.length as number > 0){
                variantList = await Promise.all(productInfo.variants?.map(async (variant, index) => {
                        const variantInfo = {
                            product: productExist._id as unknown as string,
                            color: variant.color,
                            price: variant.price,
                            images: [variantImagesUrls[index]],
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
                    }) || []
                )
            }

            let updateProductInfo: ProductInfo = {...productInfo, variants: [...productExist.variants, ...variantList]}

            if(productInfo.category){
                const categoryExist = await this.categoryRepository.getCategoryById(productInfo.category as string) as unknown as CategoryInfo
                
                if(!categoryExist){
                    throw createHttpError.BadRequest("Category of Id not found.")
                } 
                updateProductInfo = {
                    category: [...productExist.category, categoryExist]
                }
            }
            
            const result = await this.productRepository.editProduct(productId, updateProductInfo as unknown as ProductInfo, userId)
            return result
        }catch(error){
            throw error
        }
    }

    async removeProduct(productId: string, userId: string){
        try{
            const productExist = await this.productRepository.getProductByUserId(productId, userId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            productExist.variants.forEach(async(variant)=>{
                await this.variantRepository.deleteVariant(variant._id as string )
            })

            const result = await this.productRepository.removeProduct(productId, userId)
            return result
        }catch(error){
            throw error
        }
    }

    async removeCategoryFromProduct(productId: string, categoryId: string, userId: string){
        try{
            const productExist = await this.productRepository.getProductByUserId(productId, userId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            const result = await this.productRepository.removeCategoryFromProduct(productId, categoryId, userId)
            return result
        }catch(error){
            throw error
        }
    }

    async addImageToProduct(productId: string, productImages: Express.Multer.File[], userId: string){
        try{
            const productExist = await this.productRepository.getProductByUserId(productId,userId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            const ImageUrls = await Promise.all(productImages.map(async(image)=>{
                    const secure_url = await uploadImages(image.path)
                    return {'url': secure_url}
                }) || []
            ) as unknown as ImageInfo[]

            ImageUrls.forEach(async(image) =>{
                await this.productRepository.addImageToProduct(productId, userId, image)
            })

            const product = await this.productRepository.getProductByUserId(productId, userId)
            return product
        }catch(error){
            throw error
        }
    }

    async removeImageFromProduct(productId:string, imageId: string, userId: string){
        try{
            const productExist = await this.productRepository.getProductByUserId(productId,userId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }

            const result = await this.productRepository.removeImageFromProduct(productId, imageId, userId)
            return result
        }catch(error){
            throw error
        }
    }


    async removeVariant(productId: string, variantId: string, userId: string){
        try{
            const productExist = await this.productRepository.getProductByUserId(productId, userId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            await this.variantRepository.deleteVariant(variantId)
            const result = await this.productRepository.removeVariant(productId, variantId, userId)
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

            const variants = await this.variantRepository.getVariantByProduct(productId)
            console.log(variants)
            return variants

        }catch(error){
            throw error
        }
    }
}