import { Response,Router } from "express";
import { ProductServices } from "../services/product.services";
import createHttpError from "../utils/httperror.utils";
import { allowedRole } from "../middlewares/role.middleware";
import { AuthRequest } from "../types/auth.types";
import { productSchema, updateProductSchema } from "../validation/product.validate";
import { validate } from "../middlewares/validation.middleware";
import { ArchieveStatus, ProductFilter, ProductInfo } from "../types/product.types";
import { availabilityValidateSchema, stockValidateSchema, updateVariantSchema} from "../validation/variant.validate";
import { verifySeller } from "../middlewares/sellerVerify.middeware";
import { handleSuccessResponse } from "../utils/httpresponse.utils";
import Logger from "../utils/logger.utils";
import winston from 'winston';
import { VariantServices } from "../services/variant.services";
import { verifyToken } from "../middlewares/auth.middleware";
import upload from "../middlewares/file.middleware";
import { ProductImagesFields } from "../constant/uploadFields";
import { parseProductInfo } from "../middlewares/parseProductInfo.middleware";
import { ProductFileInfo } from "../types/file.types";
import { parseVariant } from "../middlewares/parseVariant";
import { object } from "zod";
import { instanceCachingFactory } from "tsyringe";

export class ProductController{
    readonly router: Router;
    private static instance: ProductController;
    private readonly logger: winston.Logger;

    private constructor(private readonly productServices: ProductServices, private readonly variantServices: VariantServices, logger: Logger){
        this.router = Router()
        this.logger = logger.logger()
    }

    static initController(productServices: ProductServices, variantServices: VariantServices,logger: Logger){
        if(!ProductController.instance){
            ProductController.instance = new ProductController(productServices, variantServices, logger)
        }
        const instance = ProductController.instance

        instance.router.get('/all', verifyToken, allowedRole('admin'), instance.getAllProduct)
        instance.router.get('/all/count', instance.getProductCount)
        
        instance.router.get('/', instance.getProductList)
        instance.router.get('/best/sell', instance.getBestSellProduct)
        instance.router.get('/best/sell/:sellerId', instance.getSellerBestSellProduct)
        instance.router.get('/featured', instance.getFeaturedProduct)
        instance.router.get('/category/:categoryId', instance.getProductByCategory)
        instance.router.get('/search', instance.searchProducts)
        
        instance.router.get('/seller',verifyToken, allowedRole('seller'), verifySeller,instance.getSellerProductList)
        instance.router.get('/seller/:id',verifyToken, allowedRole('seller'), verifySeller, instance.getSellerProductById)
        instance.router.get('/count/seller', verifyToken, allowedRole('seller'), instance.getSellerProductCount)
        instance.router.get('/:id', instance.getProductById)
        instance.router.get('/sell/totalSale', verifyToken, allowedRole('seller'), instance.getTotalSale)

        instance.router.post('/', verifyToken, allowedRole('seller'), verifySeller, upload.array("variantImages"), parseProductInfo, validate(productSchema), instance.createProduct)
        instance.router.put('/:id', verifyToken, allowedRole('seller'), verifySeller, upload.array("variantImages"), parseProductInfo, validate(updateProductSchema), instance.editProduct)
        instance.router.delete('/:id', verifyToken, allowedRole('seller', 'admin'), verifySeller, instance.removeProduct)
        // instance.router.delete('/delete/:id', allowedRole('admin'), verifySeller, instance.deleteProduct)
        
        //Variant
        instance.router.get('/:id/variants', instance.getProductVariant)
        instance.router.get('/:id/variants/:variantId', instance.getVariantById)
        instance.router.delete('/:id/variants/:variantId', verifyToken, allowedRole('seller','admin'),verifySeller, instance.removeVariant)
        
        // Remove Category
        instance.router.delete('/:id/category/:categoryId',verifyToken, allowedRole('seller'), verifySeller, instance.removeCategoryFromProduct)
        
        // Remove and Add Image
        instance.router.put('/:id/variants/:variantId', verifyToken, allowedRole('seller'), verifySeller, upload.array("variantImages"), parseVariant,validate(updateVariantSchema), instance.updateProductVariant)
        instance.router.delete('/:id/variants/:variantId/images/:imageId', verifyToken, allowedRole('seller'),verifySeller, instance.removeImageFromProductVariant)
        
        // Inventory
        instance.router.put('/:id/archieve', verifyToken, allowedRole('seller'), verifySeller, instance.archieveProduct)
        instance.router.put('/:id/unarchieve', verifyToken,  allowedRole('seller'), verifySeller, instance.unarchieveProduct)
        instance.router.put('/:id/variants/:variantId/stock',verifyToken, allowedRole('seller'), verifySeller, validate(stockValidateSchema), instance.updateVariantStock)
        instance.router.put('/:id/variants/:variantId/availability', verifyToken, allowedRole('seller'), verifySeller, validate(availabilityValidateSchema), instance.updateVariantAvailability)

        return instance
    }   

    getAllProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const query = req.query
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            delete query.page
            delete query.limit
            const product = await this.productServices.getAllProducts({page: parseInt(page as string), limit: parseInt(limit as string)}, query)

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: product.count,
                total_pages: Math.ceil(product.count / parseInt(limit as string)),
            }
            handleSuccessResponse(res, "Product Fetched.", product.product, 200, paginationData)
        }catch(e: any){
            this.logger.error("Error while fetching Product list.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getProductCount = async(req: AuthRequest, res: Response) => {
        try{
            const result = await this.productServices.getProductCount()
            handleSuccessResponse(res, "Active Product Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching Active Product Count.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    searchProducts = async(req: AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10

            const searchFilter = {
                keyword: req.query.keyword as string,
                category: req.query.category as string,
                minPrice: req.query.minPrice ? Number(req.query.minPrice):undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                sortBy: req.query.sortBy as string,
                page: req.query.page ? parseInt(req.query.page as string): 1,
                limit: req.query.limit? parseInt(req.query.limit as string): 10,
            }
            console.log(searchFilter)
            const product = await this.productServices.searchProduct(searchFilter)
            const paginationData = {
                page: parseInt(page as string) ?? 1,
                limit: parseInt(limit as string) ?? 10,
                total_items: product.count,
                total_pages: Math.ceil(product.count / parseInt(limit as string)),
            }
            handleSuccessResponse(res, "Search Product Fetched.", product,200, paginationData)
        }catch(e:any){
            this.logger.error("Error while searching products.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getProductList = async(req: AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            const product = await this.productServices.getProductList({ page: parseInt(page as string), limit: parseInt(limit as string)})

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: product.count,
                total_pages: Math.ceil(product.count / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Product Fetched.", product.product, 200, paginationData)
        }catch(e: any){
            this.logger.error("Error while fetching Product list.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getProductByCategory = async(req:AuthRequest, res:Response) => {
        try{
            const categoryId = req.params.categoryId
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            const result = await this.productServices.getProductByCategory(categoryId, { page: parseInt(page as string), limit: parseInt(limit as string)})
            handleSuccessResponse(res, "Product Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching Product By Category.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    getBestSellProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            const sortBy = req.query.sortBy || "-sellCount"
            const products = await this.productServices.getBestSellProduct({page: parseInt(page as string), limit: parseInt(limit as string), sortBy: sortBy as string})
            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: products.length,
                total_pages: Math.ceil(products.length / parseInt(limit as string)),
            }
            handleSuccessResponse(res, "Best Selling Product Fetched.", products, 200, paginationData)
        }catch(e:any){
            this.logger.error("Error while getting best selling product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    getSellerBestSellProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            const sortBy = req.query.sortBy || '-sellCount'
            const sellerId = req.params.sellerId
            const products = await this.productServices.getSellerBestSellProduct(sellerId, {page: parseInt(page as string), limit: parseInt(limit as string), sortBy: sortBy as string})
            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: products.length,
                total_pages: Math.ceil(products.length / parseInt(limit as string)),
            }
            handleSuccessResponse(res, "Seller Best Selling Product Fetched.", products, 200, paginationData)
        }catch(e:any){
            this.logger.error("Error while getting seller best selling product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getTotalSale = async(req: AuthRequest, res: Response) => {
        try{
            const sellerId = req.user?._id as string
            const result = await this.productServices.getTotalSale(sellerId)
            handleSuccessResponse(res, "Seller total Sale.", result)
        }catch(e:any){
            this.logger.error("Error while fetching total sale of seller", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getFeaturedProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            const products = await this.productServices.getFeaturedProducts({page: parseInt(page as string), limit: parseInt(limit as string)})
            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: products.length,
                total_pages: Math.ceil(products.length / parseInt(limit as string)),
            }
            handleSuccessResponse(res, "Featured Product Fetched.", products, 200, paginationData)
        }catch(e:any){
            this.logger.error("Error while fetching featured product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerProductList = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.user?._id as string
            const query = req.query
            const page = req.query.page || 1 
            const limit = req.query.limit || 10
            delete query.page
            delete query.limit
            const result = await this.productServices.getSellerProductList(sellerId, {page: parseInt(page as string), limit: parseInt(limit as string)}, query)

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: result.count,
                total_pages: Math.ceil(result.count / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Seller Product List Fetched.", result.product, 200, paginationData)
        }catch(e:any){
            this.logger.error("Error while fetching Seller product list.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerProductById = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id
            const sellerId = req.user?._id as string
            const result = await this.productServices.getSellerProductById(productId, sellerId)
            handleSuccessResponse(res, "Seller Product Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching Product detail for seller.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getProductById = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id

            const result = await this.productServices.getProductById(productId)
            handleSuccessResponse(res, "Product Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching product by id.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const productInfo = req.body
            // const files = req.files as ProductFileInfo
            // console.log(files)
            const variantImages = req.files as Express.Multer.File[]
            const product = await this.productServices.createProduct(productInfo, variantImages, req.user!._id!)
            handleSuccessResponse(res, "Product Created.", product)
        } catch(e: any){
            this.logger.error("Error while creating product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }


    editProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id
            const productInfo = req.body
            const variantImages = req.files as Express.Multer.File[]

            const result = await this.productServices.editProduct(productId, productInfo, variantImages)
            handleSuccessResponse(res, "Product updated.", result)
        }catch(e: any){
            this.logger.error("Error while updating product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    // deleteProduct = async(req: AuthRequest, res: Response) =>{
    //     try{
    //         const productId = req.params.id

    //         const result = await this.productServices.deleteProduct(productId)
    //         handleSuccessResponse(res, "Product deleted.", result)
    //     }catch(e:any){
    //         this.logger.error("Error while deleting Product.", {object: e, error: new Error()})
    //         throw createHttpError.Custom(e.statusCode, e.message, e.errors)
    //     }
    // }
    
    removeProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id

            const result = await this.productServices.removeProduct(productId)
            handleSuccessResponse(res, "Product removed.", result)
        }catch(e:any){
            this.logger.error("Error while removing Product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    removeCategoryFromProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const categoryId = req.params.categoryId
            const productId = req.params.id
            const userId = req.user?._id as string

            const result = await this.productServices.removeCategoryFromProduct(productId, categoryId, userId)
            handleSuccessResponse(res, "Category Removed from product.", result)
        }catch(e: any){
            this.logger.error("Error while removing category from product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateProductVariant = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id
            const variantId = req.params.variantId
            const updateInfo = req.body
            const userId = req.user?._id as string

            const variantImages = req.files as Express.Multer.File[]
            const result= await this.productServices.updateProductVariant(productId, variantId, updateInfo,variantImages, userId)
            handleSuccessResponse(res, "Variant Updated.", result)
        }catch(e: any){
            this.logger.error("Error while updating Product Variant.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    removeImageFromProductVariant = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id
            const variantId = req.params.variantId
            const imageId = req.params.imageId
            const userId = req.user?._id as string

            const result = await this.productServices.removeImageFromProductVariant(productId,variantId, imageId, userId)
            handleSuccessResponse(res, "Image Removed from variant.", result)
        }catch(e:any){
            this.logger.error("Error while removing Image from product variant.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode,e.message, e.errors)
        }
    }

    removeVariant = async(req: AuthRequest, res: Response) =>{
        try{
            const variantId = req.params.variantId
            const productId = req.params.id

            const result = await this.productServices.removeVariant(productId, variantId)
            handleSuccessResponse(res, "Variant Removed.", result)
        }catch(e: any){
            this.logger.error("Error while removing variant from product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getProductVariant = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id

            const result = await this.productServices.getProductVariant(productId)
            handleSuccessResponse(res, "Variant Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching variant for product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getVariantById = async(req: AuthRequest, res: Response) =>{
        try{
            const variantId = req.params.variantId
            const productId = req.params.id
            const result = await this.productServices.getVariantById(productId, variantId)
            handleSuccessResponse(res, "Variant Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching variant By Id.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    updateVariantStock = async(req: AuthRequest, res: Response) =>{
        try{
            const variantId = req.params.variantId
            const {stock} = req.body
            const result = await this.variantServices.updateStock(variantId, stock)
            handleSuccessResponse(res, "Variant Stock Updated.", result)
        }catch(e: any){
            this.logger.error("Error while updating stock.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateVariantAvailability = async(req: AuthRequest, res: Response) =>{
        try{
            const variantId = req.params.variantId

            const{availability} = req.body
            const result = await this.variantServices.updateVariantAvailability(variantId, availability)
            handleSuccessResponse(res, "Variant Availability Updated.", result)
        }catch(e:any){
            this.logger.error("Error while updating availability of variant.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }


    archieveProduct = async(req: AuthRequest, res: Response) =>{
        try{    
            const productId = req.params.id
            const result = await this.productServices.updateArchieveStatus(ArchieveStatus.Archieve, productId)
            handleSuccessResponse(res, "Archieve Status Updated.", result)
        }catch(e:any){
            this.logger.error("Error while updating archieve status of product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    unarchieveProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id
            const result = await this.productServices.updateArchieveStatus(ArchieveStatus.UnArchieve, productId)
            handleSuccessResponse(res, "Archieve Status Updated.", result)
        }catch(e:any){
            this.logger.error("Error while unarchieving product.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }


    getSellerProductCount = async(req: AuthRequest, res: Response) => {
        try{
            const sellerId = req.user?._id as string
            const result = await this.productServices.getSellerProductCount(sellerId)
            handleSuccessResponse(res, "Seller Product Count Fetched.", result)
        }catch(e:any){
            this.logger.error("Error while fetching product Count.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}