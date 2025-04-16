import { Response,Router } from "express";
import { ProductServices } from "../../services/product/product.services";
import createHttpError from "../../utils/httperror.utils";
import { verifyToken } from "../../middlewares/auth.middleware";
import { allowedRole } from "../../middlewares/role.middleware";
import { IAuthRequest } from "../../types/auth.types";
import upload from "../../middlewares/file.middleware";
import { UploadFields } from "../../constant/uploadFields";
import { productSchema } from "../../validation/product.validate";
import { validate } from "../../middlewares/validation.middleware";
import { FileInfo } from "../../types/file.types";
import { uploadImages } from "../../utils/uploadImage.utils";
import { ProductInfo } from "../../types/product.types";

export class ProductController{
    readonly router: Router;
    private static instance: ProductController;
    private readonly productServices: ProductServices

    private constructor(){
        this.router = Router()
        this.productServices = new ProductServices()
    }

    static initController(){
        const instance = new ProductController()
        ProductController.instance = instance

        instance.router.get('/', verifyToken, allowedRole('customer', 'seller'), instance.getProductList)
        instance.router.get('/:id', verifyToken, allowedRole('customer', 'seller'), instance.getProductById)
        instance.router.post('/', verifyToken, allowedRole('seller'), upload.fields(UploadFields), validate(productSchema), instance.createProduct)
        instance.router.put('/:id', verifyToken, allowedRole('seller'), instance.editProduct)
        instance.router.delete('/:id', verifyToken, allowedRole('seller'), instance.removeProduct)
        instance.router.put('/category/:id', verifyToken, allowedRole('seller'), instance.removeCategoryFromProduct)
        return instance
    }   

    getProductList = async(req: IAuthRequest, res: Response) =>{
        try{
            const product = await this.productServices.getProductList()
            res.status(200).send({message: "Product List is Empty.", response: product})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getProductById = async(req: IAuthRequest, res: Response) =>{
        try{
            const productId = req.params.id
            const userId = req.user?._id as string

            const result = await this.productServices.getProductById(productId, userId)
            res.status(200).send({message: "Product Fetched.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createProduct = async(req: IAuthRequest, res: Response) =>{
        try{
            const productInfo = req.body as ProductInfo
            const files = req.files as FileInfo
            const productImages = files['productImages'] as Express.Multer.File[]
            const product = await this.productServices.createProduct(productInfo, productImages, req.user!._id!)
            res.status(200).send({message: "Product Created.", response: product})
        } catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    editProduct = async(req: IAuthRequest, res: Response) =>{
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

    removeProduct = async(req: IAuthRequest, res: Response) =>{
        try{
            const productId = req.params.id
            const userId = req.user?._id as string

            const result = await this.productServices.removeProduct(productId, userId)
            res.status(200).send({message: "Product removed.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    removeCategoryFromProduct = async(req: IAuthRequest, res: Response) =>{
        try{
            const categoryId = req.params.id
            const {productId} = req.body
            const userId = req.user?._id as string

            const result = await this.productServices.removeCategoryFromProduct(productId, categoryId, userId)
            res.status(200).send({message: "Category Removed from product.", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}