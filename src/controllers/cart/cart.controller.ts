import { Router, Response } from "express";
import { CartServices } from "../../services/cart/cart.services";
import { AuthRequest } from "../../types/auth.types";
import createHttpError from "../../utils/httperror.utils";
import { allowedRole } from "../../middlewares/role.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { addCartSchema, updateCartSchema } from "../../validation/cart.validate";

export class CartController{
    readonly router: Router
    private static instace: CartController;
    private readonly cartServices: CartServices;

    private constructor(){
        this.router = Router()
        this.cartServices = new CartServices()
    }

    static initController(){
        const instance = new CartController()
        CartController.instace = instance

        instance.router.get('/', allowedRole('customer'), instance.getCart)
        instance.router.post('/add/:id', validate(addCartSchema), allowedRole('customer'), instance.addToCart)
        instance.router.post('/remove/:id', allowedRole('customer'), allowedRole('customer'), instance.removeItemFromCart)
        instance.router.post('/quantity/:id', validate(updateCartSchema), allowedRole('customer'), instance.updateCart)
        instance.router.get('/total', allowedRole('customer'), instance.getCartTotal)
        
        return instance
    }

    getCart = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const cart = await this.cartServices.getCart(userId)
            res.status(200).send({message: "Cart Fetched Successfully", response: cart})
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
            res.status(200).send({message: "Added to Cart", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    removeItemFromCart = async(req: AuthRequest, res: Response) =>{
        try{
            const itemId = req.params.id
            const userId = req.user?._id as string
            const result = await this.cartServices.removeItemFromCart(itemId, userId)
            res.status(200).send({message: "Item removed from Cart.", response: result})
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
            res.status(200).send({message: "Quantity updated.", response: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getCartTotal = async(req: AuthRequest, res: Response) =>{
        try{
            const userId = req.user?._id as string
            const result = await this.cartServices.getCartTotal(userId)
            res.status(200).send({message: "Cart Total Calculated.", total: result})
        }catch(e:any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}