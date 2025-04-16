import { ImageInfo } from "./image.types"
import { CategoryInfo } from "./category.types"
import { VariantInfo } from "./variants.types"
import { DangerousGoods, WarrantyType } from "../model/product/product.model"



export interface ProductInfo{
    seller?: string,
    name?: string,
    images?: ImageInfo[],
    category?: CategoryInfo[] | string,
    variant?: VariantInfo[],

    color?: string,
    price?: number | string,
    specialPrice?: number | string,
    stock?: number | string,
    sellerSKU?: string,
    availability?: boolean,

    productDescripton?: string,
    productHighlights?: string,
    packageWeight?: string | number,
    packageLength?: string,
    dangerousGoods?: DangerousGoods,
    warrantyType?: WarrantyType,
    warrantyPeriod?: string | number,
    warrantyPolicy?: string
}