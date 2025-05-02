import { Response,Router } from "express";
import { ProductServices } from "../services/product.services";
import createHttpError from "../utils/httperror.utils";
import { allowedRole } from "../middlewares/role.middleware";
import { AuthRequest } from "../types/auth.types";
import { productSchema, updateProductSchema } from "../validation/product.validate";
import { validate } from "../middlewares/validation.middleware";
import { ProductInfo } from "../types/product.types";
import { updateVariantSchema} from "../validation/variant.validate";
import { verifySeller } from "../middlewares/sellerVerify.middeware";
import { handleSuccessResponse } from "../utils/httpresponse.utils";

export class ProductController{
    readonly router: Router;
    private static instance: ProductController;
    
    private constructor(private readonly productServices: ProductServices){
        this.router = Router()
    }

    static initController(productServices: ProductServices){
        if(!ProductController.instance){
            ProductController.instance = new ProductController(productServices)
        }
        const instance = ProductController.instance

        instance.router.get('/', allowedRole('customer','admin'), instance.getProductList)
        instance.router.get('/seller',allowedRole('seller'), verifySeller,instance.getSellerProductList)
        instance.router.get('/seller/:id',allowedRole('seller'), verifySeller, instance.getSellerProductById)
        instance.router.get('/:id', allowedRole('customer', 'admin'), instance.getProductById)

        instance.router.post('/', allowedRole('seller'), verifySeller, validate(productSchema), instance.createProduct)
        instance.router.put('/:id', allowedRole('seller'), verifySeller, validate(updateProductSchema), instance.editProduct)
        instance.router.delete('/:id', allowedRole('seller', 'admin'), verifySeller, instance.removeProduct)
        
        //Variant
        instance.router.get('/:id/variants', allowedRole('seller'), verifySeller, instance.getProductVariant)
        instance.router.delete('/:id/variants/:variantId', allowedRole('seller','admin'),verifySeller, instance.removeVariant)

        // Remove Category
        instance.router.delete('/:id/category/:categoryId', allowedRole('seller'), verifySeller, instance.removeCategoryFromProduct)
        
        // Remove and Add Image
        instance.router.put('/:id/variants/:variantId', allowedRole('seller'), verifySeller, validate(updateVariantSchema), instance.updateProductVariant)
        instance.router.delete('/:id/variants/:variantId/images/:imageId', allowedRole('seller'),verifySeller, instance.removeImageFromProductVariant)

        return instance
    }   

    getProductList = async(req: AuthRequest, res: Response) =>{
        try{
            const product = await this.productServices.getProductList()
            handleSuccessResponse(res, "Product Fetched.", product)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerProductList = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.user?._id as string

            const result = await this.productServices.getSellerProductList(sellerId)
            handleSuccessResponse(res, "Seller Product List Fetched.", result)
        }catch(e:any){
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
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getProductById = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id

            const result = await this.productServices.getProductById(productId)
            handleSuccessResponse(res, "Product Fetched.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const productInfo = req.body as ProductInfo
            const product = await this.productServices.createProduct(productInfo, req.user!._id!)
            handleSuccessResponse(res, "Product Created.", product)
        } catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    editProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id
            const productInfo = req.body
            const userId = req.user?._id as string

            const result = await this.productServices.editProduct(productId, productInfo, userId)
            handleSuccessResponse(res, "Product updated.", result)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    removeProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id

            const result = await this.productServices.removeProduct(productId)
            handleSuccessResponse(res, "Product removed.", result)
        }catch(e:any){
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
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getProductVariant = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id

            const result = await this.productServices.getProductVariant(productId)
            handleSuccessResponse(res, "Variant Fetched.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}