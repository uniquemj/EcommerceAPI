import Category from "../model/category.model";
import { CategoryInfo } from "../types/category.types";


export class CategoryRepository{

    async getCategoryList(){
        return await Category.find({}).populate('parent_category', 'title parent_category')
    }

    async getCategoryByTitle(title: string){
        return await Category.findOne({title: title}).populate('parent_category', 'title parent_category')
    }

    async getCategoryById(id: string){
        return await Category.findById(id).populate('parent_category', 'title parent_category')
    }

    async createCategory(categoryInfo: CategoryInfo){
        return await Category.create(categoryInfo)
    }

    async updateCategory(id: string, categoryInfo: CategoryInfo){
        return await Category.findByIdAndUpdate(id, categoryInfo)
    }

    async removeCategory(id: string){
        return await Category.findByIdAndDelete(id)
    }
}