import { ImageInfo } from "./image.types"
import { CategoryInfo } from "./category.types"
import { VariantInfo } from "./variants.types"

export interface ProductInfo{
    _id?:string,
    seller?: string,
    name?: string,
    images?: ImageInfo[],
    category?: CategoryInfo[] | string,
    variants?: VariantInfo[],
    productDescripton?: string,
    productHighlights?: string,
}