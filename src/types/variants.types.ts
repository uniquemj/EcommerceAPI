import { ImageInfo } from "./image.types"
import { DangerousGoods, WarrantyType } from "../model/variant/variant.model"


export interface VariantInfo{
    _id?:string,
    product?:string,
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