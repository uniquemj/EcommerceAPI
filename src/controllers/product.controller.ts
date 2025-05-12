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

        instance.router.get('/all', allowedRole('admin'), instance.getAllProduct)
        instance.router.get('/', allowedRole('customer'), instance.getProductList)
        instance.router.get('/search', instance.searchProducts)
        instance.router.get('/seller',allowedRole('seller'), verifySeller,instance.getSellerProductList)
        instance.router.get('/seller/:id',allowedRole('seller'), verifySeller, instance.getSellerProductById)
        instance.router.get('/:id', allowedRole('customer', 'admin'), instance.getProductById)

        instance.router.post('/', allowedRole('seller'), verifySeller, validate(productSchema), instance.createProduct)
        instance.router.put('/:id', allowedRole('seller'), verifySeller, validate(updateProductSchema), instance.editProduct)
        instance.router.delete('/:id', allowedRole('seller', 'admin'), verifySeller, instance.removeProduct)
        // instance.router.delete('/delete/:id', allowedRole('admin'), verifySeller, instance.deleteProduct)
        
        //Variant
        instance.router.get('/:id/variants', allowedRole('seller'), verifySeller, instance.getProductVariant)
        instance.router.delete('/:id/variants/:variantId', allowedRole('seller','admin'),verifySeller, instance.removeVariant)
        
        // Remove Category
        instance.router.delete('/:id/category/:categoryId', allowedRole('seller'), verifySeller, instance.removeCategoryFromProduct)
        
        // Remove and Add Image
        instance.router.put('/:id/variants/:variantId', allowedRole('seller'), verifySeller, validate(updateVariantSchema), instance.updateProductVariant)
        instance.router.delete('/:id/variants/:variantId/images/:imageId', allowedRole('seller'),verifySeller, instance.removeImageFromProductVariant)
        
        // Inventory
        instance.router.put('/:id/archieve', allowedRole('seller'), verifySeller, instance.archieveProduct)
        instance.router.put('/:id/unarchieve', allowedRole('seller'), verifySeller, instance.unarchieveProduct)
        instance.router.put('/:id/variants/:variantId/stock', allowedRole('seller'), verifySeller, validate(stockValidateSchema), instance.updateVariantStock)
        instance.router.put('/:id/variants/:variantId/availability', allowedRole('seller'), verifySeller, validate(availabilityValidateSchema), instance.updateVariantAvailability)

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
            handleSuccessResponse(res, "Product Fetched.", product)
        }catch(e: any){
            this.logger.error("Error while fetching Product list.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    searchProducts = async(req: AuthRequest, res: Response) =>{
        try{
            const searchFilter = {
                keyword: req.query.keyword as string,
                category: req.query.category as string,
                minPrice: req.query.minPrice ? Number(req.query.minPrice):undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                page: req.query.page ? parseInt(req.query.page as string): 1,
                limit: req.query.limit? parseInt(req.query.limit as string): 10
            }
            const product = await this.productServices.searchProduct(searchFilter)
            handleSuccessResponse(res, "Search Product Fetched.", product)
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

            handleSuccessResponse(res, "Product Fetched.", product, 200)
        }catch(e: any){
            this.logger.error("Error while fetching Product list.", {object: e, error: new Error()})
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
            handleSuccessResponse(res, "Seller Product List Fetched.", result)
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
            const product = await this.productServices.createProduct(productInfo, req.user!._id!)
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

            const result = await this.productServices.editProduct(productId, productInfo)
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

            const result= await this.productServices.updateProductVariant(productId, variantId, updateInfo, userId)
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
}