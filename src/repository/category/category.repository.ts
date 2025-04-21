import Category from "../../model/category/category.model";
import { CategoryInfo } from "../../types/category.types";


export class CategoryRepository{

    async getCategoryList(){
        return await Category.find({})
    }

    async getCategory(title: string){
        return await Category.findOne({title: title})
    }

    async getCategoryById(id: string){
        return await Category.findById(id)
    }

    async createCategory(title: string){
        return await Category.create({title: title})
    }

    async updateCategory(id: string, categoryInfo: CategoryInfo){
        return await Category.findByIdAndUpdate(id, categoryInfo)
    }

    async removeCategory(id: string){
        return await Category.findByIdAndDelete(id)
    }
}