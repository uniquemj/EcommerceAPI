export interface ProductFileInfo{
    variantImages?: Express.Multer.File[] 
}

export interface SellerFile{
    legal_document?: Express.Multer.File[],
    store_logo?: Express.Multer.File[]
}

export enum FileType{
    Variants = 'variants',
    LegalDocument = "legal-document",
    StoreLogo = 'store-logo'
}

export interface FileInfo{
    _id: string,
    original_name: string,
    type: string,
    size: number,
    blob_path: string,
    url: string
}