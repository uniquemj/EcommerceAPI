import {Request, Response, Router} from 'express'
import { CategoryServices } from '../../services/category/category.services';
import createHttpError from '../../utils/httperror.utils';
import { allowedRole } from '../../middlewares/role.middleware';
import { verifyToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { categorySchema } from '../../validation/category.validate';
import { AuthRequest } from '../../types/auth.types';
import { CategoryInfo } from '../../types/category.types';

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

        instance.router.get('/', allowedRole('customer','seller'),instance.getCategoryList)
        instance.router.post('/', allowedRole('seller'),validate(categorySchema), instance.createCategory)
        instance.router.put('/:id', allowedRole('seller'), instance.updateCategory)
        instance.router.delete('/:id', allowedRole('seller'), instance.removeCategory)
        return instance
    }

    getCategoryList = async(req: AuthRequest, res: Response) =>{
        try{
            const category = await this.categoryServices.getCategoryList()
            res.status(200).send({message:"Category Fetched.", response: category})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createCategory = async(req: AuthRequest, res: Response) =>{
        try{
            const categoryInfo = req.body as CategoryInfo
            const category = await this.categoryServices.createCategory(categoryInfo)
            res.status(200).send({message: "Category Created.", response: category})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message,e.errors)
        }
    }

    updateCategory = async(req: AuthRequest, res: Response) =>{
        try{
            const {title} = req.body
            const id = req.params.id
            const category = await this.categoryServices.updateCategory(id, title)
            res.status(200).send({message: "Category Updated", response: category})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    removeCategory = async(req: AuthRequest, res: Response) =>{
        try{
            const {id} = req.params
            const result = await this.categoryServices.removeCategory(id)
            res.status(200).send({message: "Category Removed.", response: result})
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}