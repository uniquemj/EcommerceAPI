import { ImageInfo } from "./image.types"
import { DangerousGoods, WarrantyType } from "../model/variant.model"
import { Schema } from "mongoose"


export interface VariantInfo{
    _id: string,
    product:Schema.Types.ObjectId,
    images: ImageInfo[],
    color: string,
    price: number,
    size: string,
    stock: number,
    availability: boolean
    packageWeight: number,
    packageLength: string,
    dangerousGoods: DangerousGoods,
    warrantyType: WarrantyType,
    warrantyPeriod: number,
    warrantyPolicy: string
}

export interface VariantInput{
    _id?: string,
    product?: Schema.Types.ObjectId | string,
    images?: ImageInfo[],
    color?: string,
    price?: number,
    size?: string,
    stock?: number,
    availability?: boolean
    packageWeight?: number,
    packageLength?: string,
    dangerousGoods?: DangerousGoods,
    warrantyType?: WarrantyType,
    warrantyPeriod?: number,
    warrantyPolicy?: string
}