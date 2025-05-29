import { ImageInfo } from "./image.types"
import { Schema } from "mongoose"


export interface VariantInfo{
    _id: string,
    product:Schema.Types.ObjectId,
    images: Schema.Types.ObjectId,
    color: string,
    price: number,
    size: string,
    stock: number,
    availability: boolean
    packageWeight: number,
    packageLength: string
}

export interface VariantInput{
    _id?: string,
    product?: Schema.Types.ObjectId | string,
    images?: string,
    color?: string,
    price?: number,
    size?: string,
    stock?: number,
    availability?: boolean
    packageWeight?: number,
    packageLength?: string
}