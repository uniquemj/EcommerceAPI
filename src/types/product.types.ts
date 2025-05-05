import { ImageInfo } from "./image.types"
import { CategoryInfo } from "./category.types"
import { VariantInfo } from "./variants.types"

export enum ProductAvailable{
    Available = 'available',
    NotAvaialble = 'not-available',
    Removed = 'removed'
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
    productAvailability?: ProductAvailable
}

export interface ProductFilter{
    productAvailability?: ProductAvailable
}