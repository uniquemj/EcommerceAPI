import { CategoryRepository } from "../../repository/category/category.repository";
import { ProductRepository } from "../../repository/product/product.repository";
import { SellerRepository } from "../../repository/user/seller.repository";
import { CategoryInfo } from "../../types/category.types";
import { ImageInfo } from "../../types/image.types";
import { ProductInfo } from "../../types/product.types";
import { SellerInfo } from "../../types/user.types";
import createHttpError from "../../utils/httperror.utils";
import { uploadImages } from "../../utils/uploadImage.utils";

export class ProductServices{
    private readonly productRepository: ProductRepository;
    private readonly categoryRepository: CategoryRepository;
    private readonly sellerRepository: SellerRepository

    constructor(){
        this.productRepository = new ProductRepository()
        this.categoryRepository = new CategoryRepository()
        this.sellerRepository = new SellerRepository()
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

    async getProductById(productId: string, userId: string){
        try{
            const product = this.productRepository.getProductById(productId, userId)
            if(!product){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            return product
        }catch(error){
            throw error
        }
    }

    async createProduct(productInfo: ProductInfo, productImages: Express.Multer.File[], userId: string){
        try{
            const {name, category, price, specialPrice,color, availability, stock, sellerSKU,productDescripton, productHighlights, packageWeight, packageLength, warrantyPeriod, warrantyPolicy} = productInfo
            
            const imageUrls =  await Promise.all(
                productImages?.map(async(image) =>{
                const secure_url = await uploadImages(image.path)
                return {url: secure_url}
                }) || []
            )


            let categoryList:CategoryInfo[] = []
            const categoryExist = await this.categoryRepository.getCategory(category as string)
            
            if(!categoryExist){
                const newCategory = await this.categoryRepository.createCategoryList(category as string) as unknown as CategoryInfo

                categoryList.push(newCategory)

                const productDetail = {
                    seller: userId,
                    name: name,
                    images: imageUrls as ImageInfo[],
                    category: categoryList,
                    price: isNaN(Number(parseInt(price as string))) ? 0: Number(parseInt(price as string)),
                    specialPrice: isNaN(Number(parseFloat(specialPrice as string)))? 1: Number(parseFloat(specialPrice as string)),
                    color: color??"",
                    availability: availability??true,
                    stock: isNaN(Number(parseInt(stock as string)))? 0: Number(parseInt(stock as string)),
                    sellerSKU: sellerSKU ?? "",
                    productDescripton: productDescripton ?? "",
                    productHighlights: productHighlights ?? "",
                    packageWeight: isNaN(Number(parseFloat(packageWeight as string)))? 0 : Number(parseFloat(packageWeight as string)),
                    packageLength: packageLength,
                    warrantyPeriod: isNaN(Number(parseInt(warrantyPeriod as string))) ? 1 : Number(parseInt(warrantyPeriod as string)),
                    warrantyPolicy: warrantyPolicy ?? ""
                }

                const result = await this.productRepository.createProduct(productDetail)
                return result
            }
            
            categoryList.push(categoryExist as unknown as CategoryInfo)

            const productDetail = {
                seller: userId,
                name: name,
                images: imageUrls as ImageInfo[],
                category: categoryList,
                price: isNaN(Number(parseInt(price as string))) ? 0: Number(parseInt(price as string)),
                specialPrice: isNaN(Number(parseFloat(specialPrice as string)))? 1: Number(parseFloat(specialPrice as string)),
                color: color??"",
                availability: availability??true,
                stock: isNaN(Number(parseInt(stock as string)))? 0: Number(parseInt(stock as string)),
                sellerSKU: sellerSKU ?? "",
                productDescripton: productDescripton ?? "",
                productHighlights: productHighlights ?? "",
                packageWeight: isNaN(Number(parseFloat(packageWeight as string)))? 0 : Number(parseFloat(packageWeight as string)),
                packageLength: packageLength,
                warrantyPeriod: isNaN(Number(parseInt(warrantyPeriod as string))) ? 1 : Number(parseInt(warrantyPeriod as string)),
                warrantyPolicy: warrantyPolicy ?? ""
            }

            const result = await this.productRepository.createProduct(productDetail)
            return result
        }catch(error){
            throw error
        }
    }

    async editProduct(productId: string, productInfo: ProductInfo, userId: string){
        try{
            const productExist = await this.productRepository.getProductById(productId, userId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }

            if(productInfo.category){
                
                const categoryExist = await this.categoryRepository.getCategory(productInfo.category as string) as unknown as CategoryInfo
                if(!categoryExist){
                    const newCategory = await this.categoryRepository.createCategoryList(productInfo.category as string)
                    const updateProductInfo = {...productInfo, category: [...productExist.category, newCategory]}
        
                    const result = await this.productRepository.editProduct(productId, updateProductInfo as unknown as ProductInfo, userId)
                    return result
                }   
                const updateProductInfo = {
                    ...productInfo, category: [...productExist.category, categoryExist]
                }
                const result = await this.productRepository.editProduct(productId, updateProductInfo as unknown as ProductInfo, userId)
                return result
            }
            const updateProductInfo = {
                ...productInfo
            }
            const result = await this.productRepository.editProduct(productId, updateProductInfo as unknown as ProductInfo, userId)
            return result
        }catch(error){
            throw error
        }
    }

    async removeProduct(productId: string, userId: string){
        try{
            const productExist = await this.productRepository.getProductById(productId, userId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            const result = await this.productRepository.removeProduct(productId, userId)
            return result
        }catch(error){
            throw error
        }
    }

    async removeCategoryFromProduct(productId: string, categoryId: string, userId: string){
        try{
            const productExist = await this.productRepository.getProductById(productId, userId)
            if(!productExist){
                throw createHttpError.NotFound("Product with Id not found.")
            }
            const result = await this.productRepository.removeCategoryFromProduct(productId, categoryId, userId)
            return result
        }catch(error){
            throw error
        }
    }
}