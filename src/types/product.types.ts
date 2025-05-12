import { Schema } from "mongoose"
import { CategoryInfo } from "./category.types"
import { VariantInfo, VariantInput} from "./variants.types"

export enum ArchieveStatus{
    Archieve = "archieve",
    UnArchieve = "unarchieve"
}

export interface ProductInfo{
    _id:string,
    seller: Schema.Types.ObjectId,
    name: string,
    defaultVariant:Schema.Types.ObjectId,
    category: CategoryInfo[] | string,
    variants: VariantInfo[],
    productDescripton: string,
    productHighlights: string,
    isActive:boolean,
    archieveStatus: string
}

export interface ProductInputInfo{
    seller: string; 
    name: string; 
    category: CategoryInfo[] | string; 
    variants: VariantInput[]; 
    productDescripton: string; 
    productHighlights: string; 
    defaultVariant: string,
    isActive: boolean,
    archieveStatus: string
}

export interface ProductFilter{
    archieveStatus?: string
}