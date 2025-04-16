import Category from "../../model/category/category.model";


export class CategoryRepository{

    async getCategoryList(){
        return await Category.find({})
    }

    async getCategory(name: string){
        return await Category.findOne({name: name})
    }

    async getCategoryById(id: string){
        return await Category.findById(id)
    }

    async createCategoryList(name: string){
        return await Category.create({name: name})
    }

    async removeCategory(id: string){
        return await Category.findByIdAndDelete(id)
    }
}