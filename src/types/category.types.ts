import { Schema } from "mongoose";


export interface CategoryInfo{
    _id?: string,
    title: string,
    parent_category: Schema.Types.ObjectId
}

export interface CategoryInputInfo{
    title: string,
    parent_category?:string
}

export interface CategoryTreeInfo{
    category: CategoryInfo,
    children?: CategoryTreeInfo[]
}