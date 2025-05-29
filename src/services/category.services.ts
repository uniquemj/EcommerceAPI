import { inject, injectable } from "tsyringe";
import { CategoryRepository } from "../repository/category.repository";
import { CategoryInfo, CategoryInputInfo } from "../types/category.types";
import { paginationField } from "../types/pagination.types";
import { CategoryRepositoryInterface } from "../types/repository.types";
import createHttpError from "../utils/httperror.utils";

@injectable()
export class CategoryServices {

    constructor(@inject('CategoryRepositoryInterface') private readonly categoryRepository: CategoryRepositoryInterface) { }

    getCategoryList = async (pagination: paginationField) => {
        const category = await this.categoryRepository.getCategoryList(pagination)
        if (category && category.length == 0) {
            throw createHttpError.NotFound("Category List is Empty.")
        }
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