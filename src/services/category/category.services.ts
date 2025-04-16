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

    createCategory = async(name: string) =>{
        try{
            const categoryExist = await this.categoryRepository.getCategory(name.toLowerCase()) as unknown as CategoryInfo
            if(categoryExist){
                return categoryExist
            }
            const category = await this.categoryRepository.createCategoryList(name.toLowerCase())
            return category
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