import { Router, Response } from "express";
import { CartServices } from "../../services/cart/cart.services";
import { AuthRequest } from "../../types/auth.types";
import createHttpError from "../../utils/httperror.utils";
import { allowedRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { addCartSchema, updateCartSchema } from "../../validation/cart.validate";
import { handleSuccessResponse } from "../../utils/httpresponse.utils";

export class CartController{
    readonly router: Router
    private static instance: CartController;

    private constructor(private readonly cartServices: CartServices){
        this.router = Router()
    }

    static initController(cartServices: CartServices){
        if(!CartController.instance){
            CartController.instance = new CartController(cartServices)
        }
        const instance = CartController.instance

        instance.router.get('/', allowedRole('customer'), instance.getCartByUserId)
        instance.router.post('/add/:id', validate(addCartSchema), allowedRole('customer'), instance.addToCart)
        instance.router.post('/remove/:id', allowedRole('customer'), allowedRole('customer'), instance.removeItemFromCart)
        instance.router.post('/quantity/:id', validate(updateCartSchema), allowedRole('customer'), instance.updateCart)
        instance.router.get('/total', allowedRole('customer'), instance.getCartTotal)
        
        return instance
    }

    getCartByUserId = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const cart = await this.cartServices.getCartByUserId(userId)
            handleSuccessResponse(res, "Cart Fetched Successfully.", cart)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    addToCart = async(req: AuthRequest, res: Response) =>{
        try{
            const itemId = req.params.id
            const userId = req.user?._id as string
            const quantity = req.body.quantity
            const result = await this.cartServices.addToCart(itemId, userId, quantity)
            handleSuccessResponse(res, "Added to Cart", result)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    removeItemFromCart = async(req: AuthRequest, res: Response) =>{
        try{
            const itemId = req.params.id
            const userId = req.user?._id as string
            const result = await this.cartServices.removeItemFromCart(itemId, userId)
            handleSuccessResponse(res, "Item removed from Cart.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    updateCart = async(req: AuthRequest, res: Response) =>{
        try{
            const itemId = req.params.id
            const userId = req.user?._id as string
            const quantity = req.body.quantity

            const result = await this.cartServices.updateCart(itemId, quantity, userId)
            handleSuccessResponse(res, "Cart Updated.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getCartTotal = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const result = await this.cartServices.getCartTotal(userId)
            handleSuccessResponse(res, "Cart Total Calculated.", result)
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}