import { Response,Router } from "express";
import { ProductServices } from "../../services/product/product.services";
import createHttpError from "../../utils/httperror.utils";
import { allowedRole } from "../../middlewares/role.middleware";
import { AuthRequest } from "../../types/auth.types";
import { productSchema, updateProductSchema } from "../../validation/product.validate";
import { validate } from "../../middlewares/validation.middleware";
import { ProductInfo } from "../../types/product.types";
import { updateVariantSchema} from "../../validation/variant.validate";
import { verifySeller } from "../../middlewares/sellerVerify.middeware";

export class ProductController{
    readonly router: Router;
    private static instance: ProductController;
    
    private constructor(private readonly productServices: ProductServices){
        this.router = Router()
    }

    static initController(productServices: ProductServices){
        const instance = new ProductController(productServices)
        ProductController.instance = instance

        instance.router.get('/', allowedRole('customer','admin'), instance.getProductList)
        instance.router.get('/seller',allowedRole('seller'), verifySeller,instance.getSellerProductList)
        instance.router.get('/seller/:id',allowedRole('seller'), verifySeller, instance.getSellerProductById)
        instance.router.get('/:id', allowedRole('customer', 'admin'), instance.getProductById)

        instance.router.post('/', allowedRole('seller'), verifySeller, validate(productSchema), instance.createProduct)
        instance.router.put('/:id', allowedRole('seller'), verifySeller, validate(updateProductSchema), instance.editProduct)
        instance.router.delete('/:id', allowedRole('seller', 'admin'), verifySeller, instance.removeProduct)
        
        //Variant
        instance.router.get('/:id/variants', allowedRole('seller'), verifySeller, instance.getProductVariant)
        instance.router.post('/:id/variants/:variantId', allowedRole('seller','admin'),verifySeller, instance.removeVariant)

        // Remove Category
        instance.router.post('/:id/category/:categoryId', allowedRole('seller'), verifySeller, instance.removeCategoryFromProduct)
        
        // Remove and Add Image
        instance.router.put('/:id/variants/:variantId', allowedRole('seller'), verifySeller, validate(updateVariantSchema), instance.updateProductVariant)
        instance.router.put('/:id/variants/:variantId/images/:imageId', allowedRole('seller'),verifySeller, instance.removeImageFromProductVariant)

        return instance
    }   

    getProductList = async(req: AuthRequest, res: Response) =>{
        try{
            const product = await this.productServices.getProductList()
            res.status(200).send({message: "Product Fetched.", response: product})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerProductList = async(req: AuthRequest, res: Response) =>{
        try{
            const sellerId = req.user?._id as string

            const result = await this.productServices.getSellerProductList(sellerId)
            res.status(200).send({message: "Seller Product List Fetched.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getSellerProductById = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id
            const sellerId = req.user?._id as string
            const result = await this.productServices.getSellerProductById(productId, sellerId)
            res.status(200).send({message: "Seller Product Fetched.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getProductById = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id

            const result = await this.productServices.getProductById(productId)
            res.status(200).send({message: "Product Fetched.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const productInfo = req.body as ProductInfo
            const product = await this.productServices.createProduct(productInfo, req.user!._id!)
            res.status(200).send({message: "Product Created.", response: product})
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
            res.status(200).send({message: "Product updated.", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    removeProduct = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id

            const result = await this.productServices.removeProduct(productId)
            res.status(200).send({message: "Product removed.", response: result})
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
            res.status(200).send({message: "Category Removed from product.", response: result})
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
            res.status(200).send({message:"Variant Updated.", response: result})
            
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
            res.status(200).send({message: "Image removed.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode,e.message, e.errors)
        }
    }

    removeVariant = async(req: AuthRequest, res: Response) =>{
        try{
            const variantId = req.params.variantId
            const productId = req.params.id

            const result = await this.productServices.removeVariant(productId, variantId)
            res.status(200).send({message: "Variant Removed.", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getProductVariant = async(req: AuthRequest, res: Response) =>{
        try{
            const productId = req.params.id

            const result = await this.productServices.getProductVariant(productId)
            res.status(200).send({message: "Variant Fetched.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}