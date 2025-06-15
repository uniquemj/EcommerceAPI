import { Schema } from "mongoose"
import { CategoryInfo } from "./category.types"
import { VariantInfo, VariantInput } from "./variants.types"
import { DangerousGoods, WarrantyType } from "../model/product.model";

export enum ArchieveStatus {
    Archieve = "archieve",
    UnArchieve = "unarchieve"
}

export interface ProductInfo {
    _id: string,
    seller: Schema.Types.ObjectId,
    name: string,
    defaultVariant: Schema.Types.ObjectId,
    category: Schema.Types.ObjectId,
    variants: VariantInput[] | VariantInfo[],
    productDescription: string,
    productHighlights: string,
    isActive: boolean,
    archieveStatus: string,
    dangerousGoods: DangerousGoods,
    warrantyType: WarrantyType,
    warrantyPeriod: number,
    warrantyPolicy: string,
    featured: boolean
}

export interface ProductInputInfo {
    seller: string;
    name: string;
    category: string;
    variants: VariantInput[];
    productDescription: string;
    productHighlights: string;
    defaultVariant: string,
    isActive: boolean,
    archieveStatus: string,
    dangerousGoods: DangerousGoods,
    warrantyType: WarrantyType,
    warrantyPeriod: number,
    warrantyPolicy: string,
    featured: boolean
}

export interface ProductFilter {
    archieveStatus?: string
}

export interface CountFilter extends ProductFilter {
    seller?: string,
    isActive?: boolean
}

export interface searchFilter {
    keyword?: string,//name, description, store_name
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    page?: number,
    limit?: number,
    sortBy?:string,
}