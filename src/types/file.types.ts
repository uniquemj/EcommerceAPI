export interface FileInfo{
    productImages?: Express.Multer.File[],
    variantImages?: Express.Multer.File[] 
}

export interface BusinessFile{
    legal_document?: Express.Multer.File[]
}

export enum FileType{
    Variants = 'variants',
    LegalDocument = "legal-document"
}

export interface FileInfo{
    _id: string,
    original_name: string,
    type: string,
    size: number,
    blob_path: string,
    url: string
}