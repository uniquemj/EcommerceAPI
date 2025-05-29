import {Request, Response, Router} from 'express'
import { CategoryServices } from '../services/category.services';
import createHttpError from '../utils/httperror.utils';
import { allowedRole } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validation.middleware';
import { categorySchema, updateCategorySchema } from '../validation/category.validate';
import { AuthRequest } from '../types/auth.types';
import { CategoryInfo } from '../types/category.types';
import { handleSuccessResponse } from '../utils/httpresponse.utils';
import Logger from '../utils/logger.utils';
import winston from 'winston';

export class CategoryController{
    readonly router: Router;
    private static instance: CategoryController;
    private readonly logger: winston.Logger;

    private constructor(private readonly categoryServices: CategoryServices, logger: Logger){
        this.router = Router()
        this.logger = logger.logger()
    }

    static initController(categoryServices: CategoryServices, logger: Logger){
        if(!CategoryController.instance){
            CategoryController.instance = new CategoryController(categoryServices, logger)
        }
        const instance = CategoryController.instance

        instance.router.get('/', allowedRole('customer','seller', 'admin'),instance.getCategoryList)
        instance.router.get('/:id', allowedRole('admin'), instance.getCategoryById)
        instance.router.post('/', allowedRole('admin'),validate(categorySchema), instance.createCategory)
        instance.router.put('/:id', allowedRole('admin'), validate(updateCategorySchema),instance.updateCategory)
        instance.router.delete('/:id', allowedRole('admin'), instance.removeCategory)
        return instance
    }

    getCategoryList = async(req: AuthRequest, res: Response) =>{
        try{
            const page = req.query.page || 1
            const limit = req.query.limit || 10
            const category = await this.categoryServices.getCategoryList({page: parseInt(page as string), limit: parseInt(limit as string)})

            const paginationData = {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total_items: category.count,
                total_pages: Math.ceil(category.count / parseInt(limit as string)),
            }

            handleSuccessResponse(res, "Category List Fetched.", category.category, 200, paginationData)
        }catch(e: any){
            this.logger.error("Error while fetching Category list.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    getCategoryById = async(req: AuthRequest, res: Response) =>{
        try{
            const categoryId = req.params.id
            const category = await this.categoryServices.getCategoryById(categoryId)
            handleSuccessResponse(res, "Category Fetched.", category)
        }catch(e:any){
            this.logger.error("Error while fetching category by id.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    createCategory = async(req: AuthRequest, res: Response) =>{
        try{
            const categoryInfo = req.body
            const category = await this.categoryServices.createCategory(categoryInfo)
            handleSuccessResponse(res, "Category Created.", category)
        }catch(e: any){
            this.logger.error("Error while creating category.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message,e.errors)
        }
    }

    updateCategory = async(req: AuthRequest, res: Response) =>{
        try{
            const categoryInfo = req.body
            const id = req.params.id
            const category = await this.categoryServices.updateCategory(id, categoryInfo)
            handleSuccessResponse(res, "Category Updated.", category)
        }catch(e: any){
            this.logger.error("Error while updating Category.", {object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }

    removeCategory = async(req: AuthRequest, res: Response) =>{
        try{
            const {id} = req.params
            const result = await this.categoryServices.removeCategory(id)
            handleSuccessResponse(res, "Category Removed.", result)
        }catch(e: any){
            this.logger.error("Error while removing category.",{object: e, error: new Error()})
            throw createHttpError.Custom(e.statusCode, e.message, e.errors)
        }
    }
}