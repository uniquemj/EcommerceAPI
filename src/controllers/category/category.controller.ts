import {Request, Response, Router} from 'express'
import { CategoryServices } from '../../services/category/category.services';
import createHttpError from '../../utils/httperror.utils';
import { allowedRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validation.middleware';
import { categorySchema } from '../../validation/category.validate';
import { AuthRequest } from '../../types/auth.types';
import { CategoryInfo } from '../../types/category.types';
import { handleSuccessResponse } from '../../utils/httpresponse.utils';

export class CategoryController{
    readonly router: Router;
    private static instance: CategoryController;
    

    private constructor(private readonly categoryServices: CategoryServices){
        this.router = Router()
    }

    static initController(categoryServices: CategoryServices){
        const instance = new CategoryController(categoryServices)
        CategoryController.instance = instance

        instance.router.get('/', allowedRole('customer','seller', 'admin'),instance.getCategoryList)
        instance.router.post('/', allowedRole('admin'),validate(categorySchema), instance.createCategory)
        instance.router.put('/:id', allowedRole('admin'), instance.updateCategory)
        instance.router.delete('/:id', allowedRole('admin'), instance.removeCategory)
        return instance
    }

    getCategoryList = async(req: AuthRequest, res: Response) =>{
        try{
            const category = await this.categoryServices.getCategoryList()
            handleSuccessResponse(res, "Category Fetched.", category)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createCategory = async(req: AuthRequest, res: Response) =>{
        try{
            const categoryInfo = req.body as CategoryInfo
            const category = await this.categoryServices.createCategory(categoryInfo)
            handleSuccessResponse(res, "Category Created.", category)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message,e.errors)
        }
    }

    updateCategory = async(req: AuthRequest, res: Response) =>{
        try{
            const {title} = req.body
            const id = req.params.id
            const category = await this.categoryServices.updateCategory(id, title)
            handleSuccessResponse(res, "Category Updated.", category)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
    removeCategory = async(req: AuthRequest, res: Response) =>{
        try{
            const {id} = req.params
            const result = await this.categoryServices.removeCategory(id)
            handleSuccessResponse(res, "Category Removed.", result)
        }catch(e: any){
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}