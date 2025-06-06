import { inject, injectable } from "tsyringe";
import { CategoryRepository } from "../repository/category.repository";
import { CategoryInfo, CategoryInputInfo } from "../types/category.types";
import { paginationField } from "../types/pagination.types";
import { CategoryRepositoryInterface } from "../types/repository.types";
import createHttpError from "../utils/httperror.utils";
import { buildCategoryTree } from "../utils/helper.utils";

@injectable()
export class CategoryServices {

    constructor(@inject('CategoryRepositoryInterface') private readonly categoryRepository: CategoryRepositoryInterface) { }

    getCategoryList = async (pagination: paginationField) => {
        const category = await this.categoryRepository.getCategoryList(pagination)

        const count = await this.categoryRepository.getCategoryCount()
        return {count, category}
    }

    getCategoryByTitle = async (title: string) => {
        const result = await this.categoryRepository.getCategoryByTitle(title)
        if (!result) {
            throw createHttpError.NotFound("Category doesn't exist.")
        }
        return result
    }

    getCategoryTree = async(pagination: paginationField) =>{
        const categories = await this.categoryRepository.getAllCategoryList({page: 0, limit: 0})
        const tree = buildCategoryTree(categories)

        const {page = 1, limit=10} = pagination
        const start = (page - 1) * limit
        const end = start + limit
        const paginatedTree = tree.slice(start, end)
        return paginatedTree
    }

    getCategoryById = async (id: string) => {
        const result = await this.categoryRepository.getCategoryById(id)
        if (!result) {
            throw createHttpError.NotFound("Category with Id doesn't exist.")
        }
        return result
    }

    createCategory = async (categoryInfo: CategoryInputInfo) => {
        const { title, parent_category } = categoryInfo

        let categoryDetail:CategoryInputInfo = {
            title: title.toLowerCase()
        }
        
        if(parent_category?.length as number > 0){
            categoryDetail['parent_category'] = parent_category
        }

        const categoryExist = await this.categoryRepository.getCategoryByTitle(categoryDetail.title)
        if (categoryExist) {
            return categoryExist
        }
        const category = await this.categoryRepository.createCategory(categoryDetail)
        return category
    }

    updateCategory = async (id: string, info: Partial<CategoryInputInfo>) => {
        const categoryExist = await this.categoryRepository.getCategoryById(id)
        if (!categoryExist) {
            throw createHttpError.NotFound("Category with id does not exist.")
        }
        const categoryInfo = {
            title: info.title!.toLowerCase() as string,
            ...info
        }
        const result = await this.categoryRepository.updateCategory(id, categoryInfo)
        return result
    }

    removeCategory = async (id: string) => {
        const categoryExist = await this.categoryRepository.getCategoryById(id)
        if (!categoryExist) {
            throw createHttpError.NotFound("Category with Id not found.")
        }
        const result = await this.categoryRepository.removeCategory(id)
        return result
    }
}