import { ImageInfo } from "./image.types"

export interface VariantInfo{
    _id?:string,
    product?:string,
    images?: ImageInfo[],
    color?: string,
    price?: number,
    size?: string,
    specialPrice?: number,
    stock?: number,
    sellerSKU?: string,
    availability?: boolean
}