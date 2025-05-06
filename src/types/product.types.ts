import { CategoryInfo } from "./category.types"
import { VariantInfo } from "./variants.types"

export enum ArchieveStatus{
    Archieve = "archieve",
    UnArchieve = "unarchieve"
}

export interface ProductInfo{
    _id?:string,
    seller?: string,
    name?: string,
    defaultVariant?:string,
    category?: CategoryInfo[] | string,
    variants?: VariantInfo[],
    productDescripton?: string,
    productHighlights?: string,
    isActive?:boolean,
    archieveStatus?: string
}

export interface ProductFilter{
    archieveStatus?: string
}