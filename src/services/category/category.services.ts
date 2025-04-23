import { CategoryRepository } from "../../repository/category/category.repository";
import { CategoryInfo } from "../../types/category.types";
import createHttpError from "../../utils/httperror.utils";

export class CategoryServices{
    private readonly categoryRepository: CategoryRepository;

    constructor(){
        this.categoryRepository = new CategoryRepository()
    }

    getCategoryList = async() =>{
        try{
            const category = await this.categoryRepository.getCategoryList()
            if(category.length == 0){
                throw createHttpError.NotFound("Category List is Empty.")
            }
            return category
        }catch(error){
            throw error
        }
    }

    createCategory = async(categoryInfo: CategoryInfo) =>{
        try{
            const {title, parent_category} = categoryInfo

            const categoryDetail = {
                title: title.toLowerCase(),
                parent_category: parent_category
            }

            const categoryExist = await this.categoryRepository.getCategory(categoryDetail.title) as unknown as CategoryInfo
            if(categoryExist){
                return categoryExist
            }
            const category = await this.categoryRepository.createCategory(categoryDetail)
            return category
        }catch(error){
            throw error
        }
    }

    updateCategory = async(id: string, title: string) =>{
        try{
            const categoryExist = await this.categoryRepository.getCategoryById(id)
            if(!categoryExist){
                throw createHttpError.NotFound("Category with id does not exist.")
            }
            const categoryInfo = {
                title: title.toLowerCase()
            }
            const result = await this.categoryRepository.updateCategory(id,categoryInfo)
            return result
        }catch(error){
            throw error
        }
    }

    removeCategory = async(id: string) =>{
        try{
            const categoryExist = await this.categoryRepository.getCategoryById(id)
            if(!categoryExist){
                throw createHttpError.NotFound("Category with Id not found.")
            }
            const result = await this.categoryRepository.removeCategory(id)
            return result
        }catch(error){
            throw error
        }
    }
}