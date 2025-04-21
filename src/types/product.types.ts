import { ImageInfo } from "./image.types"
import { CategoryInfo } from "./category.types"
import { VariantInfo } from "./variants.types"
import { DangerousGoods, WarrantyType } from "../model/product/product.model"



export interface ProductInfo{
    _id?:string,
    seller?: string,
    name?: string,
    images?: ImageInfo[],
    category?: CategoryInfo[] | string,
    variants?: VariantInfo[],

    price?: number,
    specialPrice?: number,
    stock?: number,
    sellerSKU?: string,
    availability?: boolean,

    productDescripton?: string,
    productHighlights?: string,
    packageWeight?: number,
    packageLength?: string,
    dangerousGoods?: DangerousGoods,
    warrantyType?: WarrantyType,
    warrantyPeriod?: number,
    warrantyPolicy?: string
}