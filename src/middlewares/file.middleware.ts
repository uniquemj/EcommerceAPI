import multer from 'multer'
import { FileFilterCallback } from 'multer'
import fs from 'fs'
import path from 'path'

const storage = multer.diskStorage({
    destination:(req, file, cb) =>{
        if(file.fieldname == 'productImages'){
            const path = './uploads/products'
            fs.mkdirSync(path, {recursive: true})
            cb(null, path)
        } else if(file.fieldname == 'variantImages'){
            const path = './uploads/variants'
            fs.mkdirSync(path, {recursive: true})
            cb(null, path)
        }
    },
    filename: (req, file, cb) =>{
        cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    }
})

const checkImage = (file: Express.Multer.File, cb: FileFilterCallback) =>{
    const imageTypes = /.jpg|.jpeg|.png/
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase())
    if(extname){
        return cb(null, true);
    }else{
        cb(new Error("Error: Invalid Image."));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) =>{
        checkImage(file, cb)
    },
    limits: {
        fileSize: 1024*1024*10
    }
})

export default upload