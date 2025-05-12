export interface FileInfo{
    productImages?: Express.Multer.File[],
    variantImages?: Express.Multer.File[] 
}

export interface BusinessFile{
    legal_document?: Express.Multer.File[]
}