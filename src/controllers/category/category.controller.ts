import {Request, Response, Router} from 'express'
import { CategoryServices } from '../../services/category/category.services';
import createHttpError from '../../utils/httperror.utils';
import { allowedRole } from '../../middlewares/role.middleware';
import { verifyToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { categorySchema } from '../../validation/category.validate';

export class CategoryController{
    readonly router: Router;
    private static instance: CategoryController;
    private readonly categoryServices: CategoryServices;

    private constructor(){
        this.router = Router()
        this.categoryServices = new CategoryServices()
    }

    static initController(){
        const instance = new CategoryController()
        CategoryController.instance = instance

        instance.router.get('/',verifyToken, allowedRole('customer','seller'),instance.getCategoryList)
        instance.router.post('/', verifyToken, allowedRole('seller'),validate(categorySchema), instance.createCategory)
        instance.router.delete('/:id', verifyToken, allowedRole('seller'), instance.removeCategory)
        return instance
    }

    getCategoryList = async(req: Request, res: Response) =>{
        try{
            const category = await this.categoryServices.getCategoryList()
            res.status(200).send({message:"Category Fetched.", response: category})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createCategory = async(req: Request, res: Response) =>{
        try{
            const {name} = req.body
            const category = await this.categoryServices.createCategory(name)
            res.status(200).send({message: "Category Created.", response: category})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message,e.errors)
        }
    }

    removeCategory = async(req: Request, res: Response) =>{
        try{
            const {id} = req.params
            const result = await this.categoryServices.removeCategory(id)
            res.status(200).send({message: "Category Removed.", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}