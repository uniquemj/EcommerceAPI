import { injectable } from "tsyringe";
import Category from "../model/category.model";
import {CategoryInfo, CategoryInputInfo } from "../types/category.types";
import { paginationField } from "../types/pagination.types";
import { CategoryRepositoryInterface } from "../types/repository.types";


@injectable()
export class CategoryRepository implements CategoryRepositoryInterface{

    async getCategoryList(pagination: paginationField): Promise<CategoryInfo[]>{
        return await Category.find({})
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .populate('parent_category', 'title parent_category')
    }

    async getCategoryCount(): Promise<number>{
        return await Category.countDocuments()
    }

    async getCategoryByTitle(title: string): Promise<CategoryInfo | null>{
        return await Category.findOne({title: title})
        .populate('parent_category', 'title parent_category')
    }

    async getCategoryById(id: string): Promise<CategoryInfo | null>{
        return await Category.findById(id)
        .populate('parent_category', 'title parent_category')
    }

    async createCategory(categoryInfo: CategoryInputInfo): Promise<CategoryInfo>{
        return await Category.create(categoryInfo)
    }

    async updateCategory(id: string, categoryInfo: Partial<CategoryInputInfo>): Promise<CategoryInfo | null>{
        return await Category.findByIdAndUpdate(id, categoryInfo)
    }

    async removeCategory(id: string): Promise<CategoryInfo | null>{
        return await Category.findByIdAndDelete(id)
    }
}